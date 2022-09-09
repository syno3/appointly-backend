import dotenv from "dotenv";
import axios from "axios";
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
