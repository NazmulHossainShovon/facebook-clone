import {
  transcribeVideo,
  getTranscriptionResult,
  saveTranscriptionToFile,
  savePauseDataToFile,
} from "./transcriptionService";
import {
  translateTranscriptionTextToFile,
  detectPauses,
} from "./dubHelpers";
import { createAudioFromTranslatedText } from "./audioHelpers";
import path from "path";
import fs from "fs";

/**
 * Processes the transcription of a video file
 * @param fileUrl URL to the video file (can be S3 URL or local file path)
 * @param languageCode Language code for transcription
 * @returns Transcription data including text and ID
 */
export const processTranscription = async (
  fileUrl: string,
  languageCode?: string
) => {
  const transcriptionId = await transcribeVideo(fileUrl, languageCode);
  const transcriptionData = await getTranscriptionResult(transcriptionId);
  return transcriptionData;
};

/**
 * Saves transcription results to files
 * @param transcriptionData The transcription data
 * @param filePath Path to the video file (used for naming files)
 * @returns Object containing paths to saved files
 */
export const saveTranscriptionResults = async (
  transcriptionData: any,
  filePath: string
) => {
  // Create downloads directory if it doesn't exist
  const downloadsDir = path.join(__dirname, "downloads");
  if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
  }

  // Save the transcription text to a file
  const transcriptionFilePath = saveTranscriptionToFile(
    transcriptionData.text || "",
    filePath
  );

  // Translate the full transcription text and save to a text file
  const translatedTranscriptionFilePath = await translateTranscriptionTextToFile(
    transcriptionData.text,
    filePath
  );

  // Detect pauses in the transcription
  const pauses = detectPauses(transcriptionData.words);

  // Save pause data to a JSON file if pauses were detected
  const pauseDataFilePath =
    pauses.length > 0 ? savePauseDataToFile(pauses, filePath) : undefined;

  // Create audio from translated text file
  const audioFilePath = await createAudioFromTranslatedText(
    translatedTranscriptionFilePath
  );

  return {
    transcriptionFilePath,
    translatedTranscriptionFilePath,
    pauses,
    pauseDataFilePath,
    audioFilePath,
  };
};