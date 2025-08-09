import express from 'express';
import { isAuth } from '../utils';
import { createComment, getCommentsByPost, deleteComment } from '../controllers/commentController';

export const commentRouter = express.Router();

commentRouter.post('/', isAuth, createComment);
commentRouter.get('/post/:postId', isAuth, getCommentsByPost);
commentRouter.delete('/:commentId', isAuth, deleteComment);
