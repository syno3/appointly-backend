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

const router = express.Router();

//get routes
router.get("/", testUser);
router.get("/getMeetings", getMeetings);
router.get("/getMeeting", getMeeting);
router.get("/getPersonal", getPersonal);
router.get("/getSchedules", getSchedules);
router.get("/getAppointments", getAppointments);
router.get("/getClients", getClients);
router.get("/getAmount", getAmount);
router.get("/getBasic", getBasic);
router.get("/rtc", nocache, generateRTCToken);

//post routes
router.post("/login", login);
router.post("/signup", signUp);
router.post("/createMeeting", createMeeting);
router.post("/getMeetingHomepage", getMeetingHomepage);
router.post("/insertPersonal", insertPersonal);
router.post("/postClient", postClient);
router.post("/postAppointment", postAppointment);
router.post("/updateSchedule", updateSchedule);
router.post("/postSchedule", postSchedule);
router.post("/postMember", postMember);
router.post("/updateMember", updateMember);
router.post("/uploadImage", uploadImage);
router.post("/updateProfile", updateProfile);
router.post("/lipaNaMpesaOnline", MpesaToken, lipaNaMpesaOnline);
router.post("/lipaNaMpesaOnline", lipaNaMpesaOnline);



//delete routes
router.delete("/deleteMeeting", deleteMeeting);

// put routes
router.put("/updateUser", updateUser);

export default router;
