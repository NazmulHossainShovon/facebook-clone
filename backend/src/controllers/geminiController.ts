import { Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const getGeminiResponse = async (req: Request, res: Response) => {
  try {
    const { prompt } = req.query;

    if (!prompt || typeof prompt !== "string") {
      return res
        .status(400)
        .json({ error: "Prompt is required as a query parameter" });
    }

    const body = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    };

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "GEMINI_API_KEY environment variable is not set" });
    }

    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent",
      body,
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        timeout: 60000,
      }
    );

    const data = response.data || {};
    // Extract the text content from the response
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      // fall back to JSON string if none of the above
      JSON.stringify(data);

    res.json({ text, raw: data });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Request failed", details: error.message });
  }
};
