import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { PostModel } from "../models/postModel";
import { SharedPostModel } from "../models/sharedPostModel";
import { UserModel } from "../models/userModel";

export const sharePost = asyncHandler(async (req: Request, res: Response) => {
  const { originalPostId, shareMessage } = req.body;
  const user = await UserModel.findById(req.user!._id);

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  // Check if the original post exists
  const originalPost = await PostModel.findById(originalPostId);
  if (!originalPost) {
    res.status(404).json({ message: "Original post not found" });
    return;
  }

  // Check if user has already shared this post
  const existingShare = await SharedPostModel.findOne({
    originalPostId,
    sharedByUserId: user._id,
  });

  if (existingShare) {
    res.status(400).json({ message: "You have already shared this post" });
    return;
  }

  // Create the shared post
  const sharedPost = await SharedPostModel.create({
    originalPostId,
    sharedByUserId: user._id,
    sharedByUserName: user.name,
    shareMessage,
  });

  // Increment share count on original post
  await PostModel.findByIdAndUpdate(originalPostId, {
    $inc: { shareCount: 1 },
  });

  res.status(201).json({
    message: "Post shared successfully",
    sharedPost,
  });
});

export const deleteSharedPost = asyncHandler(
  async (req: Request, res: Response) => {
    const sharedPost = await SharedPostModel.findById(req.params.id);

    if (sharedPost) {
      // Decrement share count on original post
      await PostModel.findByIdAndUpdate(sharedPost.originalPostId, {
        $inc: { shareCount: -1 },
      });

      await SharedPostModel.findByIdAndDelete(req.params.id);
      res.json({ message: "Shared Post Deleted" });
    } else {
      res.status(404).json({ message: "Shared Post not found" });
    }
  }
);
