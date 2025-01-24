import mongoose from "mongoose";

export const connectDB = async () => {
  try {
     await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/auth-service");
    console.log("Auth Service: MongoDB connected");
  } catch (error) {
    console.error("Auth Service: MongoDB connection failed", error);
    process.exit(1);
  }
};

