import express from "express";
import { 
  getNotifications, 
  addNotification, 
  updateNotification, 
  deleteNotification,
  getNotificationById,
  getNotificationsByAudience,
  getActiveCommonNotifications,
  bulkDeleteNotifications,
  getNotificationStats
} from "../controllers/NotifyController.js";

const router = express.Router();

// Create a new notification
router.post("/", addNotification);

// Get all notifications
router.get("/", getNotifications);

// Get notification statistics
router.get("/stats/overview", getNotificationStats);

// Get active notifications for common/homepage
router.get("/active/common", getActiveCommonNotifications);

// Get notifications by audience
router.get("/audience/:audience", getNotificationsByAudience);

// Get single notification by ID
router.get("/:id", getNotificationById);

// Update a notification
router.put("/:id", updateNotification);

// Delete a notification
router.delete("/:id", deleteNotification);

// Bulk delete notifications
router.post("/bulk-delete", bulkDeleteNotifications);

export default router;