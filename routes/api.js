import express from "express";
import {
  testUser,
  login,
  signUp,
  getMeetings,
  getMeeting,
  createMeeting,
  deleteMeeting
} from '../controllers/get.js';

const router = express.Router();

//get routes
router.get("/", testUser);
router.get("/getMeetings", getMeetings);
router.get("/getMeeting", getMeeting);


//post routes
router.post("/login", login);
router.post("/signup", signUp);
router.post("/createMeeting", createMeeting);



//delete routes
router.delete("/deleteMeeting", deleteMeeting)


export default router;