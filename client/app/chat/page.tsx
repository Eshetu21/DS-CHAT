"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/utils/supabaseClient";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import refreshSession from "../components/RefreshSession";

const socket = io("http://localhost:5002");

const Chat = () => {
  const [user, setUser] = useState<any>(null);
  const [receiverId, setReceiverId] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<{ id: any; email: any }[]>([]);

  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        await refreshSession();

        if (error || !data.user) {
          console.error("Error fetching user:", error || "No user found");
          router.push("/");
        } else {
          setUser(data.user);
          await supabase.from("presence").upsert([
            {
              id: data.user.id,
              email: data.user.email,
              status: "online",
            },
          ]);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        router.push("/");
      }
    };

    fetchUser();
  }, [router]);

  useEffect(() => {
    const fetchOnlineUsers = async () => {
      const { data, error } = await supabase
        .from("presence")
        .select("id, email")
        .eq("status", "online");

      if (error) {
        console.error("Error fetching online users:", error);
      } else {
        setOnlineUsers(data);
      }
    };

    fetchOnlineUsers();
  }, []);

  const fetchChatHistory = async () => {
    if (!user || !receiverId) return;

    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`
      )
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching chat history:", error);
    } else {
      setMessages(data || []);
    }
  };

  useEffect(() => {
    const channel = supabase
      .channel("chat-updates")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chats" },
        (payload) => {
          const newMessage = payload.new;
          if (
            (newMessage.sender_id === user.id &&
              newMessage.receiver_id === receiverId) ||
            (newMessage.sender_id === receiverId &&
              newMessage.receiver_id === user.id)
          ) {
            setMessages((prev) => [...prev, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, receiverId]);

  useEffect(() => {
    const handleReceiveMessage = (data: any) => {
      if (data.sender_id !== user.id) {
        setMessages((prev) => [...prev, data]);
      }
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, []);

  useEffect(() => {
    fetchChatHistory();
  }, [receiverId]);

  const sendMessage = async () => {
    if (!user || !receiverId || !message.trim()) {
      alert("Please fill in all fields before sending a message.");
      return;
    }

    const newMessage = {
      sender_id: user.id,
      receiver_id: receiverId,
      message,
      created_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase.from("chats").insert([newMessage]);

      if (error) {
        throw new Error("Failed to send message");
      }

      socket.emit("send_message", newMessage);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    const handleDisconnect = async () => {
      if (user) {
        try {
          await supabase
            .from("presence")
            .update({ status: "offline" })
            .eq("id", user.id);
        } catch (error) {
          console.error("Error updating presence status on disconnect:", error);
        }
      }
    };

    window.addEventListener("beforeunload", handleDisconnect);

    return () => {
      window.removeEventListener("beforeunload", handleDisconnect);
      handleDisconnect(); 
    };
  }, [user]);

  if (!user) {
    return <div>Loading...</div>;
  }

  const filteredMessages = messages.filter(
    (msg) =>
      (msg.sender_id === user.id && msg.receiver_id === receiverId) ||
      (msg.sender_id === receiverId && msg.receiver_id === user.id)
  );

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <h1 className="text-2xl font-bold text-gray-700 mb-6">
        Welcome, {user.email}
      </h1>

      {}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Online Users
        </h2>
        {onlineUsers.length > 0 ? (
          <ul>
            {onlineUsers
              .filter((onlineUser) => onlineUser.id !== user.id)
              .map((user) => (
                <li
                  key={user.id}
                  onClick={() => setReceiverId(user.id)}
                  className="cursor-pointer p-2 mb-2 rounded-md bg-gray-100 hover:bg-gray-200"
                >
                  {user.email}
                </li>
              ))}
          </ul>
        ) : (
          <p className="text-gray-600">No users are online.</p>
        )}
      </div>

      {}
      <div className="bg-white rounded-lg shadow-lg p-4">
        {}
        <div className="mb-4">
          {filteredMessages.length > 0 ? (
            filteredMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-2 mb-3 rounded-lg ${
                  msg.sender_id === user.id
                    ? "bg-blue-100 text-blue-900 text-right"
                    : "bg-gray-200 text-gray-900 text-left"
                }`}
              >
                <p className="font-semibold">
                  {msg.sender_id === user.id ? "You" : msg.sender_id}
                </p>
                <p>{msg.message}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No messages with this user.</p>
          )}
        </div>

        {}
        <div className="flex space-x-3 items-center">
          <input
            type="text"
            placeholder="Enter your message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-grow p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={sendMessage}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
