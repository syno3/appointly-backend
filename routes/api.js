import express from "express";
import {
  test
} from '../controllers/get.js';

const router = express.Router();

//test route
router.get("/", test);

export default router;