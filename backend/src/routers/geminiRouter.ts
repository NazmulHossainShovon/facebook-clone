import { Router } from "express";
import { getGeminiResponse } from "../controllers/geminiController";

const geminiRouter = Router();

geminiRouter.get("/", getGeminiResponse);

export { geminiRouter };