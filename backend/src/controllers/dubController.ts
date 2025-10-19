import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { UserModel } from "../models/userModel";
import { sendMergedVideoEmail } from "../utils/awsSes";
import {
  validateS3Url,
  processVideo,
  transcribeVideo,
  mergeVideoAndAudioFiles,
  deleteS3Object,
  handleS3ProcessingError,
  deleteDownloadsFolder
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

      // Check if user has minutes left before proceeding
      const reqWithUser = req as any; // Cast to access user property from auth middleware
      if (!reqWithUser.user) {
        res.status(401).json({
          success: false,
          error: "Unauthorized: No user information found",
        });
        return; // Exit early to avoid further processing
      }

      const user = await UserModel.findById(reqWithUser.user._id);
      if (!user) {
        res.status(404).json({
          success: false,
          error: "User not found",
        });
        return; // Exit early to avoid further processing
      }

      if ((user.secondsLeft ?? 0) <= 0) {
        res.status(403).json({
          success: false,
          error: "Insufficient seconds: You need to purchase more seconds to continue using this service",
        });
        return; // Exit early to avoid further processing
      }

      // Validate that s3Url is provided
      validateS3Url(s3Url);

      // Process the S3 video (invoke audio removal Lambda)
      const processedVideoUrl = await processVideo(s3Url);

      // Transcribe the video and get word timing data using the S3 URL
      const { audioFilePath } = await transcribeVideo(s3Url, targetLanguage, voiceGender);

      // Merge video and audio if both are available
      const mergedVideoS3Url = await mergeVideoAndAudioFiles(processedVideoUrl, audioFilePath);

      // Delete the downloads folder after merging is complete
      deleteDownloadsFolder();

      // Extract the S3 key from the URL and delete the original object
      // Example URL: https://bucket-name.s3.region.amazonaws.com/key
      if (s3Url) {
        await deleteS3Object(s3Url);
      }

      // Send email with the merged video URL
      if (user.email && mergedVideoS3Url) {
        await sendMergedVideoEmail(user.email, user.name, mergedVideoS3Url);
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
