import { useEffect } from "react";
import { supabase } from "../utils/supabaseClient";

const updatePresence = async (status: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase.from("presence").upsert({
      id: user.id,
      email: user.email,
      status,
      last_active: new Date().toISOString(),
    });
  }
};

const startPresenceMonitoring = () => {
  const interval = setInterval(() => updatePresence("online"), 5000);
  return () => clearInterval(interval);
};

useEffect(() => {
  let stopMonitoring: (() => void) | null = null;

  const handleAuthStateChange = async (event: string) => {
    if (event === "SIGNED_IN") {
      await updatePresence("online");
      stopMonitoring = startPresenceMonitoring();
    } else if (event === "SIGNED_OUT") {
      await updatePresence("offline");
      if (stopMonitoring) {
        stopMonitoring();
      }
    }
  };

  const subscription = supabase.auth.onAuthStateChange((event:any) => {
    handleAuthStateChange(event);
  });

  return () => {
    if (stopMonitoring) {
      stopMonitoring();
    }
  };
}, []);

