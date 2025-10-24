import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import axios from "axios";

const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const API_KEY = process.env.AHASEND_API_KEY;
const ACCOUNT_ID = process.env.AHASEND_ACCOUNT_ID;

if (!region || !accessKeyId || !secretAccessKey) {
  throw new Error("Missing AWS environment variables for SES");
}

const sesClient = new SESClient({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export const sendWelcomeEmail = async (
  email: string,
  name: string
): Promise<boolean> => {
  const emailParams = {
    Source: "shovon2228@gmail.com",
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Subject: {
        Data: "Welcome to Facebook Clone!",
      },
      Body: {
        Text: {
          Data: `Hi ${name}, welcome to Facebook Clone! We're excited to have you.`,
        },
        Html: {
          Data: `<html><body><h3>Hi ${name},</h3><p>Welcome to Facebook Clone! We're excited to have you.</p></body></html>`,
        },
      },
    },
  };

  try {
    await sesClient.send(new SendEmailCommand(emailParams));
    console.log(`Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`Error sending welcome email: ${error}`);
    return false;
  }
};

export const sendMergedVideoEmail = async (
  email: string,
  name: string,
  mergedVideoS3Url: string
): Promise<boolean> => {
  if (!API_KEY || !ACCOUNT_ID) {
    console.error("Missing AHASEND environment variables");
    return false;
  }

  try {
    const url = `https://api.ahasend.com/v2/accounts/${ACCOUNT_ID}/messages`;
    const payload = {
      from: { 
        email: "no-reply@appq.online", 
        name: "Facebook Clone" 
      },
      recipients: [{ 
        email: email, 
        name: name 
      }],
      subject: "Your Dubbed Video is Ready!",
      text_content: `Hi ${name},\n\nYour dubbed video is ready! You can download or stream it using the following link:\n\n${mergedVideoS3Url}\n\nThank you for using our service.`,
      html_content: `<html><body><h3>Hi ${name},</h3><p>Your dubbed video is ready! You can download or stream it using the following link:</p><p><a href="${mergedVideoS3Url}">Download Your Dubbed Video</a></p><p>Thank you for using our service.</p></body></html>`,
    };

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    console.log(`Merged video email sent to ${email}`, response.data);
    return true;
  } catch (error) {
    console.error(`Error sending merged video email via ahasend: ${error}`);
    return false;
  }
};
