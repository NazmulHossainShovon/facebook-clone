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
 * Transcribes the downloaded video
 * @param filePath Path to the downloaded video file
 * @param languageCode Language code for transcription
 * @returns Object containing transcription text and file path
 */
export const processVideoTranscription = async (
  filePath: string,
  languageCode?: string
) => {
  console.log("Starting video transcription...");
  try {
    const transcriptionId = await transcribeVideo(filePath, languageCode);
    const transcriptionText = await getTranscriptionResult(transcriptionId);
    const transcriptionFilePath = saveTranscriptionToFile(
      transcriptionText,
      filePath
    );
    return { transcriptionText, transcriptionFilePath };
  } catch (transcriptionError) {
    console.error("Error during transcription:", transcriptionError);
    return {
      transcriptionText: undefined,
      transcriptionFilePath: undefined,
    };
  }
};