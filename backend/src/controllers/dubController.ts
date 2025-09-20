import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import {
  processS3Video,
  processVideoTranscription,
} from "../services/dub/dubService";
import { mergeVideoAndAudio } from "../services/dub/audioHelpers";
import { deleteFromS3 } from "../services/s3Service";

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

      // Transcribe the video and get word timing data using the S3 URL
      // Note: We're not passing a language code since we don't have video info
      const { audioFilePath } = await processVideoTranscription(s3Url);

      // Merge video and audio if both are available
      const mergedVideoS3Url: string | undefined =
        processedVideoUrl && audioFilePath
          ? await mergeVideoAndAudio(processedVideoUrl, audioFilePath)
          : undefined;

      // Extract the S3 key from the URL and delete the original object
      // Example URL: https://bucket-name.s3.region.amazonaws.com/key
      if (s3Url) {
        try {
          const url = new URL(s3Url);
          // Extract key from the URL path, removing the leading slash
          const key = url.pathname.substring(1);
          await deleteFromS3(key);
          console.log(`Successfully deleted original S3 object: ${key}`);
        } catch (deleteError) {
          console.error("Error deleting original S3 object:", deleteError);
          // Continue with the response even if deletion fails
        }
      }

      // Send success response with only the merged video URL
      res.status(200).json({
        success: true,
        mergedVideoS3Url: mergedVideoS3Url,
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
