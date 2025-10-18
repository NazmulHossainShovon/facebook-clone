import { Router } from "express";
import {
  createChatRoom,
  getChatHistory,
  getUserChatRooms,
  markMessagesAsRead,
  deleteMessage,
} from "../controllers/chatController";

const router = Router();

// Create new chat room
router.post("/rooms", createChatRoom);

// Get user's chat rooms
router.get("/rooms/:userId", getUserChatRooms);

// Get chat history for a room
router.get("/messages/:chatRoomId", getChatHistory);

// (Optional) Mark messages as read
router.post("/messages/mark-read", markMessagesAsRead);

// Delete a message by ID
router.delete("/messages/:messageId", deleteMessage);

export default router;
