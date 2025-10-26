import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import { userRouter } from "./routers/userRouter";
import { postRouter } from "./routers/postRouter";
import { searchRouter } from "./routers/searchRouter";
import { commentRouter } from "./routers/commentRouter";
import s3Router from "./routers/s3Router";
import chatRouter from "./routers/chatRouter";
import { dubRouter } from "./routers/dubRouter";
import paymentRouter from "./routers/paymentRouter";
import { geminiRouter } from "./routers/geminiRouter";
import { createServer } from "http";
import { Server } from "socket.io";
import { registerChatHandlers } from "./socketHandlers/chatHandler";
import passport from "./config/passport";

export const userSocketMap = new Map<string, string>();

const MONGODB_URI = process.env.MONGODB_URI || "";
mongoose.set("strictQuery", true);
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("connected to mongodb");
  })
  .catch(() => {
    console.log("error mongodb");
  });

const app = express();
const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://facebook-clone-vooq.onrender.com",
      "https://www.appq.online",
    ],
    methods: ["GET", "POST"],
  },
});
app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:3000",
      "https://facebook-clone-vooq.onrender.com",
      "https://www.appq.online",
    ],
  })
);

// Use raw body parser specifically for Paddle webhooks before the JSON parser
app.use("/paddle/webhook", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize passport
app.use(passport.initialize());

app.get("/", (req, res) => {
  res.send("Hello from the server!");
});

app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/search", searchRouter);
app.use("/api/comments", commentRouter);
app.use("/api/s3", s3Router);
app.use("/api/chat", chatRouter);
app.use("/api/dub", dubRouter);
app.use("/api", paymentRouter);
app.use("/api/gemini", geminiRouter);

// Separate route for Paddle webhook to avoid JSON parsing interference
import { handlePaddleWebhook } from "./routers/paymentRouter";
app.post("/paddle/webhook", handlePaddleWebhook);

const PORT: number = parseInt((process.env.PORT || "4000") as string, 10);

io.on("connection", (socket) => {
  socket.on("storeUser", (userName: string) => {
    userSocketMap.set(userName, socket.id);
  });

  // Register chat handlers
  registerChatHandlers(io, socket);

  socket.on("disconnect", () => {});
});

httpServer.listen(PORT, () => {
  console.log(`server started at http://localhost:${PORT}`);
});
