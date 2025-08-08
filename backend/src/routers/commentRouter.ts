import express from 'express';
import { isAuth } from '../utils';
import { createComment } from '../controllers/commentController';

export const commentRouter = express.Router();

commentRouter.post('/', isAuth, createComment);
