import { Request, Response } from "express";
import { Message } from "../models/message";
import { sendNewMessageEvent } from "../events";

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { sender, recipient, content } = req.body;

    const newMessage = await Message.create({
      sender,
      recipient,
      content,
      timestamp: new Date(),
    });

    await sendNewMessageEvent(newMessage);

    res.status(201).json({ message: "Message sent successfully", data: newMessage });
  } catch (error) {
    res.status(500).json({ message: "Failed to send message", error });
  }
};

export const getChatHistory = async (req: Request, res: Response) => {
  const { user1, user2 } = req.query;

  try {
    const messages = await Message.find({
      $or: [
        { sender: user1, recipient: user2 },
        { sender: user2, recipient: user1 },
      ],
    }).sort("timestamp");

    res.json({ data: messages });
  } catch (error) {
    res.status(500).json({ error: "Error fetching messages" });
  }
};

