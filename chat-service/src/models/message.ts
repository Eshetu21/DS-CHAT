import mongoose, { Document, Schema } from "mongoose";

export interface IMessage extends Document {
  sender: string;
  recipient: string;
  content: string;
  timestamp: Date;
}

const MessageSchema: Schema = new Schema({
  sender: { type: String, required: true },
  recipient: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export const Message = mongoose.model<IMessage>("Message", MessageSchema);
