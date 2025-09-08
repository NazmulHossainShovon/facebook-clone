import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { validateRequest, processVideoDownload, processVideoTranscription } from "../services/dub/dubService";
import fs from "fs";

// Interface for the request body
interface DubRequestBody {
  youtubeUrl: string;
}

export const processYoutubeUrl = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { youtubeUrl } = req.body as DubRequestBody;

      // Validate the request
      validateRequest(youtubeUrl);

      // Process the video download (streams to both S3 and local storage)
      const { videoInfo, s3Url, localFilePath } = await processVideoDownload(youtubeUrl);

      // Transcribe the video and get word timing data using the local file
      const { transcriptionText, transcriptionFilePath, wordTimingDataFilePath } = await processVideoTranscription(
        localFilePath,
        videoInfo.languageCode
      );
      
      // Clean up the local file after transcription
      try {
        fs.unlinkSync(localFilePath);
      } catch (error) {
        console.warn(`Failed to delete temporary file ${localFilePath}:`, error);
      }

      // Send success response
      res.status(200).json({
        message: transcriptionText
          ? "Video downloaded, streamed to S3, and transcribed successfully"
          : "Video downloaded and streamed to S3 successfully (transcription failed)",
        success: true,
        videoTitle: videoInfo.title,
        s3Url: s3Url,
        transcriptionPath: transcriptionFilePath,
        wordTimingDataPath: wordTimingDataFilePath,
        duration: videoInfo.lengthSeconds,
        transcriptionText: transcriptionText,
      });
    } catch (error: any) {
      console.error("Error processing YouTube URL:", error);
      
      // Handle validation errors specifically
      if (error.message === "YouTube URL is required" || 
          error.message === "Invalid YouTube URL format" || 
          error.message === "Invalid YouTube URL") {
        res.status(400).json({
          message: error.message,
          success: false,
        });
        return;
      }
      
      // Handle other errors
      res.status(500).json({
        message: "Internal server error",
        success: false,
      });
    }
  }
);
