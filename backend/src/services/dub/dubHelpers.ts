import {
  TranslateClient,
  TranslateTextCommand,
} from "@aws-sdk/client-translate";
import fs from "fs";
import path from "path";

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

// Interface for word timing data from AssemblyAI
interface WordTiming {
  text: string;
  start: number;
  end: number;
  confidence: number;
  speaker?: string | null;
}

/**
 * Saves word timing data to a JSON file
 * @param words Array of words with timing information
 * @param originalFileName The original video filename
 * @returns Path to the saved word timing data file
 */
export const saveWordTimingDataToFile = (
  words: WordTiming[] | undefined,
  originalFileName: string
): string | undefined => {
  try {
    if (!words || words.length === 0) {
      return undefined;
    }

    // Create downloads directory if it doesn't exist
    const downloadsDir = path.join(__dirname, "downloads");
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    // Create word timing data filename
    const fileNameWithoutExt = path.parse(originalFileName).name;
    const wordTimingDataFilePath = path.join(
      downloadsDir,
      `${fileNameWithoutExt}_word_timing.json`
    );

    // Write word timing data to JSON file
    fs.writeFileSync(
      wordTimingDataFilePath,
      JSON.stringify(words, null, 2),
      "utf8"
    );

    console.log(`Word timing data saved to: ${wordTimingDataFilePath}`);
    return wordTimingDataFilePath;
  } catch (error) {
    console.error("Error saving word timing data to file:", error);
    return undefined;
  }
};

/**
 * Translates the full transcription text and saves to a text file
 * @param text The full transcription text to translate
 * @param originalFileName The original video filename
 * @param targetLanguage Target language code for translation (default: 'bn' for Bengali)
 * @returns Path to the saved translated text file
 */
export const translateTranscriptionTextToFile = async (
  text: string | undefined,
  originalFileName: string,
  targetLanguage = "en"
): Promise<string | undefined> => {
  try {
    if (!text) {
      return undefined;
    }

    // Create AWS Translate client
    const client = new TranslateClient({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
    });

    // Translate the full text in a single API call
    const params = {
      Text: text,
      SourceLanguageCode: "auto",
      TargetLanguageCode: targetLanguage,
    };

    const command = new TranslateTextCommand(params);
    const response = await client.send(command);

    // Check if translation was successful
    if (!response.TranslatedText) {
      console.error("Translation failed: No translated text returned");
      return undefined;
    }

    // Create downloads directory if it doesn't exist
    const downloadsDir = path.join(__dirname, "downloads");
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    // Create translated text filename
    const fileNameWithoutExt = path.parse(originalFileName).name;
    const translatedTextFilePath = path.join(
      downloadsDir,
      `${fileNameWithoutExt}_${targetLanguage}.txt`
    );

    // Write translated text to file (similar to saveTranscriptionToFile)
    fs.writeFileSync(translatedTextFilePath, response.TranslatedText, "utf8");

    console.log(
      `Translated transcription text saved to: ${translatedTextFilePath}`
    );
    return translatedTextFilePath;
  } catch (error) {
    console.error("Error translating transcription text:", error);
    return undefined;
  }
};

/**
 * Detects pauses in the transcription data
 * @param words Array of words with timing information
 * @returns Array of detected pauses with timing information
 */
export const detectPauses = (words: WordTiming[] | undefined): PauseData[] => {
  if (!words || words.length < 2) {
    return [];
  }

  const pauses: PauseData[] = [];
  const PAUSE_THRESHOLD = 200; // 500ms threshold for detecting pauses

  for (let i = 0; i < words.length - 1; i++) {
    const currentWord = words[i];
    const nextWord = words[i + 1];

    // Calculate pause duration between words
    const pauseDuration = nextWord.start - currentWord.end;

    // If pause is longer than threshold, record it
    if (pauseDuration > PAUSE_THRESHOLD) {
      pauses.push({
        duration: pauseDuration,
        position: {
          afterWord: currentWord.text,
          beforeWord: nextWord.text,
        },
        timing: {
          start: currentWord.end,
          end: nextWord.start,
        },
      });
    }
  }

  return pauses;
};
