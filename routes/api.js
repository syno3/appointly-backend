import express from "express";
import {
  testUser,
  login,
  signUp
} from '../controllers/get.js';

const router = express.Router();

//test route
router.get("/", testUser);

router.post("/login", login);
router.post("/signup", signUp);


export default router;