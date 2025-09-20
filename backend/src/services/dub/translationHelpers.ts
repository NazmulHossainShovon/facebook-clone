import {
  TranslateClient,
  TranslateTextCommand,
} from "@aws-sdk/client-translate";
import fs from "fs";
import path from "path";

/**
 * Creates and configures an AWS Translate client
 * @returns Configured TranslateClient instance
 */
export const createTranslateClient = (): TranslateClient => {
  return new TranslateClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
  });
};

/**
 * Translates text using AWS Translate service
 * @param client Configured TranslateClient instance
 * @param text Text to translate
 * @param targetLanguage Target language code (default: 'en')
 * @returns Translated text or undefined if translation fails
 */
export const translateText = async (
  client: TranslateClient,
  text: string,
  targetLanguage = "en"
): Promise<string | undefined> => {
  try {
    const params = {
      Text: text,
      SourceLanguageCode: "auto",
      TargetLanguageCode: targetLanguage,
    };

    const command = new TranslateTextCommand(params);
    const response = await client.send(command);

    if (!response.TranslatedText) {
      console.error("Translation failed: No translated text returned");
      return undefined;
    }

    return response.TranslatedText;
  } catch (error) {
    console.error("Error translating text:", error);
    return undefined;
  }
};

/**
 * Ensures the downloads directory exists
 * @returns Path to the downloads directory
 */
export const ensureDownloadsDirectory = (): string => {
  const downloadsDir = path.join(__dirname, "downloads");
  if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
  }
  return downloadsDir;
};

/**
 * Generates the filename for translated text files
 * @param originalFileName The original video filename
 * @param targetLanguage Target language code
 * @returns Generated filename for the translated text file
 */
export const generateTranslatedFileName = (
  originalFileName: string,
  targetLanguage: string
): string => {
  const fileNameWithoutExt = path.parse(originalFileName).name;
  return `${fileNameWithoutExt}_${targetLanguage}.txt`;
};

/**
 * Saves translated text to a file
 * @param translatedText The translated text to save
 * @param filePath Full path to save the file
 * @returns Boolean indicating success or failure
 */
export const saveTranslatedTextToFile = (
  translatedText: string,
  filePath: string
): boolean => {
  try {
    fs.writeFileSync(filePath, translatedText, "utf8");
    console.log(`Translated transcription text saved to: ${filePath}`);
    return true;
  } catch (error) {
    console.error("Error saving translated text to file:", error);
    return false;
  }
};