import { Router, Request, Response } from "express";
import { UserModel } from "../models/userModel";
import { Paddle } from "@paddle/paddle-node-sdk";
import { isAuth } from "../utils";

interface PaddleRequest extends Request {
  rawBody?: string;
}

const router = Router();

const paddle = new Paddle(process.env.PADDLE_API_KEY || "");

// Payment status check endpoint
// router.get("/payment-status", isAuth, async (req, res) => {
//   try {
//     const userId = (req as any).user._id; // From isAuth middleware

//     const user = await UserModel.findById(userId).select(
//       "isPremium paymentStatus paddleSubscriptionId"
//     );

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     res.json({
//       isPremium: user.isPremium,
//       paymentStatus: user.paymentStatus,
//       paddleSubscriptionId: user.paddleSubscriptionId,
//     });
//   } catch (error) {
//     console.error("Error fetching payment status:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// Separate webhook handler to be used directly in the main server file
export const handlePaddleWebhook = async (
  req: PaddleRequest,
  res: Response
) => {
  try {
    // The raw body is already available as a string in req.body when using express.raw
    // However, we need to ensure we're working with the string representation
    let rawBody: string;

    if (typeof req.body === "string") {
      rawBody = req.body;
    } else if (Buffer.isBuffer(req.body)) {
      rawBody = req.body.toString("utf-8");
    } else {
      rawBody = JSON.stringify(req.body);
    }

    const signature = req.headers["paddle-signature"]?.toString() || "";
    const secret = process.env.PADDLE_WEBHOOK_SECRET;

    if (!secret) {
      console.error("PADDLE_WEBHOOK_SECRET is not set");
      return res.status(400).send("Webhook secret not configured");
    }

    // Verify the webhook signature using Paddle SDK
    const eventData = await paddle.webhooks.unmarshal(
      rawBody,
      secret,
      signature
    );

    console.log(
      `Received Paddle event: ${eventData.eventType} at ${eventData.occurredAt}`
    );

    // Process the event asynchronously (without blocking the response)
    // We'll process the event in the background after responding with 200
    processPaddleEvent(eventData).catch((err) => {
      console.error("Error processing Paddle event:", err);
    });

    // Respond quickly with 200 OK to acknowledge receipt
    res.status(200).send("OK");
  } catch (err) {
    console.error("Webhook verification failed", err);
    res.status(400).send("Invalid signature");
  }
};

// Paddle webhook endpoint - this path should match the one configured in the main server
// This route is maintained in case it's needed, but the actual webhook endpoint is handled separately
router.post("/paddle/webhook", handlePaddleWebhook);

// Function to process Paddle events asynchronously
async function processPaddleEvent(eventData: any) {
  try {
    const eventType = eventData.eventType;
    const customData = eventData.data.customData;
    console.log("Processing event type:", eventType, "with data:", customData);

    switch (eventType) {
      case "subscription.activated":
      case "subscription.updated":
        // Handle subscription activation or update
        await handleSubscriptionUpdate(eventData);
        break;

      case "subscription.cancelled":
        // Handle subscription cancellation
        await handleSubscriptionCancellation(eventData);
        break;

      case "payment.succeeded":
        // Handle successful payment
        await handlePaymentSuccess(eventData);
        break;

      case "payment.failed":
        // Handle failed payment
        await handlePaymentFailure(eventData);
        break;
      case "transaction.completed":
        // Handle transaction completion
        await handlePaymentSuccess(eventData);
        break;

      default:
        console.log(`Unhandled event type: ${eventType}`);
        break;
    }
  } catch (error) {
    console.error(`Error processing ${eventData.eventType} event:`, error);
    // Consider implementing retry logic or dead letter queue here
  }
}

// Handler for subscription updates (activation or updates)
async function handleSubscriptionUpdate(eventData: any) {
  const subscriptionId = eventData.data.id;
  const customerId = eventData.data.customerId;
  const status = eventData.data.status;

  // Find user by Paddle customer ID or subscription ID
  const user = await UserModel.findOne({
    $or: [
      { paddleCustomerId: customerId },
      { paddleSubscriptionId: subscriptionId },
    ],
  });

  if (user) {
    // Update user's subscription status
    // user.paddleSubscriptionId = subscriptionId;
    // user.isPremium = status === "active" || status === "trialing";
    // user.paymentStatus = status;
    await user.save();

    console.log(`Updated user ${user._id} subscription status: ${status}`);
  } else {
    console.warn(
      `User not found for Paddle customer ID: ${customerId} or subscription ID: ${subscriptionId}`
    );
  }
}

// Handler for subscription cancellations
async function handleSubscriptionCancellation(eventData: any) {
  const subscriptionId = eventData.data.id;

  const user = await UserModel.findOne({
    paddleSubscriptionId: subscriptionId,
  });

  if (user) {
    // Update user's subscription status
    // user.isPremium = false;
    // user.paymentStatus = "cancelled";
    await user.save();

    console.log(`Cancelled subscription for user ${user._id}`);
  }
}

// Handler for successful payments
async function handlePaymentSuccess(eventData: any) {
  const transactionId = eventData.data.id;
  const customerId = eventData.data.customerId;

  // Update user's payment status if needed
  const user = await UserModel.findOne({ paddleCustomerId: customerId });

  if (user) {
    // user.paymentStatus = "paid";
    await user.save();

    console.log(
      `Payment successful for user ${user._id}, transaction: ${transactionId}`
    );
  }
}

// Handler for failed payments
async function handlePaymentFailure(eventData: any) {
  const transactionId = eventData.data.id;
  const customerId = eventData.data.customerId;

  const user = await UserModel.findOne({ paddleCustomerId: customerId });

  if (user) {
    // user.paymentStatus = "failed";
    await user.save();

    console.log(
      `Payment failed for user ${user._id}, transaction: ${transactionId}`
    );
  }
}

export default router;
