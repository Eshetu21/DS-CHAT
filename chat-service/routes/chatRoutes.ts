import { Router } from "express";
import {sendMessage,getMessages} from "../controllers/chatController"
const router = Router();

router.post("/send", sendMessage);
router.post("/messages/:userId", getMessages);

export default router;

