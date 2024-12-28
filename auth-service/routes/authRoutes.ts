import { Router } from "express";
import { login, verifyMagicLink } from "../controllers/authController";

const router = Router();

router.post("/login", login);
router.get("/verify-magic", verifyMagicLink);

export default router;

