import express from "express";
import {
  createNotice,
  getAllNotices,
  getNoticeById,
  updateNotice,
  deleteNotice,
  acknowledgeNotice,
} from "../controllers/noticeController.js";

const router = express.Router();

// Create a new notice
router.post("/", createNotice);

// Get all notices
router.get("/", getAllNotices);

// Get a single notice by ID
router.get("/:id", getNoticeById);

// Update a notice
router.put("/:id", updateNotice);

// Delete a notice
router.delete("/:id", deleteNotice);

// Acknowledge a notice
router.post("/:id/acknowledge", acknowledgeNotice);

// Export the router as a default export
export default router;