import { Request, Response } from "express";
import mongoose from "mongoose";
import { ChatRoom } from "../models/chatRoomModel";
import { Message } from "../models/messageModel";

export const createChatRoom = async (req: Request, res: Response) => {
  try {
    const { participantIds } = req.body; // Array of user IDs
    if (
      !participantIds ||
      !Array.isArray(participantIds) ||
      participantIds.length < 2
    ) {
      return res
        .status(400)
        .json({ message: "At least two participants required." });
    }
    // Check if a room with the same participants exists
    const existingRoom = await ChatRoom.findOne({
      participants: { $all: participantIds, $size: participantIds.length },
    });
    if (existingRoom) {
      return res.status(200).json(existingRoom);
    }
    const chatRoom = new ChatRoom({ participants: participantIds });
    await chatRoom.save();
    res.status(201).json(chatRoom);
  } catch (err) {
    res.status(500).json({ message: "Failed to create chat room", error: err });
  }
};

export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const { chatRoomId } = req.params;
    const messages = await Message.find({ chatRoomId }).sort({ timestamp: 1 });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to get chat history", error: err });
  }
};

export const getUserChatRooms = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const chatRooms = await ChatRoom.find({ participants: userId }).sort({
      lastActivity: -1,
    });
    res.status(200).json(chatRooms);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to get user chat rooms", error: err });
  }
};

export const markMessagesAsRead = async (req: Request, res: Response) => {
  try {
    // This is a placeholder. You may want to add a 'read' field to Message model for real implementation.
    res
      .status(200)
      .json({ message: "Messages marked as read (not implemented)" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to mark messages as read", error: err });
  }
};
