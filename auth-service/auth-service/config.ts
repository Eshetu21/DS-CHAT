import dotenv from "dotenv";
dotenv.config();

export default {
  SUPABASE_URL: process.env.SUPABASE_URL!,
  SUPABASE_KEY: process.env.SUPABASE_KEY!,
};
