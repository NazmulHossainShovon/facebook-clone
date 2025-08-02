import { PostModel } from "../models/postModel";
import { SharedPostModel } from "../models/sharedPostModel";
import { UserModel } from "../models/userModel";
import { isAuth } from "../utils";
import express, { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { applyPagination, getPaginationParams } from "./utils/pagination";

export const postRouter = express.Router();

postRouter.get(
  "/",
  isAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const pagination = getPaginationParams(req);
    const query = { authorName: req.query.userName };
    const { data: posts, totalPages } = await applyPagination(
      PostModel,
      query,
      pagination
    );
    res.json({ posts, totalPages });
  })
);

postRouter.get(
  "/friends",
  isAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const pagination = getPaginationParams(req);
    const currentUser = await UserModel.findById(req.user._id);
    const query = {
      authorName: { $in: currentUser?.friends },
    };
    const { data: posts, totalPages } = await applyPagination(
      PostModel,
      query,
      pagination
    );
    res.json({ posts, totalPages });
  })
);

postRouter.post(
  "/create",
  isAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await UserModel.findById(req.user._id);
    const post = await PostModel.create({
      post: req.body.post,
      images: req.body.images,
      authorName: user?.name,
      userId: user?._id,
    });
    res.send({ message: "Post Created" });
  })
);

postRouter.delete(
  "/delete/:id",
  asyncHandler(async (req: Request, res: Response) => {
    await PostModel.findByIdAndDelete(req.params.id);
    res.json({ message: "Post Deleted" });
  })
);

postRouter.delete(
  "/comment",
  asyncHandler(async (req: Request, res: Response) => {
    const { postId, commentId } = req.body;

    const modifiedPost = await PostModel.findByIdAndUpdate(
      { _id: postId },
      { $pull: { comments: { _id: commentId } } },
      {
        new: true,
      }
    );
    res.json({ message: "Comment Deleted", post: modifiedPost });
  })
);

postRouter.put(
  "/like",
  isAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const updatedPost = await PostModel.findOneAndUpdate(
      { _id: req.body.postId, likers: { $ne: req.body.userName } },
      { $push: { likers: req.body.userName } },
      { new: true } // To return the updated document
    );

    res.json(updatedPost);
  })
);

postRouter.put(
  "/unlike",
  isAuth,
  asyncHandler(async (req: Request, res: Response) => {
    await PostModel.findOneAndUpdate(
      { _id: req.body.postId },
      { $pull: { likers: req.body.userName } }
    );

    res.json({ message: "unliked" });
  })
);

postRouter.put(
  "/comment",
  isAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const newComment = {
      userName: req.body.userName,
      comment: req.body.comment,
      createdAt: new Date(),
    };

    const updatedPost = await PostModel.findOneAndUpdate(
      { _id: req.body.postId },
      { $push: { comments: newComment } },
      { new: true } // To return the updated document
    );

    res.json(updatedPost);
  })
);

postRouter.put(
  "/update",
  isAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const updatedPost = await PostModel.findByIdAndUpdate(
      req.body.id,
      {
        $set: { post: req.body.post },
      },
      { new: true }
    );

    res.json({ message: "updated", doc: updatedPost });
  })
);

postRouter.post(
  "/share",
  isAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { originalPostId, shareMessage } = req.body;
    const user = await UserModel.findById(req.user._id);

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
      res.status(400).json({ message: "Post already shared by this user" });
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
  })
);
