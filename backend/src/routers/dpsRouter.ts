import express from 'express';
import { checkDpsLimit, useDpsLimit } from '../controllers/dpsController';
import { isAuth } from '../utils';

export const dpsRouter = express.Router();

// Check if user has remaining DPS calculation limit
dpsRouter.get('/check-limit', isAuth, checkDpsLimit);

// Use one DPS calculation from the user's limit
dpsRouter.post('/use-limit', isAuth, useDpsLimit);