"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface Message {
  sender: string;
  content: string;
  recipient: string;
  timestamp: string;
}

const Chat = () => {
  const [recipient, setRecipient] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);

  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username"); 

  useEffect(() => {
    if (!token || !username) {
      alert("You need to log in first!");
      window.location.href = "/login";
      return;
    }

    const ws = new WebSocket(`ws://localhost:5003?token=${token}`);

    ws.onopen = () => {
      console.log("WebSocket connection established");
    };

    ws.onmessage = (event) => {
      try {
        const data: Message = JSON.parse(event.data);
        console.log("WebSocket message received:", data);
        setMessages((prev) => [...prev, data]);
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    setWebsocket(ws);

    return () => {
      if (ws) ws.close();
    };
  }, [token, username]);
  useEffect(() => {
    const fetchHistory = async () => {
      if (!recipient) return;
      try {
        const response = await axios.get(
          `http://localhost:5002/chat/history?user1=${username}&user2=${recipient}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMessages(response.data.data);
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      }
    };

    fetchHistory();

    const interval = setInterval(fetchHistory, 300);

    return () => clearInterval(interval);
  }, [recipient, token, username]);

  const sendMessage = async () => {
    if (!message || !recipient) return;

    try {
      const response = await axios.post(
        `http://localhost:5002/chat/send`,
        { sender: username, recipient, content: message },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages((prev) => [...prev, response.data.data]);
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {}
      <div className="bg-blue-600 text-white text-center py-4 text-xl font-bold">
        Chat Room
      </div>

      {}
      <div className="flex flex-col flex-1 overflow-hidden">
        {}
        <div className="p-4 bg-gray-100">
          <input
            type="text"
            placeholder="Enter recipient username"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-2 ${
                msg.sender === username ? "text-right" : "text-left"
              }`}
            >
              <span
                className={`px-3 py-1 rounded-lg inline-block ${
                  msg.sender === username
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300 text-black"
                }`}
              >
                <strong>{msg.sender}:</strong> {msg.content}
              </span>
            </div>
          ))}
        </div>

        {}
        <div className="p-4 bg-white flex border-t">
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            className="ml-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;

