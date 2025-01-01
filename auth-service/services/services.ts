import { createClient } from "@supabase/supabase-js";
import config from "./config";

const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_KEY);

export const sendMagicLink = async (email: string) => {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `http://localhost:3000/verify-token?email=${encodeURIComponent(
          email
        )}`,
     
      },
    });

    if (error) return { error: error.message };
    return { success: true };
  } catch (err) {
    return { error: (err as Error).message };
  }
};

export const verifyMagicLinkToken = async (email: string, token: string) => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      type: "magiclink",
      email,
      token,
    });

    if (error) {
      console.error("Supabase verification error:", error);

      if (error.code === "otp_expired") {
        return {
          error: "The magic link has expired. Please request a new one.",
        };
      }

      return { error: error.message };
    }

    return data?.user;
  } catch (err) {
    console.error("Unexpected error verifying magic link token:", err);
    return { error: "An unexpected error occurred." };
  }
};

