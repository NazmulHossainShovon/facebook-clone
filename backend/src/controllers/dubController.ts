import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import ytdl from "@distube/ytdl-core";
import fs from "fs";
import path from "path";

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
      const youtubeRegex =
        /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
      if (!youtubeRegex.test(youtubeUrl)) {
        res.status(400).json({
          message: "Invalid YouTube URL format",
          success: false,
        });
        return;
      }

      // Validate YouTube URL with ytdl-core
      if (!ytdl.validateURL(youtubeUrl)) {
        res.status(400).json({
          message: "Invalid YouTube URL",
          success: false,
        });
        return;
      }

      // Get video info from YouTube
      console.log("Fetching video info for:", youtubeUrl);
      const info = await ytdl.getInfo(youtubeUrl);
      console.log("Video title:", info.videoDetails.title);
      console.log("Available formats:", info.formats.length);
      
      // Select the video format and quality with fallback options
      let format;
      try {
        // Try 720p webm first
        format = ytdl.chooseFormat(info.formats, { quality: "247" });
        console.log("Selected format: 720p webm");
      } catch {
        try {
          // Fallback to 720p mp4
          format = ytdl.chooseFormat(info.formats, { quality: "136" });
          console.log("Selected format: 720p mp4");
        } catch {
          try {
            // Fallback to highest quality available
            format = ytdl.chooseFormat(info.formats, { quality: "highest" });
            console.log("Selected format: highest quality");
          } catch {
            // Last resort - any video format
            format = ytdl.chooseFormat(info.formats, { filter: "videoonly" });
            console.log("Selected format: any video format");
          }
        }
      }
      
      console.log("Final format selected:", format.itag, format.qualityLabel, format.container);
      
      // Create downloads directory if it doesn't exist
      const downloadsDir = path.join(__dirname, "../utils/downloads");
      if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir, { recursive: true });
      }
      
      // Clean the video title for filename (remove special characters)
      const cleanTitle = info.videoDetails.title
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "_")
        .substring(0, 100); // Limit filename length
      
      // Create output file path
      const outputFilePath = path.join(
        downloadsDir,
        `${cleanTitle}.${format.container}`
      );
      
      // Create a write stream to save the video file
      const outputStream = fs.createWriteStream(outputFilePath);
      
      // Download the video file
      const downloadStream = ytdl.downloadFromInfo(info, { format: format });
      downloadStream.pipe(outputStream);
      
      // Handle download completion
      outputStream.on("finish", () => {
        console.log(`Finished downloading: ${outputFilePath}`);
        res.status(200).json({
          message: "Video downloaded successfully",
          success: true,
          videoTitle: info.videoDetails.title,
          filePath: outputFilePath,
          duration: info.videoDetails.lengthSeconds,
        });
      });
      
      // Handle download errors
      outputStream.on("error", (error) => {
        console.error("Error writing file:", error);
        res.status(500).json({
          message: "Error saving video file",
          success: false,
        });
      });
      
      downloadStream.on("error", (error) => {
        console.error("Error downloading video:", error);
        res.status(500).json({
          message: "Error downloading video",
          success: false,
        });
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
