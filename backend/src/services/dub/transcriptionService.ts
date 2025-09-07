import { AssemblyAI } from "assemblyai";
import fs from "fs";
import path from "path";

// Initialize AssemblyAI client
const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY || "",
});

// Interface for pause detection data
interface PauseData {
  duration: number;
  position: {
    afterWord: string;
    beforeWord: string;
  };
  timing: {
    start: number;
    end: number;
  };
}

/** 
 * Saves pause data to a JSON file
 * @param pauses Array of pause data
 * @param originalFileName The original video filename
 * @returns Path to the saved pause data file
 */
export const savePauseDataToFile = (pauses: PauseData[], originalFileName: string): string => {
  try {
    // Create downloads directory if it doesn't exist
    const downloadsDir = path.join(__dirname, "downloads");
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }
    
    // Create pause data filename
    const fileNameWithoutExt = path.parse(originalFileName).name;
    const pauseDataFilePath = path.join(downloadsDir, `${fileNameWithoutExt}_pauses.json`);
    
    // Write pause data to JSON file
    fs.writeFileSync(pauseDataFilePath, JSON.stringify(pauses, null, 2), "utf8");
    
    console.log(`Pause data saved to: ${pauseDataFilePath}`);
    return pauseDataFilePath;
  } catch (error) {
    console.error("Error saving pause data to file:", error);
    throw error;
  }
};

/**
 * Transcribes a video or audio file using AssemblyAI with speaker diarization for pause detection
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
    
    // Create a transcription request with language support and speaker diarization
    console.log("Creating transcription request with speaker diarization...");
    const transcriptionParams: any = {
      audio_url: uploadResult,
      speaker_labels: true, // Enable speaker diarization
      punctuate: true,      // Enable punctuation for better pause detection
      format_text: true,    // Format text with proper spacing
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
 * Gets the transcription result from AssemblyAI including word timing for pause detection
 * @param transcriptionId The ID of the transcription
 * @returns Promise that resolves with the transcribed text and word timing data
 */
export const getTranscriptionResult = async (transcriptionId: string): Promise<{
  text: string;
  words?: Array<{
    text: string;
    start: number;
    end: number;
    confidence: number;
    speaker?: string | null;
  }> | undefined;
  utterances?: any[] | undefined;
}> => {
  try {
    console.log("Polling for transcription result with word timing...");
    
    // Request full transcription with word timing and speaker diarization
    let transcription = await client.transcripts.get(transcriptionId);
    
    while (transcription.status !== 'completed') {
      if (transcription.status === 'error') {
        throw new Error(`Transcription failed: ${transcription.error}`);
      }
      
      // Wait 3 seconds before retrying
      await new Promise(res => setTimeout(res, 3000));
      transcription = await client.transcripts.get(transcriptionId);
    }

    console.log("Transcription completed with word timing and speaker data!");
    
    // Return text, words timing data, and utterances for pause detection
    return {
      text: transcription.text || "",
      words: transcription.words || undefined,
      utterances: transcription.utterances || undefined
    };
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