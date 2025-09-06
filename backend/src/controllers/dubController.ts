import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { validateRequest, processVideoDownload, processVideoTranscription } from "../services/dub/dubService";

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

      // Process the video download
      const { videoInfo, outputFilePath } = await processVideoDownload(youtubeUrl);

      // Transcribe the video
      const { transcriptionText, transcriptionFilePath } = await processVideoTranscription(
        outputFilePath,
        videoInfo.languageCode
      );

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
