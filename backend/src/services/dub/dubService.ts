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
} from "./transcriptionService";
import fs from "fs";
import path from "path";

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
const saveWordTimingDataToFile = (words: WordTiming[] | undefined, originalFileName: string): string | undefined => {
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
    const wordTimingDataFilePath = path.join(downloadsDir, `${fileNameWithoutExt}_word_timing.json`);
    
    // Write word timing data to JSON file
    fs.writeFileSync(wordTimingDataFilePath, JSON.stringify(words, null, 2), "utf8");
    
    console.log(`Word timing data saved to: ${wordTimingDataFilePath}`);
    return wordTimingDataFilePath;
  } catch (error) {
    console.error("Error saving word timing data to file:", error);
    return undefined;
  }
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
    const wordTimingDataFilePath = saveWordTimingDataToFile(transcriptionData.words, filePath);
    
    return { 
      transcriptionText: transcriptionData.text, 
      transcriptionFilePath,
      wordTimingDataFilePath // Include path to word timing data file
    };
  } catch (transcriptionError) {
    console.error("Error during transcription:", transcriptionError);
    return {
      transcriptionText: undefined,
      transcriptionFilePath: undefined,
      wordTimingDataFilePath: undefined
    };
  }
};