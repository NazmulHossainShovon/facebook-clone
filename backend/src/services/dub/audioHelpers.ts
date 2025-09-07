import {
  PollyClient,
  SynthesizeSpeechCommand,
  OutputFormat,
  VoiceId,
} from "@aws-sdk/client-polly";
import fs from "fs";
import path from "path";

/**
 * Converts a ReadableStream to a Buffer
 * @param stream The ReadableStream to convert
 * @returns A Promise that resolves to a Buffer
 */
export const streamToBuffer = async (stream: any): Promise<Buffer> => {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};

/**
 * Creates audio from translated text file using AWS Polly and saves it in the same location
 * @param translatedTextFilePath Path to the translated text file
 * @returns Path to the saved audio file
 */
export const createAudioFromTranslatedText = async (
  translatedTextFilePath: string | undefined
): Promise<string | undefined> => {
  try {
    if (!translatedTextFilePath || !fs.existsSync(translatedTextFilePath)) {
      console.error("Translated text file not found");
      return undefined;
    }

    // Read translated text from file
    const text = fs.readFileSync(translatedTextFilePath, "utf8");

    // Create AWS Polly client
    const client = new PollyClient({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
    });

    // Configure Polly parameters with proper types
    const params = {
      Text: text,
      OutputFormat: OutputFormat.MP3,
      VoiceId: VoiceId.Joanna, // Default voice, can be customized
    };

    // Synthesize speech
    const command = new SynthesizeSpeechCommand(params);
    const response = await client.send(command);

    // Check if audio stream is available
    if (!response.AudioStream) {
      console.error("Audio synthesis failed: No audio stream returned");
      return undefined;
    }

    // Create audio filename (same base name as translated text file but with .mp3 extension)
    const parsedPath = path.parse(translatedTextFilePath);
    const audioFilePath = path.join(parsedPath.dir, `${parsedPath.name}.mp3`);

    // Write audio stream to file
    const audioBuffer = await streamToBuffer(response.AudioStream);
    fs.writeFileSync(audioFilePath, audioBuffer);

    console.log(`Audio file saved to: ${audioFilePath}`);
    return audioFilePath;
  } catch (error) {
    console.error("Error creating audio from translated text:", error);
    return undefined;
  }
};