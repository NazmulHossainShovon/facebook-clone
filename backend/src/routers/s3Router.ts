import express from "express";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import { promisify } from "util";
import { isAuth } from "../utils";
import { UserModel } from "../models/userModel";

const randomBytes = promisify(crypto.randomBytes);

const region = process.env.AWS_REGION;
const bucketName = process.env.AWS_S3_BUCKET;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

if (!region || !bucketName || !accessKeyId || !secretAccessKey) {
  throw new Error("Missing AWS environment variables");
}

const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

const s3Router = express.Router();

s3Router.get("/signed-url", isAuth, async (req, res) => {
  const { contentType, userName, videoDuration } = req.query;
  const userNameStr = userName as string;
  const videoDurationNum = videoDuration
    ? parseInt(videoDuration as string)
    : undefined;

  if (!userNameStr || !contentType) {
    return res
      .status(400)
      .send({ message: "Missing userName or contentType query parameter" });
  }

  // If it's a video, check that user has enough seconds left
  if (contentType.toString().startsWith("video/")) {
    if (videoDurationNum === undefined) {
      return res
        .status(400)
        .send({ message: "Video duration is required for video uploads" });
    }

    // Check if video duration is more than 5 minutes (300 seconds)
    if (videoDurationNum > 300) {
      return res.status(400).send({
        message: "Video duration cannot be more than 5 minutes",
      });
    }

    // Get the current user
    // Cast request to any to access user property from auth middleware
    const reqWithUser = req as any;
    const user = await UserModel.findById(reqWithUser.user._id);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Check if user has enough seconds left
    if (!user.secondsLeft || user.secondsLeft < videoDurationNum) {
      return res.status(400).send({
        message: `Not enough video seconds remaining. Required: ${videoDurationNum}s, Available: ${
          user.secondsLeft || 0
        }s. Go to Pricing to purchase more.`,
      });
    }
  }

  const rawBytes = await randomBytes(16);
  const imageName = userNameStr + "/" + rawBytes.toString("hex");

  const params = {
    Bucket: bucketName,
    Key: imageName,
    ContentType: contentType as string,
  };

  const command = new PutObjectCommand(params);
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

  const imageUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${imageName}`;
  let updatedSecondsLeft = undefined;

  // If it's a video, deduct the duration from user's secondsLeft
  if (contentType.toString().startsWith("video/")) {
    if (videoDurationNum !== undefined) {
      // Get the current user
      // Cast request to any to access user property from auth middleware
      const reqWithUser = req as any;
      const user = await UserModel.findById(reqWithUser.user._id);
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }

      user.secondsLeft = (user.secondsLeft || 0) - videoDurationNum;
      await user.save();
      updatedSecondsLeft = user.secondsLeft;
    }
  }

  res.send({ uploadUrl, imageUrl, secondsLeft: updatedSecondsLeft });
});

export default s3Router;
