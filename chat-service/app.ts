import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import chatRoutes from "./src/routes/chatRoutes";
import { connectDB } from "./src/config/database";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use(chatRoutes);

connectDB();

export default app;

