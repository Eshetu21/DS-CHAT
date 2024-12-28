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


  if (!user) {
    return <div>Loading...</div>;
  }

  const filteredMessages = messages.filter(
    (msg) =>
      (msg.sender_id === user.id && msg.receiver_id === receiverId) ||
      (msg.sender_id === receiverId && msg.receiver_id === user.id)
  );

  return (
    <div>
      <h1>Welcome, {user.email}</h1>
      <div>
        <h2>Online Users</h2>
        {onlineUsers.length > 0 ? (
          <ul>
            {onlineUsers.map((user) => (
              <li
                key={user.id}
                style={{ cursor: "pointer", marginBottom: "0.5rem" }}
                onClick={() => setReceiverId(user.id)}
              >
                {user.email}
              </li>
            ))}
          </ul>
        ) : (
          <p>No users are online.</p>
        )}
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Receiver ID"
          value={receiverId}
          onChange={(e) => setReceiverId(e.target.value)}
          style={{ marginRight: "0.5rem" }}
        />
        <input
          type="text"
          placeholder="Enter your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ marginRight: "0.5rem" }}
        />
        <button onClick={sendMessage}>Send</button>
      </div>

      <div>
        <h2>Messages:</h2>
        {filteredMessages.length > 0 ? (
          filteredMessages.map((msg, idx) => (
            <div key={idx}>
              <p>
                <strong>
                  {msg.sender_id === user.id ? "You" : msg.sender_id}
                </strong>
                : {msg.message}
              </p>
            </div>
          ))
        ) : (
          <p>No messages with this user.</p>
        )}
      </div>
    </div>
  );
};

export default Chat;
