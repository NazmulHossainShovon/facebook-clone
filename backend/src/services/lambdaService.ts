import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const region = process.env.AWS_REGION;
const bucketName = process.env.AWS_S3_BUCKET;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

if (!region || !bucketName || !accessKeyId || !secretAccessKey) {
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
 * @returns Promise that resolves with the S3 URL of the processed video
 */
export const invokeAudioRemovalLambda = async (
  bucket: string,
  key: string
): Promise<string | undefined> => {
  // Prepare the payload for the Lambda function
  const payload = {
    bucket,
    key,
  };

  // Create the invoke command with RequestResponse type to get the response
  const command = new InvokeCommand({
    FunctionName:
      process.env.AUDIO_REMOVAL_LAMBDA_NAME || "audio-removal-function",
    InvocationType: "RequestResponse", // Synchronous invocation to get the response
    Payload: Buffer.from(JSON.stringify(payload)),
  });

  try {
    // Invoke the Lambda function
    const response = await lambda.send(command);

    // Check if the invocation was successful
    if (response.StatusCode !== 200) {
      throw new Error(
        `Lambda invocation failed with status code: ${response.StatusCode}`
      );
    }

    // Parse the response payload
    if (response.Payload) {
      const payloadString = new TextDecoder().decode(response.Payload);
      const payloadData = JSON.parse(payloadString);

      // Extract the body from the Lambda response and parse it
      if (payloadData.body) {
        const bodyData = JSON.parse(payloadData.body);
        const outputKey = bodyData.outputKey;

        if (outputKey) {
          // Construct and return the S3 URL
          const s3Url = `https://${bucketName}.s3.${region}.amazonaws.com/${outputKey}`;
          console.log(
            "Lambda function processed successfully, output URL:",
            s3Url
          );
          return s3Url;
        } else {
          throw new Error(
            "Lambda function did not return outputKey in response body"
          );
        }
      } else {
        throw new Error("Lambda function did not return body in response");
      }
    } else {
      throw new Error("Lambda function returned empty payload");
    }
  } catch (error) {
    console.error("Error invoking Lambda function:", error);
    throw error;
  }
};

/**
 * Invokes the video merge Lambda function
 * @param bucket S3 bucket name
 * @param videoKey S3 key for the video file
 * @param audioKey S3 key for the audio file
 * @param outputKey S3 key for the output merged video file
 * @returns Promise that resolves with the S3 URL of the merged video
 */
export const invokeVideoMergeLambda = async (
  bucket: string,
  videoKey: string,
  audioKey: string,
  outputKey: string
): Promise<string | undefined> => {
  // Prepare the payload for the Lambda function
  const payload = {
    bucket,
    videoKey,
    audioKey,
    outputKey,
  };

  // Create the invoke command with RequestResponse type to get the response
  const command = new InvokeCommand({
    FunctionName: process.env.VIDEO_MERGE_LAMBDA_NAME || "video-merge-function",
    InvocationType: "RequestResponse", // Synchronous invocation to get the response
    Payload: Buffer.from(JSON.stringify(payload)),
  });

  try {
    // Invoke the Lambda function
    const response = await lambda.send(command);

    // Check if the invocation was successful
    if (response.StatusCode !== 200) {
      throw new Error(
        `Lambda invocation failed with status code: ${response.StatusCode}`
      );
    }

    // Parse the response payload
    if (response.Payload) {
      const payloadString = new TextDecoder().decode(response.Payload);

      const payloadData = JSON.parse(payloadString);

      // Extract the body from the Lambda response and parse it
      if (payloadData.body) {
        const bodyData = JSON.parse(payloadData.body);
        const mergedUrl = bodyData.mergedUrl;

        if (mergedUrl) {
          console.log(
            "Lambda function processed successfully, merged video URL:",
            mergedUrl
          );
          return mergedUrl;
        } else {
          throw new Error(
            "Lambda function did not return mergedUrl in response body"
          );
        }
      } else {
        throw new Error("Lambda function did not return body in response");
      }
    } else {
      throw new Error("Lambda function returned empty payload");
    }
  } catch (error) {
    console.error("Error invoking Lambda function:", error);
    throw error;
  }
};
