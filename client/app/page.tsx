"use client";
import { useState } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setMessage(data.message || data.error);
    } catch (error) {
      console.error("Error sending magic link:", error);
      setMessage("Failed to send magic link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <form onSubmit={handleLogin} className="max-w-md w-full space-y-4">
        <label className="text-2xl font-bold">Login with Magic Link</label>
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full border rounded-lg px-4 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-lg"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Magic Link"}
        </button>
        {message && <p className="text-center mt-2">{message}</p>}
      </form>
    </div>
  );
};

export default Login;
