import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import {
  validateS3Url,
  processVideo,
  transcribeVideo,
  mergeVideoAndAudioFiles,
  deleteS3Object,
  handleS3ProcessingError
} from "../services/dub/dubProcessingHelpers";

// Interface for the request body
interface DubRequestBody {
  s3Url: string;
  targetLanguage?: string;
  voiceGender?: string;
}

export const processS3Url = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { s3Url, targetLanguage = 'en', voiceGender = 'female' } = req.body as DubRequestBody;

      // Validate that s3Url is provided
      validateS3Url(s3Url);

      // Process the S3 video (invoke audio removal Lambda)
      const processedVideoUrl = await processVideo(s3Url);

      // Transcribe the video and get word timing data using the S3 URL
      const { audioFilePath } = await transcribeVideo(s3Url, targetLanguage, voiceGender);

      // Merge video and audio if both are available
      const mergedVideoS3Url = await mergeVideoAndAudioFiles(processedVideoUrl, audioFilePath);

      // Extract the S3 key from the URL and delete the original object
      // Example URL: https://bucket-name.s3.region.amazonaws.com/key
      if (s3Url) {
        await deleteS3Object(s3Url);
      }

      // Send success response with only the merged video URL
      res.status(200).json({
        success: true,
        mergedVideoS3Url: mergedVideoS3Url,
      });
    } catch (error: any) {
      handleS3ProcessingError(error, res);
    }
  }
);
