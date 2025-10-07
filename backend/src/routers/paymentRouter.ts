import { Router, Request, Response, NextFunction } from "express";
import { UserModel } from "../models/userModel";
import crypto from "crypto";
import { isAuth } from "../utils";

interface PaddleRequest extends Request {
  rawBody?: string;
}

const router = Router();

// Raw body parser for signature verification
router.use(
  "/paddle-webhook",
  (req: PaddleRequest, res: Response, next: NextFunction) => {
    let data = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      req.rawBody = data;
      next();
    });
  }
);

// Paddle webhook endpoint
// router.post("/paddle-webhook", async (req, res) => {
//   try {
//     const signature = req.headers["paddle-signature"] as string;
//     const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;

//     if (!webhookSecret) {
//       console.error("PADDLE_WEBHOOK_SECRET not set");
//       return res.status(500).send("Server configuration error");
//     }

//     // Verify webhook signature
//     const expectedSignature = crypto
//       .createHmac("sha256", webhookSecret)
//       .update(req.rawBody)
//       .digest("hex");

//     if (signature !== expectedSignature) {
//       console.error("Invalid Paddle webhook signature");
//       return res.status(401).send("Invalid signature");
//     }

//     const event = JSON.parse(req.rawBody);
//     console.log("Paddle event:", event);

//     if (event.alert_name === "transaction_completed") {
//       const { custom_data, subscription_id, status } = event.data;
//       const userId = custom_data?.user_id;

//       if (userId && status === "completed") {
//         // Update user in DB
//         const updatedUser = await UserModel.findByIdAndUpdate(
//           userId,
//           {
//             paddleSubscriptionId: subscription_id,
//             isPremium: true,
//             paymentStatus: "active",
//           },
//           { new: true }
//         );

//         if (updatedUser) {
//           console.log("User updated:", updatedUser);
//         } else {
//           console.error("User not found:", userId);
//         }
//       }
//     } else if (event.alert_name === "subscription_cancelled") {
//       const { custom_data, subscription_id } = event.data;
//       const userId = custom_data?.user_id;

//       if (userId) {
//         // Update user in DB to mark subscription as cancelled
//         const updatedUser = await UserModel.findByIdAndUpdate(
//           userId,
//           {
//             isPremium: false,
//             paymentStatus: "cancelled",
//           },
//           { new: true }
//         );

//         if (updatedUser) {
//           console.log("User subscription cancelled:", updatedUser);
//         }
//       }
//     }

//     // Acknowledge webhook
//     res.status(200).send("OK");
//   } catch (error) {
//     console.error("Error processing Paddle webhook:", error);
//     res.status(500).send("Error processing webhook");
//   }
// });

// Payment status check endpoint
router.get("/payment-status", isAuth, async (req, res) => {
  try {
    const userId = (req as any).user._id; // From isAuth middleware

    const user = await UserModel.findById(userId).select(
      "isPremium paymentStatus paddleSubscriptionId"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      isPremium: user.isPremium,
      paymentStatus: user.paymentStatus,
      paddleSubscriptionId: user.paddleSubscriptionId,
    });
  } catch (error) {
    console.error("Error fetching payment status:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
