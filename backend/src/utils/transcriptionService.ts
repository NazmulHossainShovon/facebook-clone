import { AssemblyAI } from "assemblyai";
import fs from "fs";
import path from "path";

// Initialize AssemblyAI client
const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY || "",
});

/**
 * Transcribes a video or audio file using AssemblyAI
 * @param filePath Path to the video/audio file
 * @param languageCode Language code for the audio (e.g., 'hi' for Hindi, 'en' for English)
 * @returns Promise that resolves with the transcribed text
 */
export const transcribeVideo = async (filePath: string, languageCode?: string): Promise<string> => {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Upload the file to AssemblyAI
    console.log("Uploading file to AssemblyAI...");
    const uploadResult = await client.files.upload(fs.createReadStream(filePath));
    
    // Create a transcription request with language support
    console.log("Creating transcription request...");
    const transcriptionParams: any = {
      audio_url: uploadResult,
    };
    
    // Add language code if provided
    if (languageCode) {
      transcriptionParams.language_code = languageCode;
    } else {
      // Enable automatic language detection if no language code is provided
      transcriptionParams.language_detection = true;
    }
    
    const transcription = await client.transcripts.create(transcriptionParams);
    
    console.log("Transcription ID:", transcription.id);
    return transcription.id;
  } catch (error) {
    console.error("Error uploading file for transcription:", error);
    throw error;
  }
};

/**
 * Gets the transcription result from AssemblyAI
 * @param transcriptionId The ID of the transcription
 * @returns Promise that resolves with the transcribed text
 */
export const getTranscriptionResult = async (transcriptionId: string): Promise<string> => {
  try {
    console.log("Polling for transcription result...");
    
    let transcription = await client.transcripts.get(transcriptionId);
    
    while (transcription.status !== 'completed') {
      if (transcription.status === 'error') {
        throw new Error(`Transcription failed: ${transcription.error}`);
      }
      
      // Wait 3 seconds before retrying
      await new Promise(res => setTimeout(res, 3000));
      transcription = await client.transcripts.get(transcriptionId);
    }

    console.log("Transcription completed!");
    return transcription.text || "";
  } catch (error) {
    console.error("Error getting transcription result:", error);
    throw error;
  }
};

/**
 * Saves transcription text to a file
 * @param text The transcribed text
 * @param originalFileName The original video filename
 * @returns Path to the saved transcription file
 */
export const saveTranscriptionToFile = (text: string, originalFileName: string): string => {
  try {
    // Create downloads directory if it doesn't exist
    const downloadsDir = path.join(__dirname, "downloads");
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }
    
    // Create transcription filename (replace extension with .txt)
    const fileNameWithoutExt = path.parse(originalFileName).name;
    const transcriptionFilePath = path.join(downloadsDir, `${fileNameWithoutExt}.txt`);
    
    // Write transcription to file
    fs.writeFileSync(transcriptionFilePath, text, "utf8");
    
    console.log(`Transcription saved to: ${transcriptionFilePath}`);
    return transcriptionFilePath;
  } catch (error) {
    console.error("Error saving transcription to file:", error);
    throw error;
  }
};