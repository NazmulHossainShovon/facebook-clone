import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

if (!region || !accessKeyId || !secretAccessKey) {
  throw new Error("Missing AWS environment variables for Lambda client");
}

const lambda = new LambdaClient({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

/**
 * Invokes the audio removal Lambda function
 * @param bucket S3 bucket name
 * @param key S3 key for the video file
 * @returns Promise that resolves with the Lambda invocation result
 */
export const invokeAudioRemovalLambda = async (bucket: string, key: string) => {
  // Prepare the payload for the Lambda function
  const payload = {
    bucket,
    key
  };

  // Create the invoke command
  const command = new InvokeCommand({
    FunctionName: process.env.AUDIO_REMOVAL_LAMBDA_NAME || "audio-removal-function",
    InvocationType: "Event", // Asynchronous invocation
    Payload: Buffer.from(JSON.stringify(payload)),
  });

  try {
    // Invoke the Lambda function
    const response = await lambda.send(command);
    console.log("Lambda function invoked successfully:", response);
    return response;
  } catch (error) {
    console.error("Error invoking Lambda function:", error);
    throw error;
  }
};