import express from 'express';
import { isAuth } from '../utils';
import { createComment, getCommentsByPost } from '../controllers/commentController';

export const commentRouter = express.Router();

commentRouter.post('/', isAuth, createComment);
commentRouter.get('/post/:postId', isAuth, getCommentsByPost);
