import { Request, Response } from "express";
import { supabase } from "../config/supabase";

export const sendMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { sender_id, receiver_id, message } = req.body;
  const { error } = await supabase
    .from("chats")
    .insert([{ sender_id, receiver_id, message }]);

  if (error) res.status(400).json({ error: error.message });
  res.json({ message: "Message sent sucessfully" });
};

export const getMessages = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.params;

  const { data, error } = await supabase
    .from("chats")
    .select("*")
    .or(`sender_id.er.${userId},receiver_id.eq.${userId}`);
  if (error) res.status(400).json({ error: error.message });
  res.json({ chats: data });
};

