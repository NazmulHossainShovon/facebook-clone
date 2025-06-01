import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { userRouter } from "./routers/userRouter";
import { postRouter } from "./routers/postRouter";
import { searchRouter } from "./routers/searchRouter";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();

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
      "http://localhost:5173",
      "https://facebook-clone-vooq.onrender.com",
    ],
    methods: ["GET", "POST"],
  },
});
app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:5173",
      "https://facebook-clone-vooq.onrender.com",
    ],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello from the server!");
});

app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/search", searchRouter);

const PORT: number = parseInt((process.env.PORT || "4000") as string, 10);

io.on("connection", (socket) => {
  socket.on("storeUser", (userName: string) => {
    userSocketMap.set(userName, socket.id);
  });

  socket.on("disconnect", () => {});
});

httpServer.listen(PORT, () => {
  console.log(`server started at http://localhost:${PORT}`);
});
