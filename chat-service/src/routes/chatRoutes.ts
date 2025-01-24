import express from "express";
import { sendMessage, getChatHistory } from "../controllers/chatController";

const router = express.Router();

router.post("/chat/send", sendMessage);
router.get("/chat/history", getChatHistory);

export default router;
