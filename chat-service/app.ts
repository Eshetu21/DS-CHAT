import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import authRoutes from "./routes/chatRoutes";

const app = express();

app.use(cors());

app.use(bodyParser.json());
app.use("/chat", authRoutes);

export default app;
