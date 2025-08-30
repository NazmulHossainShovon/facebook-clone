import mongoose, { Document, Schema } from "mongoose";

export type MessageType = "text" | "image" | "file";

export interface IMessage extends Document {
  chatRoomId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  content: string;
  timestamp: Date;
  messageType: MessageType;
}

const messageSchema = new Schema<IMessage>({
  chatRoomId: { type: Schema.Types.ObjectId, ref: "ChatRoom", required: true },
  senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  messageType: {
    type: String,
    enum: ["text", "image", "file"],
    default: "text",
  },
});

export const Message = mongoose.model<IMessage>("Message", messageSchema);
