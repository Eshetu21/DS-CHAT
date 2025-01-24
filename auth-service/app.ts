import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./src/routes/authRoutes";
import { connectDB } from "./src/config/database";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use(authRoutes);

connectDB();

export default app;
