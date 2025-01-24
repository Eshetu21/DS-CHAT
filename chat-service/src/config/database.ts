import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/chat-service");
    console.log("Chat Service: MongoDB connected");
  } catch (error) {
    console.error("Chat Service: MongoDB connection failed", error);
    process.exit(1);
  }
};

