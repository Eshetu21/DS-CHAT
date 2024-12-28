import { supabase } from "../utils/supabaseClient";
const refreshSession = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      console.error("Error refreshing session:", error);
      return;
    }

    console.log("Session refreshed:", data);
  } catch (err) {
    console.error("Unexpected error while refreshing session:", err);
  }
};

refreshSession();

export default refreshSession;

