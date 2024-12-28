import { Request, Response } from "express";
import { sendMagicLink, verifyMagicLinkToken } from "../auth-service/authService";

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    const result = await sendMagicLink(email);
    if (result.error) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.json({ message: "Magic link sent!" });
  } catch (error) {
    console.error("Error in login handler:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const verifyMagicLink = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, token } = req.query;

    if (!email || !token) {
      res.status(400).json({ error: "Email and token are required" });
      return;
    }

    const user = await verifyMagicLinkToken(email as string, token as string);
    if (!user) {
      res.status(400).json({ error: "Invalid or expired token" });
      return;
    }

    res.json({ message: "Login successful", user });
  } catch (error) {
    console.error("Error verifying magic link:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

