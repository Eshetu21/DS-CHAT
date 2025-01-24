import WebSocket from "ws";
import dotenv from "dotenv";
import { connectToRabbitMQ } from "./rabbitmq";
import { addClient, removeClient } from "./userUtils";

dotenv.config();

const PORT = Number(process.env.WS_PORT) || 5003;
const wss = new WebSocket.Server({ port: PORT });

console.log(`[DEBUG] WebSocket Server starting on port ${PORT}...`);

wss.on("connection", (ws) => {
  const userId = Date.now().toString();
  addClient(userId, ws);
  console.log(`[INFO] User ${userId} connected`);

  ws.on("message", (message) => {
    console.log(`[DEBUG] Message from ${userId}:`, message.toString());
  });

  ws.on("error", (error) => {
    console.error(`[ERROR] WebSocket error for User ${userId}:`, error);
  });

  ws.on("close", (code, reason) => {
    removeClient(userId);
    console.log(`[INFO] User ${userId} disconnected | Code: ${code} | Reason: ${reason}`);
  });
});

connectToRabbitMQ().then(() => {
  console.log(`[DEBUG] RabbitMQ connection established.`);
}).catch((err) => {
  console.error(`[ERROR] RabbitMQ connection failed:`, err);
});

console.log(`[DEBUG] WebSocket Service running on port ${PORT}`);

