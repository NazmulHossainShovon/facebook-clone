import express from 'express';
import { isAuth } from '../utils';
import { createComment, getCommentsByPost, deleteComment, updateComment } from '../controllers/commentController';

export const commentRouter = express.Router();

commentRouter.post('/', isAuth, createComment);
commentRouter.get('/post/:postId', isAuth, getCommentsByPost);
commentRouter.put('/:commentId', isAuth, updateComment);
commentRouter.delete('/:commentId', isAuth, deleteComment);
