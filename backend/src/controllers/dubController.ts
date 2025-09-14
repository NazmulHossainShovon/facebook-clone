import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import {
  processS3Video,
  processVideoTranscription,
} from "../services/dub/dubService";
import { mergeVideoAndAudio } from "../services/dub/audioHelpers";

// Interface for the request body
interface DubRequestBody {
  s3Url: string;
}

export const processS3Url = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { s3Url } = req.body as DubRequestBody;

      // Validate that s3Url is provided
      if (!s3Url) {
        res.status(400).json({
          message: "S3 URL is required",
          success: false,
        });
        return;
      }

      // Process the S3 video (invoke audio removal Lambda)
      const { processedVideoUrl } = await processS3Video(s3Url);

      // For S3 videos, we don't have video info like title or duration
      const videoTitle = "Uploaded Video";
      const duration = 0; // We don't have duration info without processing the video

      // Transcribe the video and get word timing data using the S3 URL
      // Note: We're not passing a language code since we don't have video info
      const {
        transcriptionText,
        transcriptionFilePath,
        wordTimingDataFilePath,
        translatedTranscriptionFilePath,
        audioFilePath,
      } = await processVideoTranscription(s3Url);

      // Merge video and audio if both are available
      const mergedVideoS3Url: string | undefined = processedVideoUrl && audioFilePath 
        ? await mergeVideoAndAudio(processedVideoUrl, audioFilePath)
        : undefined;

      // Send success response
      res.status(200).json({
        message: transcriptionText
          ? "Video processed and transcribed successfully"
          : "Video processed successfully (transcription failed)",
        success: true,
        videoTitle: videoTitle,
        s3Url: s3Url,
        processedVideoUrl: processedVideoUrl,
        mergedVideoS3Url: mergedVideoS3Url,
        audioS3Url: audioFilePath,
        transcriptionPath: transcriptionFilePath,
        wordTimingDataPath: wordTimingDataFilePath,
        duration: duration,
        transcriptionText: transcriptionText,
      });
    } catch (error: any) {
      console.error("Error processing S3 URL:", error);

      // Handle validation errors specifically
      if (error.message === "S3 URL is required") {
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
