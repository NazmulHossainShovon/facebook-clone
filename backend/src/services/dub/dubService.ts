import ytdl from "@distube/ytdl-core";
import {
  validateYoutubeUrlFormat,
  validateYoutubeUrl,
  fetchVideoInfo,
  selectVideoFormat,
  downloadAndStreamToS3,
} from "./youtubeService";
import {
  downloadVideoFromS3,
  processTranscription,
  saveTranscriptionResults,
  cleanupLocalFile,
} from "./transcriptionProcessor";
import { generateS3Key } from "../s3Service";
import { invokeAudioRemovalLambda } from "../lambdaService";
import dotenv from "dotenv";

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
 * Processes the YouTube video download by streaming directly to S3
 * @param youtubeUrl The YouTube URL to process
 * @returns Object containing video info and S3 URL
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

  // Stream directly to S3 without storing locally
  const s3Url = await downloadAndStreamToS3(info, format, s3Key);

  // Extract bucket and key from S3 URL for Lambda invocation
  const url = new URL(s3Url);
  const bucket = url.hostname.split('.')[0];
  const key = url.pathname.substring(1);

  // Invoke the audio removal Lambda function asynchronously
  try {
    await invokeAudioRemovalLambda(bucket, key);
    console.log("Audio removal Lambda function invoked successfully");
  } catch (error) {
    console.error("Failed to invoke audio removal Lambda function:", error);
    // Note: We're not throwing the error here to avoid breaking the main flow
  }

  return { videoInfo, s3Url };
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
    // Download the file from S3 to local storage
    const localFilePath = await downloadVideoFromS3(s3Url);

    // Process the transcription
    const transcriptionData = await processTranscription(
      localFilePath,
      languageCode
    );

    // Save transcription results to files
    const {
      transcriptionFilePath,
      wordTimingDataFilePath,
      translatedTranscriptionFilePath,
      pauses,
      pauseDataFilePath,
      audioFilePath,
    } = await saveTranscriptionResults(transcriptionData, localFilePath);

    // Clean up the temporary local file
    cleanupLocalFile(localFilePath);

    return {
      transcriptionText: transcriptionData.text,
      transcriptionFilePath,
      wordTimingDataFilePath,
      translatedTranscriptionFilePath,
      pauses,
      pauseDataFilePath,
      audioFilePath,
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
      audioFilePath: undefined,
    };
  }
};
