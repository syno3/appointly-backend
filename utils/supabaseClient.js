import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseurl = process.env.EXPRESS_BACKEND_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPRESS_BACKEND_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseurl, supabaseAnonKey);
