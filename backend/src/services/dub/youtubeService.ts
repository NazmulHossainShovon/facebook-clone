import ytdl from "@distube/ytdl-core";
import fs from "fs";
import path from "path";
import { uploadStreamToS3 } from "../s3Service";

// Interface for the request body
interface VideoInfo {
  title: string;
  lengthSeconds: string;
  formats: ytdl.videoFormat[];
  languageCode?: string; // Add language code property
}

/**
 * Validates YouTube URL format
 * @param youtubeUrl The YouTube URL to validate
 * @returns True if valid, false otherwise
 */
export const validateYoutubeUrlFormat = (youtubeUrl: string): boolean => {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
  return youtubeRegex.test(youtubeUrl);
};

/**
 * Validates YouTube URL with ytdl-core
 * @param youtubeUrl The YouTube URL to validate
 * @returns True if valid, false otherwise
 */
export const validateYoutubeUrl = (youtubeUrl: string): boolean => {
  return ytdl.validateURL(youtubeUrl);
};

/**
 * Fetches video info from YouTube
 * @param youtubeUrl The YouTube URL
 * @returns Video info object
 */
export const fetchVideoInfo = async (
  youtubeUrl: string
): Promise<VideoInfo> => {
  const info = await ytdl.getInfo(youtubeUrl);

  // Try to detect language from caption tracks
  const languageCode: string | undefined =
    info.player_response.captions?.playerCaptionsTracklistRenderer
      ?.captionTracks?.[0]?.languageCode;

  return {
    title: info.videoDetails.title,
    lengthSeconds: info.videoDetails.lengthSeconds,
    formats: info.formats,
    languageCode,
  };
};

/**
 * Selects the video format with fallback options
 * @param formats Available video formats
 * @returns Selected format
 */
export const selectVideoFormat = (
  formats: ytdl.videoFormat[]
): ytdl.videoFormat => {
  let format: ytdl.videoFormat;

  try {
    // Try highest quality with audio first (for transcription we need audio)
    format = ytdl.chooseFormat(formats, {
      filter: "audioandvideo",
      quality: "highest",
    });
  } catch {
    try {
      // Fallback to 720p mp4 with audio
      format = ytdl.chooseFormat(formats, {
        filter: "audioandvideo",
        quality: "136",
      });
    } catch {
      try {
        // Fallback to any format with audio
        format = ytdl.chooseFormat(formats, { filter: "audioandvideo" });
      } catch {
        try {
          // Try 720p webm with audio
          format = ytdl.chooseFormat(formats, { quality: "247" });
        } catch {
          try {
            // Fallback to 720p mp4
            format = ytdl.chooseFormat(formats, { quality: "136" });
          } catch {
            try {
              // Fallback to highest quality available
              format = ytdl.chooseFormat(formats, { quality: "highest" });
            } catch {
              // Last resort - any video format
              format = ytdl.chooseFormat(formats, { filter: "videoonly" });
            }
          }
        }
      }
    }
  }

  return format;
};

/**
 * Creates the file path for the downloaded video
 * @param title Video title
 * @param container File container format
 * @returns Full file path
 */
export const createFilePath = (title: string, container: string): string => {
  // Create downloads directory if it doesn't exist
  const downloadsDir = path.join(__dirname, "downloads");
  if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
  }

  // Clean the video title for filename (remove special characters)
  const cleanTitle = title
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "_")
    .substring(0, 100); // Limit filename length

  // Create output file path
  return path.join(downloadsDir, `${cleanTitle}.${container}`);
};

/**
 * Downloads the video from YouTube and streams it directly to S3 without saving the entire file locally
 * This approach saves disk space by not storing the complete file
 * @param info Video info object
 * @param format Selected format
 * @param s3Key S3 key for the uploaded file
 * @returns Promise that resolves with the S3 URL when upload is complete
 */
export const downloadAndStreamToS3 = async (
  info: ytdl.videoInfo,
  format: ytdl.videoFormat,
  s3Key: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Create download stream from YouTube
      const downloadStream = ytdl.downloadFromInfo(info, { format });

      // Set content type based on format
      const contentType =
        format.container === "mp4" ? "video/mp4" : "video/webm";

      // Stream directly to S3
      uploadStreamToS3(downloadStream, s3Key, contentType)
        .then(resolve)
        .catch(reject);
    } catch (error: any) {
      reject(new Error(`Error processing video: ${error.message}`));
    }
  });
};

/**
 * Downloads the video from YouTube to local storage first, then uploads it to S3
 * This approach avoids stream splitting issues and ensures both operations complete successfully
 * @param info Video info object
 * @param format Selected format
 * @param s3Key S3 key for the uploaded file
 * @param localFilePath Local file path for temporary storage
 * @returns Promise that resolves with the S3 URL when upload is complete
 */
export const downloadAndUploadVideo = async (
  info: ytdl.videoInfo,
  format: ytdl.videoFormat,
  s3Key: string,
  localFilePath: string
): Promise<{ s3Url: string; localFilePath: string }> => {
  return new Promise((resolve, reject) => {
    try {
      // First, download the video to local storage
      const localWriteStream = fs.createWriteStream(localFilePath);

      // Create download stream from YouTube
      const downloadStream = ytdl.downloadFromInfo(info, { format });
      downloadStream.pipe(localWriteStream);

      // Handle download completion
      localWriteStream.on("finish", async () => {
        try {
          // After download completes, upload to S3
          const readStream = fs.createReadStream(localFilePath);
          const contentType =
            format.container === "mp4" ? "video/mp4" : "video/webm";

          const s3Url = await uploadStreamToS3(readStream, s3Key, contentType);
          resolve({ s3Url, localFilePath });
        } catch (uploadError: any) {
          reject(
            new Error(`Error uploading video to S3: ${uploadError.message}`)
          );
        }
      });

      // Handle download errors
      localWriteStream.on("error", (error: Error) => {
        reject(new Error(`Error saving video file locally: ${error.message}`));
      });

      downloadStream.on("error", (error: Error) => {
        reject(new Error(`Error downloading video: ${error.message}`));
      });
    } catch (error: any) {
      reject(new Error(`Error processing video: ${error.message}`));
    }
  });
};

/**
 * Downloads the video from YouTube
 * @param info Video info object
 * @param format Selected format
 * @param outputPath Output file path
 * @returns Promise that resolves when download is complete
 */
export const downloadVideo = (
  info: ytdl.videoInfo,
  format: ytdl.videoFormat,
  outputPath: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Create a write stream to save the video file
    const outputStream = fs.createWriteStream(outputPath);

    // Download the video file
    const downloadStream = ytdl.downloadFromInfo(info, { format });
    downloadStream.pipe(outputStream);

    // Handle download completion
    outputStream.on("finish", () => {
      resolve();
    });

    // Handle download errors
    outputStream.on("error", (error) => {
      reject(new Error("Error saving video file"));
    });

    downloadStream.on("error", (error) => {
      reject(new Error("Error downloading video"));
    });
  });
};
