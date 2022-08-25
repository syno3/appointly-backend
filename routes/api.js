import express from "express";
import {
  testUser,
  login,
  signUp,
  getMeetings,
  getMeeting,
  getPersonal,
  createMeeting,
  deleteMeeting,
  getMeetingHomepage,
  insertPersonal,
  updateUser
} from '../controllers/get.js';

const router = express.Router();

//get routes
router.get("/", testUser);
router.get("/getMeetings", getMeetings);
router.get("/getMeeting", getMeeting);
router.get("/getPersonal", getPersonal);


//post routes
router.post("/login", login);
router.post("/signup", signUp);
router.post("/createMeeting", createMeeting);
router.post("/getMeetingHomepage", getMeetingHomepage);
router.post("/insertPersonal", insertPersonal);


//delete routes
router.delete("/deleteMeeting", deleteMeeting)


// put routes
router.put("/updateUser", updateUser)


export default router;