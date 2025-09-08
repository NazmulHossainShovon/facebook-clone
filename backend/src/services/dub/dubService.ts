import ytdl from "@distube/ytdl-core";
import {
  validateYoutubeUrlFormat,
  validateYoutubeUrl,
  fetchVideoInfo,
  selectVideoFormat,
  downloadAndUploadVideo,
} from "./youtubeService";
import {
  transcribeVideo,
  getTranscriptionResult,
  saveTranscriptionToFile,
  savePauseDataToFile,
} from "./transcriptionService";
import {
  saveWordTimingDataToFile,
  translateTranscriptionTextToFile,
  detectPauses,
} from "./dubHelpers";
import { createAudioFromTranslatedText } from "./audioHelpers";
import { generateS3Key, downloadFromS3 } from "../s3Service";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Load environment variables
dotenv.config();

/**
 * Validates the YouTube URL from the request
 * @param youtubeUrl The YouTube URL to validate
 * @throws Error if validation fails
 */
export const validateRequest = (youtubeUrl: string): void => {
  // Validate that youtubeUrl is provided
  if (!youtubeUrl) {
    throw new Error("YouTube URL is required");
  }

  // Validate YouTube URL format
  if (!validateYoutubeUrlFormat(youtubeUrl)) {
    throw new Error("Invalid YouTube URL format");
  }

  // Validate YouTube URL with ytdl-core
  if (!validateYoutubeUrl(youtubeUrl)) {
    throw new Error("Invalid YouTube URL");
  }
};

/**
 * Processes the YouTube video download by first downloading locally then uploading to S3
 * @param youtubeUrl The YouTube URL to process
 * @returns Object containing video info, S3 URL, and local file path
 */
export const processVideoDownload = async (youtubeUrl: string) => {
  // Get video info from YouTube
  const videoInfo = await fetchVideoInfo(youtubeUrl);

  // Convert back to ytdl.videoInfo for compatibility with downloadFromInfo
  const info = await ytdl.getInfo(youtubeUrl);

  // Select the video format and quality with fallback options (prioritizing formats with audio)
  const format = selectVideoFormat(videoInfo.formats);

  // Generate S3 key for the video
  const s3Key = await generateS3Key("videos");

  // Create temporary local file path
  const localFilePath = `/tmp/${Date.now()}_${videoInfo.title
    .replace(/[^\w\s-]/g, "")
    .substring(0, 50)}.${format.container}`;

  // Download the video locally and then upload to S3
  const { s3Url, localFilePath: finalLocalPath } = await downloadAndUploadVideo(
    info,
    format,
    s3Key,
    localFilePath
  );

  return { videoInfo, s3Url, localFilePath: finalLocalPath };
};

/**
 * Extracts the S3 key from an S3 URL
 * @param s3Url The full S3 URL
 * @returns The S3 key
 */
const extractS3Key = (s3Url: string): string => {
  // S3 URL format: https://bucket.s3.region.amazonaws.com/key
  const url = new URL(s3Url);
  // Remove the leading slash from the pathname to get the key
  return url.pathname.substring(1);
};

/**
 * Transcribes the downloaded video and saves word timing data
 * @param s3Url URL of the video file in S3
 * @param languageCode Language code for transcription
 * @returns Object containing transcription text, file path, and word timing data file path
 */
export const processVideoTranscription = async (
  s3Url: string,
  languageCode?: string
): Promise<{
  transcriptionText: string | undefined;
  transcriptionFilePath: string | undefined;
  wordTimingDataFilePath: string | undefined;
  translatedTranscriptionFilePath: string | undefined;
  pauses: any[] | undefined;
  pauseDataFilePath: string | undefined;
  audioFilePath: string | undefined; // Added audio file path to return object
}> => {
  console.log("Starting video transcription with word timing data...");
  try {
    // Extract the S3 key from the URL
    const s3Key = extractS3Key(s3Url);
    
    // Create a temporary local file path for the downloaded video
    const fileName = path.basename(s3Key);
    const localFilePath = `/tmp/${Date.now()}_${fileName}`;
    
    // Download the file from S3 to local storage
    console.log(`Downloading file from S3: ${s3Key}`);
    await downloadFromS3(s3Key, localFilePath);
    console.log(`File downloaded to: ${localFilePath}`);

    const transcriptionId = await transcribeVideo(localFilePath, languageCode);
    const transcriptionData = await getTranscriptionResult(transcriptionId);

    // Save the transcription text to a file
    const transcriptionFilePath = saveTranscriptionToFile(
      transcriptionData.text || "",
      localFilePath
    );

    // Save word timing data to a JSON file
    const wordTimingDataFilePath = saveWordTimingDataToFile(
      transcriptionData.words,
      localFilePath
    );

    // Translate the full transcription text and save to a text file
    const translatedTranscriptionFilePath =
      await translateTranscriptionTextToFile(transcriptionData.text, localFilePath);

    // Detect pauses in the transcription
    const pauses = detectPauses(transcriptionData.words);

    // Save pause data to a JSON file if pauses were detected
    const pauseDataFilePath =
      pauses.length > 0 ? savePauseDataToFile(pauses, localFilePath) : undefined;

    // Create audio from translated text file
    const audioFilePath = await createAudioFromTranslatedText(
      translatedTranscriptionFilePath
    );

    // Clean up the temporary local file
    try {
      fs.unlinkSync(localFilePath);
    } catch (error) {
      console.warn(`Failed to delete temporary file ${localFilePath}:`, error);
    }

    return {
      transcriptionText: transcriptionData.text,
      transcriptionFilePath,
      wordTimingDataFilePath, // Include path to word timing data file
      translatedTranscriptionFilePath, // Include path to translated transcription text file
      pauses, // Include pause data in the response
      pauseDataFilePath, // Include path to pause data file
      audioFilePath, // Include path to audio file
    };
  } catch (transcriptionError) {
    console.error("Error during transcription:", transcriptionError);
    return {
      transcriptionText: undefined,
      transcriptionFilePath: undefined,
      wordTimingDataFilePath: undefined,
      translatedTranscriptionFilePath: undefined,
      pauses: undefined,
      pauseDataFilePath: undefined,
      audioFilePath: undefined, // Include audio file path in error case
    };
  }
};
