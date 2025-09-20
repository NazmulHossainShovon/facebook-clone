import {
  PollyClient,
  SynthesizeSpeechCommand,
  OutputFormat,
  VoiceId,
  TextType,
} from "@aws-sdk/client-polly";
import fs from "fs";
import { PassThrough } from "stream";
import { generateS3Key, uploadStreamToS3 } from "../s3Service";
import { invokeVideoMergeLambda } from "../lambdaService";
import { getVoiceId } from "./voiceMapping";

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
 * Creates audio from translated text file using AWS Polly and uploads it to S3
 * @param translatedTextFilePath Path to the translated text file
 * @param targetLanguage Target language for voice selection
 * @param voiceGender Voice gender for voice selection
 * @returns S3 URL of the uploaded audio file
 */
export const createAudioFromTranslatedText = async (
  translatedTextFilePath: string | undefined,
  targetLanguage: string = 'en',
  voiceGender: string = 'female'
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

    // Get the appropriate voice for the target language and gender
    const selectedVoiceId = getVoiceId(targetLanguage, voiceGender as 'male' | 'female');
    console.log(`Using voice: ${selectedVoiceId} for language: ${targetLanguage}, gender: ${voiceGender}`);

    // Configure Polly parameters with proper types
    const params = {
      Text: text,
      TextType: "ssml" as TextType,
      OutputFormat: OutputFormat.MP3,
      VoiceId: selectedVoiceId as VoiceId,
    };

    // Synthesize speech
    const command = new SynthesizeSpeechCommand(params);
    const response = await client.send(command);

    // Check if audio stream is available
    if (!response.AudioStream) {
      console.error("Audio synthesis failed: No audio stream returned");
      return undefined;
    }

    // Generate S3 key for the audio file
    const s3Key = await generateS3Key("audios");

    // Convert the AudioStream to a PassThrough stream for S3 upload
    const passThroughStream = new PassThrough();
    const audioBuffer = await streamToBuffer(response.AudioStream);
    passThroughStream.end(audioBuffer);

    // Upload audio stream directly to S3
    const s3Url = await uploadStreamToS3(
      passThroughStream,
      s3Key,
      "audio/mpeg"
    );

    console.log(`Audio file uploaded to S3: ${s3Url}`);
    return s3Url;
  } catch (error) {
    console.error("Error creating audio from translated text:", error);
    return undefined;
  }
};

/**
 * Merges a video and audio file using AWS Lambda and uploads the result to S3
 * @param videoUrl URL of the video file
 * @param audioUrl URL of the audio file
 * @returns S3 URL of the merged video
 */
export const mergeVideoAndAudio = async (
  videoUrl: string,
  audioUrl: string
): Promise<string | undefined> => {
  try {
    // Extract bucket and key from URLs
    // Assuming URLs are in the format: https://bucket.s3.region.amazonaws.com/key
    const videoUrlObj = new URL(videoUrl);
    const audioUrlObj = new URL(audioUrl);

    const videoBucket = videoUrlObj.hostname.split(".")[0];
    const audioBucket = audioUrlObj.hostname.split(".")[0];

    // Verify both files are in the same bucket
    if (videoBucket !== audioBucket) {
      throw new Error("Video and audio files must be in the same S3 bucket");
    }

    const bucket = videoBucket;
    const videoKey = videoUrlObj.pathname.substring(1); // Remove leading slash
    const audioKey = audioUrlObj.pathname.substring(1); // Remove leading slash

    // Generate S3 key for the merged video
    const outputKey = await generateS3Key("videos");

    // Invoke the Lambda function to merge video and audio
    const mergedUrl = await invokeVideoMergeLambda(
      bucket,
      videoKey,
      audioKey,
      outputKey
    );

    if (!mergedUrl) {
      throw new Error("Failed to merge video and audio");
    }

    console.log(`Merged video: ${mergedUrl}`);
    return mergedUrl;
  } catch (error) {
    console.error("Error merging video and audio:", error);
    return undefined;
  }
};
