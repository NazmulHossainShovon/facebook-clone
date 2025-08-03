import { PostModel } from "../models/postModel";
import { SharedPostModel } from "../models/sharedPostModel";
import { UserModel } from "../models/userModel";
import { isAuth } from "../utils";
import express, { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { applyPagination, getPaginationParams } from "./utils/pagination";

// Types for posts with timestamps
interface PostWithTimestamps {
  _id: any;
  post: string;
  images?: string[];
  authorName: string;
  userId: string;
  likers: string[];
  comments: any[];
  shareCount?: number;
  createdAt: Date;
  updatedAt: Date;
  isShared: false;
}

interface SharedPostWithTimestamps {
  _id: any;
  originalPostId: string;
  sharedByUserId: string;
  sharedByUserName: string;
  shareMessage?: string;
  createdAt: Date;
  updatedAt: Date;
  originalPost?: PostWithTimestamps;
  isShared: true;
}

type CombinedPost = PostWithTimestamps | SharedPostWithTimestamps;

export const postRouter = express.Router();

postRouter.get(
  "/",
  isAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const pagination = getPaginationParams(req);
    const userName = req.query.userName as string;

    // Fetch regular posts by the user
    const regularPosts = await PostModel.find({ authorName: userName }).sort({
      createdAt: -1,
    });

    // Fetch shared posts by the user and populate original post data
    const sharedPosts = await SharedPostModel.find({
      sharedByUserName: userName,
    }).sort({ createdAt: -1 });

    // Get original posts for shared posts
    const sharedPostsWithOriginal = await Promise.all(
      sharedPosts.map(async (sharedPost) => {
        const originalPost = await PostModel.findById(
          sharedPost.originalPostId
        );
        return {
          ...sharedPost.toObject(),
          originalPost: originalPost?.toObject() as PostWithTimestamps,
          isShared: true as const,
        } as SharedPostWithTimestamps;
      })
    );

    // Combine all posts and sort by latest first
    const allPosts: CombinedPost[] = [
      ...regularPosts.map(
        (post) =>
          ({
            ...post.toObject(),
            isShared: false as const,
          } as PostWithTimestamps)
      ),
      ...sharedPostsWithOriginal.filter((item) => item.originalPost), // Only include if original post exists
    ].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.updatedAt);
      const dateB = new Date(b.createdAt || b.updatedAt);
      return dateB.getTime() - dateA.getTime();
    });

    // Apply pagination manually
    const { skip, limit } = pagination;
    const paginatedPosts = allPosts.slice(skip, skip + limit);
    const totalPages = Math.ceil(allPosts.length / limit);

    res.json({ posts: paginatedPosts, totalPages });
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
