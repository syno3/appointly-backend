import dotenv from "dotenv";
import axios from "axios";
import jwt from "jsonwebtoken";
import { supabase } from "../utils/supabaseClient.js";

dotenv.config();

export const MpesaToken = async (req, res, next) => {
  const consumer_key = process.env.MPESA_CLIENT_KEY;
  const consumer_secret = process.env.MPESA_CLIENT_SECRET;

  const url =
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

  const buffer = new Buffer.from(`${consumer_key}:${consumer_secret}`);
  const encoded = buffer.toString("base64");
  const auth = `Basic ${encoded}`;

  console.log(auth);

  try {
    const { data } = await axios.get(url, {
      insecureHTTPParser: true,
      headers: {
        Authorization: auth,
      },
    });

    console.log(data);
    req.mpesaToken = data.access_token;
    return next();
  } catch (err) {
    return res.json({
      status: "error",
      message: "Error getting Mpesa Token",
      error: err,
    });
  }
};

// autheticate supabase acesstoken
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser(token);
    req.user = user;
    next();
  } catch (err) {
    return res.sendStatus(403);
  }
};
