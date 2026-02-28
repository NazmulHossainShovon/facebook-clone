import express, { Request, Response, NextFunction } from "express";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { isAuth } from "../utils";
import { processS3Url } from "../controllers/dubController";

// Create Upstash Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// Check connection
(async () => {
  try {
    await redis.ping();
    console.log("Successfully connected to Upstash Redis");
  } catch (error) {
    console.error("Failed to connect to Upstash Redis:", error);
  }
})();

// Rate limiter: 1 request per 60 seconds per user using Upstash Ratelimit
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1, "60 s"),
  analytics: false,
  prefix: "dub:s3",
});

const s3Limiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as { _id: string })?._id;
    if (!userId) {
      return next();
    }
    const { success } = await ratelimit.limit(userId);
    if (!success) {
      return res
        .status(429)
        .json({ message: "Too many requests, please try again later." });
    }
    next();
  } catch (error) {
    console.error("Rate limit error:", error);
    next(); // fail open on Redis errors
  }
};

export const dubRouter = express.Router();

dubRouter.post("/s3", isAuth, s3Limiter, processS3Url);

// Health check endpoint
dubRouter.get("/", (req: Request, res: Response) => {
  res.json({ message: "Dub API is running" });
});
