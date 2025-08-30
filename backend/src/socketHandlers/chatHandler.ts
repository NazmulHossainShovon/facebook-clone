import { Server, Socket } from "socket.io";
import { Message } from "../models/messageModel";
import mongoose from "mongoose";

export function registerChatHandlers(io: Server, socket: Socket) {
  // Listen for join room
  socket.on("joinRoom", (roomId: string) => {
    socket.join(roomId);
  });

  // Listen for sending a message
  socket.on(
    "chatMessage",
    async (data: { roomId: string; message: string; sender: string }) => {
      console.log(data.message);
      try {
        const msg = await Message.create({
          chatRoomId: new mongoose.Types.ObjectId(data.roomId),
          senderId: new mongoose.Types.ObjectId(data.sender),
          content: data.message,
          messageType: "text",
        });
        io.to(data.roomId).emit("chatMessage", {
          id: msg._id,
          content: msg.content,
          senderId: msg.senderId,
          timestamp: msg.timestamp,
          messageType: msg.messageType,
        });
      } catch (err) {
        // Optionally emit an error event

        socket.emit("chatError", { error: "Failed to save message" });
      }
    }
  );

  // Handle disconnect
  socket.on("disconnect", () => {
    // Optionally handle user disconnect logic
  });
}
