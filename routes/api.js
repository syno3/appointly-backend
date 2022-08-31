import express from "express";
import {
  testUser,
  login,
  signUp,
  postClient,
  postSchedule,
  postMember,
  postAppointment,
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
} from "../controllers/get.js";

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

//delete routes
router.delete("/deleteMeeting", deleteMeeting);

// put routes
router.put("/updateUser", updateUser);

export default router;
