import { processS3Video, processVideoTranscription } from "./dubService";
import { mergeVideoAndAudio } from "./audioHelpers";
import { deleteFromS3 } from "./../s3Service";
import fs from "fs";
import path from "path";

/**
 * Validates that an S3 URL is provided
 * @param s3Url The S3 URL to validate
 * @throws Error if the URL is not provided
 */
export const validateS3Url = (s3Url: string | undefined): void => {
  if (!s3Url) {
    throw new Error("S3 URL is required");
  }
};

/**
 * Processes an S3 video by invoking the audio removal Lambda
 * @param s3Url The S3 URL of the video to process
 * @returns The processed video URL
 */
export const processVideo = async (
  s3Url: string
): Promise<string | undefined> => {
  const { processedVideoUrl } = await processS3Video(s3Url);
  return processedVideoUrl;
};

/**
 * Transcribes a video and gets word timing data
 * @param s3Url The S3 URL of the video to transcribe
 * @param targetLanguage The target language for translation
 * @param voiceGender The voice gender for audio synthesis
 * @returns Object containing transcription results including audio file path
 */
export const transcribeVideo = async (
  s3Url: string,
  targetLanguage = "en",
  voiceGender = "female"
) => {
  const {
    transcriptionText,
    transcriptionFilePath,
    translatedTranscriptionFilePath,
    audioFilePath,
  } = await processVideoTranscription(s3Url, targetLanguage, voiceGender);

  return {
    transcriptionText,
    transcriptionFilePath,
    translatedTranscriptionFilePath,
    audioFilePath,
  };
};

/**
 * Merges video and audio files
 * @param processedVideoUrl The URL of the processed video
 * @param audioFilePath The path to the audio file
 * @returns The merged video S3 URL or undefined if merging failed
 */
export const mergeVideoAndAudioFiles = async (
  processedVideoUrl: string | undefined,
  audioFilePath: string | undefined
): Promise<string | undefined> => {
  if (!processedVideoUrl || !audioFilePath) {
    return undefined;
  }

  return await mergeVideoAndAudio(processedVideoUrl, audioFilePath);
};

/**
 * Extracts the S3 key from an S3 URL
 * @param s3Url The S3 URL
 * @returns The S3 key
 * @throws Error if the URL is invalid
 */
export const extractS3KeyFromUrl = (s3Url: string): string => {
  const url = new URL(s3Url);
  // Extract key from the URL path, removing the leading slash
  return url.pathname.substring(1);
};

/**
 * Deletes an S3 object
 * @param s3Url The S3 URL of the object to delete
 * @returns Promise that resolves when deletion is complete
 */
export const deleteS3Object = async (s3Url: string): Promise<void> => {
  try {
    const key = extractS3KeyFromUrl(s3Url);
    await deleteFromS3(key);
    console.log(`Successfully deleted original S3 object: ${key}`);
  } catch (deleteError) {
    console.error("Error deleting original S3 object:", deleteError);
    // Don't re-throw to allow caller to continue with the response
  }
};

/**
 * Handles errors that occur during S3 URL processing
 * @param error The error that occurred
 * @param res Express response object
 */
export const handleS3ProcessingError = (error: any, res: any) => {
  console.error("Error processing S3 URL:", error);

  // Handle validation errors specifically
  if (error.message === "S3 URL is required") {
    return res.status(400).json({
      message: error.message,
      success: false,
    });
  }

  // Handle other errors
  return res.status(500).json({
    message: "Internal server error",
    success: false,
  });
};

/**
 * Deletes the downloads folder and all its contents
 */
export const deleteDownloadsFolder = (): void => {
  try {
    const downloadsDir = path.join(__dirname, "downloads");
    if (fs.existsSync(downloadsDir)) {
      fs.rmSync(downloadsDir, { recursive: true, force: true });
      console.log(`Successfully deleted downloads folder: ${downloadsDir}`);
    }
  } catch (error) {
    console.error("Error deleting downloads folder:", error);
    // Don't re-throw to allow caller to continue with the response
  }
};
