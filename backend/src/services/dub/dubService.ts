import ytdl from "@distube/ytdl-core";
import {
  validateYoutubeUrlFormat,
  validateYoutubeUrl,
  fetchVideoInfo,
  selectVideoFormat,
  downloadAndStreamToS3,
} from "./youtubeService";
import {
  processTranscription,
  saveTranscriptionResults,
} from "./transcriptionProcessor";
import { generateS3Key } from "../s3Service";
import { invokeAudioRemovalLambda } from "../lambdaService";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config();

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
 * Processes an S3 video URL by invoking the audio removal Lambda function
 * @param s3Url The S3 URL of the video to process
 * @returns Object containing the processed video URL
 */
export const processS3Video = async (s3Url: string) => {
  try {
    // Validate that s3Url is provided
    if (!s3Url) {
      throw new Error("S3 URL is required");
    }

    // Extract bucket and key from S3 URL for Lambda invocation
    const url = new URL(s3Url);
    const bucket = url.hostname.split(".")[0];
    const key = url.pathname.substring(1);

    // Invoke the audio removal Lambda function and get the processed video URL
    const processedVideoUrl = await invokeAudioRemovalLambda(bucket, key).catch(
      (error) => {
        console.error("Failed to invoke audio removal Lambda function:", error);
        // Note: We're not throwing the error here to avoid breaking the main flow
        return undefined;
      }
    );

    if (processedVideoUrl) {
      console.log("Audio removal Lambda function processed successfully");
    }

    return { processedVideoUrl };
  } catch (error) {
    console.error("Error processing S3 video:", error);
    throw error;
  }
};

/**
 * Processes the YouTube video download by streaming directly to S3
 * @param youtubeUrl The YouTube URL to process
 * @returns Object containing video info and S3 URLs
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
  const bucket = url.hostname.split(".")[0];
  const key = url.pathname.substring(1);

  // Invoke the audio removal Lambda function and get the processed video URL
  const processedVideoUrl = await invokeAudioRemovalLambda(bucket, key).catch(
    (error) => {
      console.error("Failed to invoke audio removal Lambda function:", error);
      // Note: We're not throwing the error here to avoid breaking the main flow
      return undefined;
    }
  );

  if (processedVideoUrl) {
    console.log("Audio removal Lambda function processed successfully");
  }

  return { videoInfo, s3Url, processedVideoUrl };
};

/**
 * Transcribes the downloaded video and saves word timing data
 * @param s3Url URL of the video file in S3
 * @param targetLanguage Target language for translation
 * @param voiceGender Voice gender for audio synthesis
 * @returns Object containing transcription text, file path, and word timing data file path
 */
export const processVideoTranscription = async (
  s3Url: string,
  targetLanguage = "en",
  voiceGender = "female"
): Promise<{
  transcriptionText: string | undefined;
  transcriptionFilePath: string | undefined;
  translatedTranscriptionFilePath: string | undefined;
  pauses: any[] | undefined;
  pauseDataFilePath: string | undefined;
  audioFilePath: string | undefined; // Added audio file path to return object
}> => {
  console.log("Starting video transcription with word timing data...");
  try {
    // Process the transcription directly using the S3 URL
    const transcriptionData = await processTranscription(s3Url);

    // For saving results to files, we still need a local file path for naming
    // We'll create a temporary path based on the S3 URL
    const s3Key = extractS3Key(s3Url);
    const fileName = path.basename(s3Key);
    const tempLocalFilePath = path.join(__dirname, "downloads", fileName);

    // Save transcription results to files
    const {
      transcriptionFilePath,
      translatedTranscriptionFilePath,
      pauses,
      pauseDataFilePath,
      audioFilePath,
    } = await saveTranscriptionResults(
      transcriptionData,
      tempLocalFilePath,
      targetLanguage,
      voiceGender
    );

    return {
      transcriptionText: transcriptionData.text,
      transcriptionFilePath,
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
      translatedTranscriptionFilePath: undefined,
      pauses: undefined,
      pauseDataFilePath: undefined,
      audioFilePath: undefined,
    };
  }
};
