import mongoose, { Document, Schema } from "mongoose";

export interface IChatRoom extends Document {
  participants: mongoose.Types.ObjectId[];
  createdAt: Date;
  lastActivity: Date;
}

const chatRoomSchema = new Schema<IChatRoom>({
  participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
  createdAt: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now },
});

export const ChatRoom = mongoose.model<IChatRoom>("ChatRoom", chatRoomSchema);
