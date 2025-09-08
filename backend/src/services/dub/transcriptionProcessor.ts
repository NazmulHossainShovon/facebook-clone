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
import { downloadFromS3 } from "../s3Service";
import fs from "fs";
import path from "path";

/**
 * Extracts the S3 key from an S3 URL
 * @param s3Url The full S3 URL
 * @returns The S3 key
 */
export const extractS3Key = (s3Url: string): string => {
  // S3 URL format: https://bucket.s3.region.amazonaws.com/key
  const url = new URL(s3Url);
  // Remove the leading slash from the pathname to get the key
  return url.pathname.substring(1);
};

/**
 * Downloads a video file from S3 to local storage
 * @param s3Url URL of the video file in S3
 * @returns Path to the downloaded local file
 */
export const downloadVideoFromS3 = async (s3Url: string): Promise<string> => {
  // Extract the S3 key from the URL
  const s3Key = extractS3Key(s3Url);
  
  // Create downloads directory if it doesn't exist
  const downloadsDir = path.join(__dirname, "downloads");
  if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
  }
  
  // Create a local file path for the downloaded video in the downloads directory
  const fileName = path.basename(s3Key);
  const localFilePath = path.join(downloadsDir, `${Date.now()}_${fileName}`);
  
  // Download the file from S3 to local storage
  console.log(`Downloading file from S3: ${s3Key}`);
  await downloadFromS3(s3Key, localFilePath);
  console.log(`File downloaded to: ${localFilePath}`);
  
  return localFilePath;
};

/**
 * Processes the transcription of a video file
 * @param localFilePath Path to the local video file
 * @param languageCode Language code for transcription
 * @returns Transcription data including text and ID
 */
export const processTranscription = async (
  localFilePath: string,
  languageCode?: string
) => {
  const transcriptionId = await transcribeVideo(localFilePath, languageCode);
  const transcriptionData = await getTranscriptionResult(transcriptionId);
  return transcriptionData;
};

/**
 * Saves transcription results to files
 * @param transcriptionData The transcription data
 * @param localFilePath Path to the local video file
 * @returns Object containing paths to saved files
 */
export const saveTranscriptionResults = async (
  transcriptionData: any,
  localFilePath: string
) => {
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
  const translatedTranscriptionFilePath = await translateTranscriptionTextToFile(
    transcriptionData.text,
    localFilePath
  );

  // Detect pauses in the transcription
  const pauses = detectPauses(transcriptionData.words);

  // Save pause data to a JSON file if pauses were detected
  const pauseDataFilePath =
    pauses.length > 0 ? savePauseDataToFile(pauses, localFilePath) : undefined;

  // Create audio from translated text file
  const audioFilePath = await createAudioFromTranslatedText(
    translatedTranscriptionFilePath
  );

  return {
    transcriptionFilePath,
    wordTimingDataFilePath,
    translatedTranscriptionFilePath,
    pauses,
    pauseDataFilePath,
    audioFilePath,
  };
};

/**
 * Cleans up temporary local files
 * @param localFilePath Path to the local file to delete
 */
export const cleanupLocalFile = (localFilePath: string): void => {
  try {
    fs.unlinkSync(localFilePath);
  } catch (error) {
    console.warn(`Failed to delete temporary file ${localFilePath}:`, error);
  }
};