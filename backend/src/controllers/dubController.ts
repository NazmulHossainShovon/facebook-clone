import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import {
  validateRequest,
  processVideoDownload,
  processVideoTranscription,
} from "../services/dub/dubService";
import { mergeVideoAndAudio } from "../services/dub/audioHelpers";

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

      // Process the video download (streams directly to S3)
      const { videoInfo, s3Url, processedVideoUrl } = await processVideoDownload(youtubeUrl);

      // Transcribe the video and get word timing data using the S3 URL
      const {
        transcriptionText,
        transcriptionFilePath,
        wordTimingDataFilePath,
        translatedTranscriptionFilePath,
        audioFilePath,
      } = await processVideoTranscription(s3Url, videoInfo.languageCode);

      // Merge video and audio if both are available
      let mergedVideoS3Url: string | undefined;
      if (processedVideoUrl && audioFilePath) {
        mergedVideoS3Url = await mergeVideoAndAudio(
          processedVideoUrl,
          audioFilePath
        );
      }

      // Send success response
      res.status(200).json({
        message: transcriptionText
          ? "Video downloaded, streamed to S3, and transcribed successfully"
          : "Video downloaded and streamed to S3 successfully (transcription failed)",
        success: true,
        videoTitle: videoInfo.title,
        s3Url: s3Url,
        processedVideoUrl: processedVideoUrl,
        mergedVideoS3Url: mergedVideoS3Url,
        audioS3Url: audioFilePath,
        transcriptionPath: transcriptionFilePath,
        wordTimingDataPath: wordTimingDataFilePath,
        duration: videoInfo.lengthSeconds,
        transcriptionText: transcriptionText,
      });
    } catch (error: any) {
      console.error("Error processing YouTube URL:", error);

      // Handle validation errors specifically
      if (
        error.message === "YouTube URL is required" ||
        error.message === "Invalid YouTube URL format" ||
        error.message === "Invalid YouTube URL"
      ) {
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
