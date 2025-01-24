import mongoose, { Document, Schema } from "mongoose";

export interface User extends Document {
  username: string;
  password: string;
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

export const User = mongoose.model<User>("User", UserSchema);
