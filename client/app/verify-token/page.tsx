"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import refreshSession from "../components/RefreshSession";

const VerifyMagicLink = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const handleRequestNewLink = async () => {
    setMessage("Sending a new magic link...");
    setLoading(true);

    const email = new URLSearchParams(window.location.search).get("email");
    if (email) {
      await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setLoading(false);
      setMessage("New magic link sent! Please check your inbox.");
    }
  };

  useEffect(() => {
    const verifyToken = async () => {
      const urlFragment = window.location.hash.substring(1);
      const params = new URLSearchParams(window.location.search);
      const email = params.get("email");
      const token = urlFragment;

      if (!email || !token) {
        setMessage("Invalid or missing email and token.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/auth/verify-magic?email=${encodeURIComponent(
            email
          )}&token=${encodeURIComponent(token)}`
        );

        const data = await response.json();
        if (data.error) {
          setMessage(data.error);
        } else {
          setMessage("Login successful! Redirecting...");
          await refreshSession();
          setTimeout(() => router.push("http://localhost:3000/chat"), 2000);
        }
      } catch (error) {
        console.error("Error verifying token:", error);
        setMessage("Failed to verify the token.");
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [router]);

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <p>{message}</p>
          {message.includes("expired") && (
            <button onClick={handleRequestNewLink}>
              Request a new magic link
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default VerifyMagicLink;

