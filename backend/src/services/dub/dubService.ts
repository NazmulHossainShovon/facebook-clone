import ytdl from "@distube/ytdl-core";
import {
  validateYoutubeUrlFormat,
  validateYoutubeUrl,
  fetchVideoInfo,
  selectVideoFormat,
  createFilePath,
  downloadVideo,
} from "./youtubeService";
import {
  transcribeVideo,
  getTranscriptionResult,
  saveTranscriptionToFile,
  savePauseDataToFile,
} from "./transcriptionService";
import {
  TranslateClient,
  TranslateTextCommand,
} from "@aws-sdk/client-translate";
import {
  PollyClient,
  SynthesizeSpeechCommand,
  OutputFormat,
  VoiceId,
} from "@aws-sdk/client-polly";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Load environment variables
dotenv.config();

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
const saveWordTimingDataToFile = (
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
const translateTranscriptionTextToFile = async (
  text: string | undefined,
  originalFileName: string,
  targetLanguage = "es"
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
 * Creates audio from translated text file using AWS Polly and saves it in the same location
 * @param translatedTextFilePath Path to the translated text file
 * @returns Path to the saved audio file
 */
const createAudioFromTranslatedText = async (
  translatedTextFilePath: string | undefined
): Promise<string | undefined> => {
  try {
    if (!translatedTextFilePath || !fs.existsSync(translatedTextFilePath)) {
      console.error("Translated text file not found");
      return undefined;
    }

    // Read translated text from file
    const text = fs.readFileSync(translatedTextFilePath, "utf8");

    // Create AWS Polly client
    const client = new PollyClient({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
    });

    // Configure Polly parameters with proper types
    const params = {
      Text: text,
      OutputFormat: OutputFormat.MP3,
      VoiceId: VoiceId.Aditi, // Default voice, can be customized
    };

    // Synthesize speech
    const command = new SynthesizeSpeechCommand(params);
    const response = await client.send(command);

    // Check if audio stream is available
    if (!response.AudioStream) {
      console.error("Audio synthesis failed: No audio stream returned");
      return undefined;
    }

    // Create audio filename (same base name as translated text file but with .mp3 extension)
    const parsedPath = path.parse(translatedTextFilePath);
    const audioFilePath = path.join(parsedPath.dir, `${parsedPath.name}.mp3`);

    // Write audio stream to file
    const audioBuffer = await streamToBuffer(response.AudioStream);
    fs.writeFileSync(audioFilePath, audioBuffer);

    console.log(`Audio file saved to: ${audioFilePath}`);
    return audioFilePath;
  } catch (error) {
    console.error("Error creating audio from translated text:", error);
    return undefined;
  }
};

/**
 * Converts a ReadableStream to a Buffer
 * @param stream The ReadableStream to convert
 * @returns A Promise that resolves to a Buffer
 */
const streamToBuffer = async (stream: any): Promise<Buffer> => {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};

/**
 * Detects pauses in the transcription data
 * @param words Array of words with timing information
 * @returns Array of detected pauses with timing information
 */
const detectPauses = (words: WordTiming[] | undefined): PauseData[] => {
  if (!words || words.length < 2) {
    return [];
  }

  const pauses: PauseData[] = [];
  const PAUSE_THRESHOLD = 500; // 500ms threshold for detecting pauses

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
 * Processes the YouTube video download
 * @param youtubeUrl The YouTube URL to process
 * @returns Object containing video info and file path
 */
export const processVideoDownload = async (youtubeUrl: string) => {
  // Get video info from YouTube
  const videoInfo = await fetchVideoInfo(youtubeUrl);

  // Convert back to ytdl.videoInfo for compatibility with downloadFromInfo
  const info = await ytdl.getInfo(youtubeUrl);

  // Select the video format and quality with fallback options (prioritizing formats with audio)
  const format = selectVideoFormat(videoInfo.formats);

  // Create output file path
  const outputFilePath = createFilePath(videoInfo.title, format.container);

  // Download the video file
  await downloadVideo(info, format, outputFilePath);

  return { videoInfo, outputFilePath };
};

/**
 * Transcribes the downloaded video and saves word timing data
 * @param filePath Path to the downloaded video file
 * @param languageCode Language code for transcription
 * @returns Object containing transcription text, file path, and word timing data file path
 */
export const processVideoTranscription = async (
  filePath: string,
  languageCode?: string
): Promise<{
  transcriptionText: string | undefined;
  transcriptionFilePath: string | undefined;
  wordTimingDataFilePath: string | undefined;
  translatedTranscriptionFilePath: string | undefined;
  pauses: PauseData[] | undefined;
  pauseDataFilePath: string | undefined;
  audioFilePath: string | undefined; // Added audio file path to return object
}> => {
  console.log("Starting video transcription with word timing data...");
  try {
    const transcriptionId = await transcribeVideo(filePath, languageCode);
    const transcriptionData = await getTranscriptionResult(transcriptionId);

    // Save the transcription text to a file
    const transcriptionFilePath = saveTranscriptionToFile(
      transcriptionData.text || "",
      filePath
    );

    // Save word timing data to a JSON file
    const wordTimingDataFilePath = saveWordTimingDataToFile(
      transcriptionData.words,
      filePath
    );

    // Translate the full transcription text and save to a text file
    const translatedTranscriptionFilePath =
      await translateTranscriptionTextToFile(transcriptionData.text, filePath);

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
