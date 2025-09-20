import {
  transcribeVideo,
  getTranscriptionResult,
  saveTranscriptionToFile,
  savePauseDataToFile,
} from "./transcriptionService";
import { translateTranscriptionTextToFile, detectPauses } from "./dubHelpers";
import { createAudioFromTranslatedText } from "./audioHelpers";
import path from "path";
import fs from "fs";

// Interface for pause detection data
interface PauseData {
  duration: number;
  position: {
    afterWord: string;
    beforeWord: string;
  };
  timing: {
    start: number;
    end: number;
  };
}

// Interface for word timing data
interface WordTiming {
  text: string;
  start: number;
  end: number;
  confidence: number;
  speaker?: string | null;
}

/**
 * Creates an SSML file from transcription text with break tags based on detected pauses
 * @param transcriptionFilePath Path to the transcription text file
 * @param pauses Array of detected pauses
 * @param words Array of word timing data
 * @returns Path to the created SSML file
 */
export const createSSMLFromTranscription = (
  transcriptionFilePath: string,
  pauses: PauseData[],
  words?: WordTiming[]
): string => {
  try {
    // Read the transcription text
    const transcriptionText = fs.readFileSync(transcriptionFilePath, "utf8");

    // If no words data or pauses, create simple SSML
    if (!words || words.length === 0 || pauses.length === 0) {
      const simpleSSML = `<speak>\n${transcriptionText}\n</speak>`;
      const ssmlFilePath = transcriptionFilePath.replace(/\.txt$/, ".ssml");
      fs.writeFileSync(ssmlFilePath, simpleSSML, "utf8");
      console.log(`Simple SSML file created: ${ssmlFilePath}`);
      return ssmlFilePath;
    }

    // Create a map of pauses by their position (after which word they occur)
    const pauseMap = new Map<string, number>();
    pauses.forEach((pause) => {
      pauseMap.set(pause.position.afterWord, pause.duration);
    });

    // Split transcription into words and rebuild with SSML breaks
    const transcriptionWords = transcriptionText.split(/\s+/);
    let ssmlContent = "<speak>\n";

    for (let i = 0; i < transcriptionWords.length; i++) {
      const word = transcriptionWords[i];
      ssmlContent += word;

      // Check if there's a pause after this word
      const pauseDuration = pauseMap.get(word);
      if (pauseDuration) {
        // Convert milliseconds to seconds and format for SSML
        const pauseSeconds = (pauseDuration / 1000).toFixed(2);
        ssmlContent += ` <break time="${pauseSeconds}s"/>`;
      }

      // Add space if not the last word
      if (i < transcriptionWords.length - 1) {
        ssmlContent += " ";
      }
    }

    ssmlContent += "\n</speak>";

    // Save SSML file in the same directory as transcription file
    const ssmlFilePath = transcriptionFilePath.replace(/\.txt$/, ".ssml");
    fs.writeFileSync(ssmlFilePath, ssmlContent, "utf8");

    console.log(
      `SSML file created with ${pauses.length} break tags: ${ssmlFilePath}`
    );
    return ssmlFilePath;
  } catch (error) {
    console.error("Error creating SSML file:", error);
    throw error;
  }
};

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
 * @param targetLanguage Target language for translation
 * @param voiceGender Voice gender for audio synthesis
 * @returns Object containing paths to saved files
 */
export const saveTranscriptionResults = async (
  transcriptionData: any,
  filePath: string,
  targetLanguage: string = "en",
  voiceGender: string = "female"
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

  // Detect pauses in the transcription
  const pauses = detectPauses(transcriptionData.words);

  // Create SSML file from transcription with break tags for pauses
  const ssmlFilePath = createSSMLFromTranscription(
    transcriptionFilePath,
    pauses,
    transcriptionData.words
  );

  // Translate the SSML file and save to a new SSML file
  const translatedTranscriptionFilePath =
    await translateTranscriptionTextToFile(ssmlFilePath, targetLanguage);

  // Save pause data to a JSON file if pauses were detected
  const pauseDataFilePath =
    pauses.length > 0 ? savePauseDataToFile(pauses, filePath) : undefined;

  // Create audio from translated text file
  const audioFilePath = await createAudioFromTranslatedText(
    translatedTranscriptionFilePath,
    targetLanguage,
    voiceGender
  );

  return {
    transcriptionFilePath,
    translatedTranscriptionFilePath,
    pauses,
    pauseDataFilePath,
    ssmlFilePath,
    audioFilePath,
  };
};
