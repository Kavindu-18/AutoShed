import express from "express";
import { addExaminer, getAvailableExaminers } from "../controllers/examinerController.js";

const router = express.Router();

router.post("/", addExaminer); // Add an examiner
router.get("/available", getAvailableExaminers); // Get available examiners

export default router;
