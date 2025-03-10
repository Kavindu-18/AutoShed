import express from "express";
import { bookPresentation, reschedulePresentation } from "../controllers/presentationController.js";

const router = express.Router();

router.post("/", bookPresentation); // Book a slot
router.put("/:id/reschedule", reschedulePresentation); // Reschedule a slot

export default router;
