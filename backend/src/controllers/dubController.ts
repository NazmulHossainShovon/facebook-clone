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

      // Select the video format and quality with fallback options
      const format = selectVideoFormat(videoInfo.formats);
      
      // Create output file path
      const outputFilePath = createFilePath(videoInfo.title, format.container);
      
      // Download the video file
      await downloadVideo(info, format, outputFilePath);
      
      // Send success response
      res.status(200).json({
        message: "Video downloaded successfully",
        success: true,
        videoTitle: videoInfo.title,
        filePath: outputFilePath,
        duration: videoInfo.lengthSeconds,
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
