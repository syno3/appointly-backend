import express from "express";
import {
  testUser,
  postClient,
  postSchedule,
  uploadImage,
  updateProfile,
  postAppointment,
  updateMeeting,
  lipaNaMpesaOnline,
  lipaNaMpesaCallback,
  getMeetings,
  getMeeting,
  getPersonal,
  getSchedules,
  getAppointments,
  getClients,
  getAmount,
  getBasic,
  getReviewForMeeting,
  getUserMeeting,
  createMeeting,
  createToken,
  createSlackMessage,
  createReviewForMeeting,
  deleteMeeting,
  getMeetingHomepage,
  insertPersonal,
  updateSchedule,
  updateUser,
} from "../controllers/get.js"; // get routes for the controllers

import { nocache, generateRTCToken } from "../controllers/agora.cjs"; // agora tokenn server

import { MpesaToken, authenticateToken } from "../middleware/middleware.js"; // token generator for mepsa
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
router.get("/getMeetings", authenticateToken, getMeetings);
router.get("/getMeeting", getMeeting);
router.get("/getPersonal", authenticateToken, getPersonal);
router.get("/getSchedules", getSchedules);
router.get("/getAppointments", getAppointments);
router.get("/getClients", getClients);
router.get("/getAmount", authenticateToken, getAmount);
router.get("/getBasic", authenticateToken, getBasic);
router.get("/getUserMeeting", getUserMeeting);

router.get("/rtc", nocache, generateRTCToken); // ? agora rtc token
router.get("/createToken", createToken);

//post routes
router.post("/createMeeting", authenticateToken, createMeeting);
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
router.post("/postSchedule", authenticateToken, postSchedule);
router.post("/updateMeeting", authenticateToken, updateMeeting);
router.post("/getReviewForMeeting", getReviewForMeeting);
router.post("/createReviewForMeeting", createReviewForMeeting);

// TODO : UPDATE THE ROUTE TO SEND EMAIL
router.post("/thanksForSignup", thanksForSignup);
router.post("/uploadImage", uploadImage);
router.post("/updateProfile", authenticateToken, updateProfile);
router.post("/lipaNaMpesaOnline", MpesaToken, lipaNaMpesaOnline);
router.post("/lipaNaMpesaCallback", lipaNaMpesaCallback);
router.post("/createSlackMessage", authenticateToken, createSlackMessage);

//delete routes
router.delete("/deleteMeeting", deleteMeeting);

// put routes
router.put("/updateUser", authenticateToken, updateUser);

export default router;
