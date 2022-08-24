import { supabase } from "../utils/supabaseClient.js";

export const test = async (req, res) => {
    res.send("Hello World!").status(200);
};
