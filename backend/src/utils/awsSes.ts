import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

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

export const sendWelcomeEmail = async (email: string, name: string): Promise<boolean> => {
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