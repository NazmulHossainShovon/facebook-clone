import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { CommentModel } from '../models/commentModel';

export const createComment = asyncHandler(async (req: Request, res: Response) => {
  const { postId, content } = req.body;
  const comment = await CommentModel.create({
    postId,
    userId: req.user._id,
    content,
  });
  res.status(201).json(comment);
});

export const getCommentsByPost = asyncHandler(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const comments = await CommentModel.find({ postId })
    .populate('userId', 'name')
    .sort({ createdAt: -1 });
  res.json(comments);
});

export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
  const { commentId } = req.params;
  const comment = await CommentModel.findById(commentId);

  if (!comment) {
    res.status(404).json({ message: 'Comment not found' });
    return;
  }

  const isOwner = comment.userId?.toString?.() === req.user._id;
  if (!isOwner && !req.user.isAdmin) {
    res.status(403).json({ message: 'Not authorized to delete this comment' });
    return;
  }

  await CommentModel.findByIdAndDelete(commentId);
  res.json({ message: 'Comment deleted' });
});
