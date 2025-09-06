import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import ytdl from "@distube/ytdl-core";
import {
  validateYoutubeUrlFormat,
  validateYoutubeUrl,
  fetchVideoInfo,
  selectVideoFormat,
  createFilePath,
  downloadVideo
} from "../utils/youtubeService";
import { transcribeVideo, getTranscriptionResult, saveTranscriptionToFile } from "../utils/transcriptionService";

// Interface for the request body
interface DubRequestBody {
  youtubeUrl: string;
}

export const processYoutubeUrl = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { youtubeUrl } = req.body as DubRequestBody;

      // Validate that youtubeUrl is provided
      if (!youtubeUrl) {
        res.status(400).json({
          message: "YouTube URL is required",
          success: false,
        });
        return;
      }

      // Validate YouTube URL format
      if (!validateYoutubeUrlFormat(youtubeUrl)) {
        res.status(400).json({
          message: "Invalid YouTube URL format",
          success: false,
        });
        return;
      }

      // Validate YouTube URL with ytdl-core
      if (!validateYoutubeUrl(youtubeUrl)) {
        res.status(400).json({
          message: "Invalid YouTube URL",
          success: false,
        });
        return;
      }

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
      
      // Transcribe the video
      console.log("Starting video transcription...");
      const { transcriptionText, transcriptionFilePath } = await (async () => {
        try {
          const transcriptionId = await transcribeVideo(outputFilePath, videoInfo.languageCode);
          const transcriptionText = await getTranscriptionResult(transcriptionId);
          const transcriptionFilePath = saveTranscriptionToFile(transcriptionText, outputFilePath);
          return { transcriptionText, transcriptionFilePath };
        } catch (transcriptionError) {
          console.error("Error during transcription:", transcriptionError);
          return { transcriptionText: undefined, transcriptionFilePath: undefined };
        }
      })();
      
      // Send success response
      res.status(200).json({
        message: transcriptionText 
          ? "Video downloaded and transcribed successfully" 
          : "Video downloaded successfully (transcription failed)",
        success: true,
        videoTitle: videoInfo.title,
        filePath: outputFilePath,
        transcriptionPath: transcriptionFilePath,
        duration: videoInfo.lengthSeconds,
        transcriptionText: transcriptionText,
      });
    } catch (error) {
      console.error("Error processing YouTube URL:", error);
      res.status(500).json({
        message: "Internal server error",
        success: false,
      });
    }
  }
);
