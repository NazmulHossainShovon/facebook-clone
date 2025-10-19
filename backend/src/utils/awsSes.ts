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
  const emailParams = {
    Source: "shovon2228@gmail.com",
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Subject: {
        Data: "Your Dubbed Video is Ready!",
      },
      Body: {
        Text: {
          Data: `Hi ${name},\n\nYour dubbed video is ready! You can download or stream it using the following link:\n\n${mergedVideoS3Url}\n\nThank you for using our service.`,
        },
        Html: {
          Data: `<html><body><h3>Hi ${name},</h3><p>Your dubbed video is ready! You can download or stream it using the following link:</p><p><a href="${mergedVideoS3Url}">Download Your Dubbed Video</a></p><p>Thank you for using our service.</p></body></html>`,
        },
      },
    },
  };

  try {
    await sesClient.send(new SendEmailCommand(emailParams));
    console.log(`Merged video email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`Error sending merged video email: ${error}`);
    return false;
  }
};
