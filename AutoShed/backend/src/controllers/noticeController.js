import Notice from "../models/notice.js";
import { io } from "../server.js";
import { v4 as uuidv4 } from 'uuid'; // Add this dependency to your project

// Create a new notice
export const createNotice = async (req, res) => {
  try {
    console.log("Creating notice with data:", req.body);
    
    // Generate a unique ID for noticeId using UUID v4
    const uniqueNoticeId = uuidv4();
    
    // Construct notice object with all required fields
    const noticeData = {
      id: req.body.id || Date.now().toString(), // Keep original id for frontend
      noticeId: uniqueNoticeId, // Use the generated UUID for noticeId
      
      // Basic notice information
      title: req.body.title,
      type: req.body.type,
      priority: req.body.priority || "Medium",
      effectiveDate: req.body.effectiveDate,
      expirationDate: req.body.expirationDate,
      
      // Content
      body: req.body.body,
      attachments: req.body.attachments || [],
      tags: req.body.tags || [],
      links: req.body.links || [],
      
      // Frontend visibility settings
      publishToStudents: req.body.publishToStudents || false,
      publishToExaminers: req.body.publishToExaminers || false,
      highlightNotice: req.body.highlightNotice || false,
      
      // Author and metadata
      author: req.body.author,
      
      // Optional fields with defaults
      recipients: req.body.recipients || [],
      distributionChannels: req.body.distributionChannels || [],
      deliveryDate: req.body.deliveryDate || new Date(),
      acknowledgmentRequired: req.body.acknowledgmentRequired || false,
      regulatoryReferences: req.body.regulatoryReferences || [],
      visibility: req.body.visibility || "Internal",
      confidentialityLevel: req.body.confidentialityLevel || "Public",
      retentionPeriod: req.body.retentionPeriod
    };
    
    console.log("Prepared notice data with unique ID:", noticeData);
    const newNotice = new Notice(noticeData);
    await newNotice.save();
    
    // Emit real-time update
    io.emit("newNotice", newNotice);
    
    res.status(201).json({ message: "Notice created successfully", notice: newNotice });
  } catch (error) {
    console.error("Error creating notice:", error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = {};
      
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      
      return res.status(400).json({
        error: "Validation failed",
        details: validationErrors
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        error: "Duplicate key error",
        details: `A notice with this ${Object.keys(error.keyValue)[0]} already exists`
      });
    }
    
    res.status(500).json({ error: error.message });
  }
};

// Get all notices
export const getAllNotices = async (req, res) => {
  try {
    const notices = await Notice.find();
    res.status(200).json(notices);
  } catch (error) {
    console.error("Error fetching notices:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get a single notice by ID
export const getNoticeById = async (req, res) => {
  const { id } = req.params;

  try {
    // Try to find by id or noticeId
    const notice = await Notice.findOne({ $or: [{ id: id }, { noticeId: id }] });
    
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }
    
    res.status(200).json(notice);
  } catch (error) {
    console.error("Error fetching notice:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update a notice
export const updateNotice = async (req, res) => {
  const { id } = req.params;

  try {
    // Try to find by id or noticeId
    const notice = await Notice.findOne({ $or: [{ id: id }, { noticeId: id }] });
    
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }
    
    // Update fields from request body, but don't change the noticeId
    Object.keys(req.body).forEach(key => {
      if (key !== 'noticeId') { // Prevent noticeId from being changed
        notice[key] = req.body[key];
      }
    });
    
    notice.lastUpdated = new Date();
    await notice.save();
    
    // Emit real-time update
    io.emit("updatedNotice", notice);
    
    res.status(200).json({ message: "Notice updated successfully", notice });
  } catch (error) {
    console.error("Error updating notice:", error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = {};
      
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      
      return res.status(400).json({
        error: "Validation failed",
        details: validationErrors
      });
    }
    
    res.status(500).json({ error: error.message });
  }
};

// Delete a notice
export const deleteNotice = async (req, res) => {
  const { id } = req.params;

  try {
    // Try to find by id or noticeId
    const notice = await Notice.findOneAndDelete({ $or: [{ id: id }, { noticeId: id }] });
    
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }
    
    // Emit real-time update
    io.emit("deletedNotice", { id });
    
    res.status(200).json({ message: "Notice deleted successfully" });
  } catch (error) {
    console.error("Error deleting notice:", error);
    res.status(500).json({ error: error.message });
  }
};

// Acknowledge a notice
export const acknowledgeNotice = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    // Try to find by id or noticeId
    const notice = await Notice.findOne({ $or: [{ id: id }, { noticeId: id }] });
    
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
    io.emit("acknowledgedNotice", notice);
    
    res.status(200).json({ message: "Notice acknowledged successfully" });
  } catch (error) {
    console.error("Error acknowledging notice:", error);
    res.status(500).json({ error: error.message });
  }
};
