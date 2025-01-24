import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/users";

interface AuthRequestBody {
  username: string;
  password: string;
}

export const registerUser = async (
  req: Request<{}, {}, AuthRequestBody>,
  res: Response
): Promise<void> => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      res.status(400).json({ error: "Username is already taken" });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, password: hashedPassword });

    res.status(201).json({
      message: "User registered successfully",
      user: { id: newUser.id, username: newUser.username }, 
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const loginUser = async (
  req: Request<{}, {}, AuthRequestBody>, 
  res: Response
): Promise<void> => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || "default_secret", 
      { expiresIn: "5h" } 
    );

    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

