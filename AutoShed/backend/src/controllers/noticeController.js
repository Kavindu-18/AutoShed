import Notice from "../models/Notice.js";
import { io } from "../server.js"; // Import io for real-time updates

// Create a new notice
export const createNotice = async (req, res) => {
  const {
    noticeId,
    title,
    type,
    priority,
    effectiveDate,
    expirationDate,
    body,
    attachments,
    links,
    recipients,
    distributionChannels,
    deliveryDate,
    acknowledgmentRequired,
    regulatoryReferences,
    author,
    visibility,
    confidentialityLevel,
    retentionPeriod,
  } = req.body;

  try {
    console.log("Creating notice with data:", req.body); // Log the incoming request body
    const newNotice = new Notice({
      noticeId,
      title,
      type,
      priority,
      effectiveDate,
      expirationDate,
      body,
      attachments,
      links,
      recipients,
      distributionChannels,
      deliveryDate,
      acknowledgmentRequired,
      regulatoryReferences,
      author,
      visibility,
      confidentialityLevel,
      retentionPeriod,
    });

    await newNotice.save();

    // Emit real-time update
    io.emit("newNotice", newNotice); // Notify all clients about the new notice

    res.status(201).json({ message: "Notice created successfully", notice: newNotice });
  } catch (error) {
    console.error("Error creating notice:", error.message); // Log the error for debugging
    res.status(500).json({ error: "An error occurred while creating the notice." });
  }
};

// Get all notices
export const getAllNotices = async (req, res) => {
  try {
    const notices = await Notice.find();
    res.status(200).json(notices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single notice by ID
export const getNoticeById = async (req, res) => {
  const { id } = req.params;

  try {
    const notice = await Notice.findById(id);
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }
    res.status(200).json(notice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a notice
export const updateNotice = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const notice = await Notice.findByIdAndUpdate(id, updates, { new: true });
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    // Emit real-time update
    io.emit("updatedNotice", notice); // Notify all clients about the updated notice

    res.status(200).json({ message: "Notice updated successfully", notice });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a notice
export const deleteNotice = async (req, res) => {
  const { id } = req.params;

  try {
    const notice = await Notice.findByIdAndDelete(id);
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    // Emit real-time update
    io.emit("deletedNotice", { id }); // Notify all clients about the deleted notice

    res.status(200).json({ message: "Notice deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Acknowledge a notice
export const acknowledgeNotice = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    const notice = await Notice.findById(id);
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    // Check if the user has already acknowledged the notice
    const alreadyAcknowledged = notice.acknowledgmentStatus.some(
      (ack) => ack.userId === userId
    );

    if (alreadyAcknowledged) {
      return res.status(400).json({ message: "Notice already acknowledged" });
    }

    // Add the acknowledgment
    notice.acknowledgmentStatus.push({ userId, acknowledgedAt: Date.now() });
    await notice.save();

    // Emit real-time update
    io.emit("acknowledgedNotice", notice); // Notify all clients about the acknowledgment

    res.status(200).json({ message: "Notice acknowledged successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
