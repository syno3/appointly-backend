const dotenv = require("dotenv");
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");

dotenv.config();

const appID = process.env.AGORA_APP_ID;
const appCertificate = process.env.AGORA_APP_CERTIFICATE;

// force browser to never cache the response
const nocache = (_, res, next) => {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.header("Expires", "-1");
  res.header("Pragma", "no-cache");
  next();
};

const generateRTCToken = (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  let channelName = req.query.channelName;
  if (!channelName) {
    return res
      .json({
        code: "500",
        message: "channelName is required",
      })
      .status(500);
  }

  let uuid = req.query.uuid;

  let role = RtcRole.SUBSCRIBER;
  if (req.query.role == "publisher") {
    role = RtcRole.PUBLISHER;
  }

  const expirationTimeInSeconds = 36000; // expire after 10 hours

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const token = RtcTokenBuilder.buildTokenWithUid(
    appID,
    appCertificate,
    channelName,
    uuid,
    role,
    currentTimestamp,
    expirationTimeInSeconds
  );
  return res
    .json({
      code: "200",
      message: "success",
      token: token,
    })
    .status(200);
};

module.exports = {
  generateRTCToken,
  nocache,
};
