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
          beforeWord: nextWord.text
        },
        timing: {
          start: currentWord.end,
          end: nextWord.start
        }
      });
    }
  }

  return pauses;
};

/**
 * Formats transcription text with pause indicators
 * @param text Original transcription text
 * @param pauses Array of detected pauses
 * @returns Formatted transcription text with pause indicators
 */
const formatTranscriptionWithPauses = (text: string, pauses: PauseData[]): string => {
  if (!text || pauses.length === 0) {
    return text;
  }

  // For now, we'll just return the original text
  // In a more advanced implementation, we could insert visual indicators for pauses
  return text;
};

/**
 * Transcribes the downloaded video with pause detection
 * @param filePath Path to the downloaded video file
 * @param languageCode Language code for transcription
 * @returns Object containing transcription text, file path, and pause data
 */
export const processVideoTranscription = async (
  filePath: string,
  languageCode?: string
): Promise<{
  transcriptionText: string | undefined;
  transcriptionFilePath: string | undefined;
  pauses: any[] | undefined;
  pauseDataFilePath: string | undefined;
}> => {
  console.log("Starting video transcription with pause detection...");
  try {
    const transcriptionId = await transcribeVideo(filePath, languageCode);
    const transcriptionData = await getTranscriptionResult(transcriptionId);
    
    // Detect pauses in the transcription
    const pauses = detectPauses(transcriptionData.words);
    
    // Format transcription text with pause information
    const formattedText = formatTranscriptionWithPauses(transcriptionData.text, pauses);
    
    // Save the formatted transcription to a file
    const transcriptionFilePath = saveTranscriptionToFile(
      formattedText,
      filePath
    );
    
    // Save pause data to a JSON file if pauses were detected
    const pauseDataFilePath = pauses.length > 0 ? savePauseDataToFile(pauses, filePath) : undefined;
    
    return { 
      transcriptionText: formattedText, 
      transcriptionFilePath,
      pauses, // Include pause data in the response
      pauseDataFilePath // Include path to pause data file
    };
  } catch (transcriptionError) {
    console.error("Error during transcription:", transcriptionError);
    return {
      transcriptionText: undefined,
      transcriptionFilePath: undefined,
      pauses: undefined,
      pauseDataFilePath: undefined
    };
  }
};