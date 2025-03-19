import mongoose from "mongoose";

const noticeSchema = mongoose.Schema({
  // Notice Information
  noticeId: { type: String, required: true, unique: true }, 
  title: { type: String, required: true }, 
  priority: { type: String, required: true, enum: ["High", "Medium", "Low"], default: "Medium" }, 
  effectiveDate: { type: Date, required: true }, 
  expirationDate: { type: Date }, 

  // Content
  body: { type: String, required: true }, 
  attachments: [{ type: String }], 
  links: [{ type: String }], 

  // Distribution
  recipients: [{ type: String, required: true }], 
  distributionChannels: [{ type: String, required: true, enum: ["Email", "Intranet", "SMS", "Bulletin"] }], 
  deliveryDate: { type: Date, required: true }, 
  acknowledgmentRequired: { type: Boolean, default: false }, 

  // Compliance and Legal
  regulatoryReferences: [{ type: String }], 
  approvalStatus: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" }, 
  auditTrail: [
    {
      action: { type: String, required: true },
      performedBy: { type: String, required: true }, 
      timestamp: { type: Date, default: Date.now }, 
    },
  ],

  // Tracking and Reporting
  readStatus: [{ userId: { type: String }, readAt: { type: Date } }],
  acknowledgmentStatus: [{ userId: { type: String }, acknowledgedAt: { type: Date } }], 
  responseDeadline: { type: Date }, 
  feedback: [
    {
      userId: { type: String }, 
      comment: { type: String }, 
      timestamp: { type: Date, default: Date.now }, 
    },
  ],

  // Metadata
  author: { type: String, required: true }, 
  createdAt: { type: Date, default: Date.now }, 
  lastUpdated: { type: Date, default: Date.now }, 
  version: { type: Number, default: 1 },

  // Access Control
  visibility: { type: String, enum: ["Public", "Internal", "Restricted"], default: "Internal" }, 
  confidentialityLevel: { type: String, enum: ["Confidential", "Public"], default: "Public" }, 

  // Archival
  archiveDate: { type: Date }, 
  retentionPeriod: { type: Number }, 
  archivalLocation: { type: String }, 
});

// Middleware to update the 'lastUpdated' field before saving
noticeSchema.pre("save", function (next) {
  this.lastUpdated = Date.now();
  next();
});

export default mongoose.model("Notice", noticeSchema);