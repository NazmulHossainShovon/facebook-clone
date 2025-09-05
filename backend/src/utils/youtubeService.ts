import ytdl from "@distube/ytdl-core";
import fs from "fs";
import path from "path";

// Interface for the request body
interface VideoInfo {
  title: string;
  lengthSeconds: string;
  formats: ytdl.videoFormat[];
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
export const fetchVideoInfo = async (youtubeUrl: string): Promise<VideoInfo> => {
  const info = await ytdl.getInfo(youtubeUrl);
  
  return {
    title: info.videoDetails.title,
    lengthSeconds: info.videoDetails.lengthSeconds,
    formats: info.formats
  };
};

/**
 * Selects the video format with fallback options
 * @param formats Available video formats
 * @returns Selected format
 */
export const selectVideoFormat = (formats: ytdl.videoFormat[]): ytdl.videoFormat => {
  let format: ytdl.videoFormat;
  
  try {
    // Try 720p webm first
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