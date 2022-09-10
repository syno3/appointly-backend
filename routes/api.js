import express from "express";
import {
  testUser,
  login,
  signUp,
  updateMember,
  postClient,
  postSchedule,
  uploadImage,
  updateProfile,
  postMember,
  postAppointment,
  lipaNaMpesaOnline,
  lipaNaMpesaCallback,
  lipaNaMpesaB2C,
  getMeetings,
  getMeeting,
  getPersonal,
  getSchedules,
  getAppointments,
  getClients,
  getAmount,
  getBasic,
  createMeeting,
  deleteMeeting,
  getMeetingHomepage,
  insertPersonal,
  updateUser,
  updateSchedule,
} from "../controllers/get.js"; // get routes for the controllers

import { nocache, generateRTCToken } from "../controllers/agora.cjs"; // agora tokenn server

import { MpesaToken } from "../middleware/middleware.js"; // token generator for mepsa
import {
  sendEmail,
  thanksForSignup,
  appointmentConfirmation,
  clientBookedAppointment,
  meetingConfirmation,
  inviteSignedUpForMeeting,
} from "../controllers/emails.js"; // email templates

const router = express.Router();

//get routes
router.get("/", testUser, meetingConfirmation, inviteSignedUpForMeeting); // test route

router.get("/getMeetings", getMeetings);
router.get("/getMeeting", getMeeting);
router.get("/getPersonal", getPersonal);
router.get("/getSchedules", getSchedules);
router.get("/getAppointments", getAppointments);
router.get("/getClients", getClients);
router.get("/getAmount", getAmount);
router.get("/getBasic", getBasic);
router.get("/rtc", nocache, generateRTCToken); // ? agora rtc token

//post routes
router.post("/login", login);
router.post("/signup", signUp);
router.post("/createMeeting", createMeeting);
router.post("/getMeetingHomepage", getMeetingHomepage);
router.post(
  "/insertPersonal",
  insertPersonal,
  meetingConfirmation,
  inviteSignedUpForMeeting
);
router.post("/postClient", postClient);
router.post(
  "/postAppointment",
  postAppointment,
  appointmentConfirmation,
  clientBookedAppointment
);
router.post("/updateSchedule", updateSchedule);
router.post("/postSchedule", postSchedule);
router.post("/postMember", postMember);
router.post("/updateMember", updateMember, thanksForSignup);
router.post("/uploadImage", uploadImage);
router.post("/updateProfile", updateProfile);
router.post("/lipaNaMpesaOnline", MpesaToken, lipaNaMpesaOnline);
router.post("/lipaNaMpesaCallback", lipaNaMpesaCallback);
router.post("/lipaNaMpesaB2C", MpesaToken, lipaNaMpesaB2C);

//delete routes
router.delete("/deleteMeeting", deleteMeeting);

// put routes
router.put("/updateUser", updateUser);

export default router;
