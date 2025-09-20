import {
  TranslateClient,
} from "@aws-sdk/client-translate";
import fs from "fs";
import path from "path";
import {
  createTranslateClient,
  translateText,
  ensureDownloadsDirectory,
  generateTranslatedFileName,
  saveTranslatedTextToFile
} from "./translationHelpers";

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
 * Translates an SSML file by translating content between break tags and saves to a new SSML file
 * @param ssmlFilePath Path to the SSML file to translate
 * @param targetLanguage Target language code for translation (default: 'en')
 * @returns Path to the saved translated SSML file
 */
export const translateTranscriptionTextToFile = async (
  ssmlFilePath: string,
  targetLanguage = "en"
): Promise<string | undefined> => {
  try {
    if (!ssmlFilePath || !fs.existsSync(ssmlFilePath)) {
      console.error("SSML file not found:", ssmlFilePath);
      return undefined;
    }

    // Read the SSML file content
    const ssmlContent = fs.readFileSync(ssmlFilePath, "utf8");

    // Create AWS Translate client
    const client = createTranslateClient();

    // Parse SSML content to extract text segments between break tags
    const segments = parseSSMLSegments(ssmlContent);
    
    if (segments.length === 0) {
      console.error("No translatable segments found in SSML file");
      return undefined;
    }

    // Translate each segment
    const translatedSegments: string[] = [];
    for (const segment of segments) {
      if (segment.trim()) {
        const translatedText = await translateText(client, segment, targetLanguage);
        if (translatedText) {
          translatedSegments.push(translatedText);
        } else {
          // If translation fails, keep original text
          translatedSegments.push(segment);
        }
      } else {
        translatedSegments.push(segment);
      }
    }

    // Reconstruct SSML with translated content
    const translatedSSML = reconstructSSML(ssmlContent, translatedSegments);

    // Generate translated SSML filename
    const translatedSSMLPath = generateTranslatedSSMLFileName(ssmlFilePath, targetLanguage);

    // Save translated SSML to file
    fs.writeFileSync(translatedSSMLPath, translatedSSML, "utf8");
    console.log(`Translated SSML file saved to: ${translatedSSMLPath}`);

    return translatedSSMLPath;
  } catch (error) {
    console.error("Error translating SSML file:", error);
    return undefined;
  }
};

/**
 * Parses SSML content to extract text segments between break tags
 * @param ssmlContent The SSML content to parse
 * @returns Array of text segments
 */
const parseSSMLSegments = (ssmlContent: string): string[] => {
  try {
    // Remove <speak> tags and get the inner content
    const innerContent = ssmlContent.replace(/<speak[^>]*>|<\/speak>/g, '').trim();
    
    // Split by break tags to get segments
    const segments = innerContent.split(/<break[^>]*\/>/);
    
    // Clean up segments by trimming whitespace
    return segments.map(segment => segment.trim()).filter(segment => segment.length > 0);
  } catch (error) {
    console.error("Error parsing SSML segments:", error);
    return [];
  }
};

/**
 * Reconstructs SSML content with translated segments
 * @param originalSSML The original SSML content
 * @param translatedSegments Array of translated text segments
 * @returns Reconstructed SSML with translated content
 */
const reconstructSSML = (originalSSML: string, translatedSegments: string[]): string => {
  try {
    // Extract break tags from original SSML
    const breakTags = originalSSML.match(/<break[^>]*\/>/g) || [];
    
    // Start with speak tag
    let reconstructedSSML = '<speak>\n';
    
    // Combine translated segments with break tags
    for (let i = 0; i < translatedSegments.length; i++) {
      reconstructedSSML += translatedSegments[i];
      
      // Add break tag if there's one available and it's not the last segment
      if (i < breakTags.length && i < translatedSegments.length - 1) {
        reconstructedSSML += ` ${breakTags[i]}`;
      }
      
      // Add space between segments if not the last one
      if (i < translatedSegments.length - 1) {
        reconstructedSSML += ' ';
      }
    }
    
    reconstructedSSML += '\n</speak>';
    
    return reconstructedSSML;
  } catch (error) {
    console.error("Error reconstructing SSML:", error);
    // Fallback: create simple SSML with translated content
    return `<speak>\n${translatedSegments.join(' ')}\n</speak>`;
  }
};

/**
 * Generates the filename for translated SSML files
 * @param originalSSMLPath The original SSML file path
 * @param targetLanguage Target language code
 * @returns Generated filename for the translated SSML file
 */
const generateTranslatedSSMLFileName = (
  originalSSMLPath: string,
  targetLanguage: string
): string => {
  const parsedPath = path.parse(originalSSMLPath);
  const translatedFileName = `${parsedPath.name}_${targetLanguage}.ssml`;
  return path.join(parsedPath.dir, translatedFileName);
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
