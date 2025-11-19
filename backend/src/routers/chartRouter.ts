import express from 'express';
import { checkChartLimit, useChartLimit } from '../controllers/chartController';
import { isAuth } from '../utils';

export const chartRouter = express.Router();

// Check if user has remaining chart generation limit
chartRouter.get('/check-limit', isAuth, checkChartLimit);

// Use one chart from the user's limit
chartRouter.post('/use-limit', isAuth, useChartLimit);