import mongoose from "mongoose";

const noticeSchema = mongoose.Schema({
  // Primary identifier - match frontend's expected field
  noticeId: { type: String, required: true, unique: true }, 
  // Primary identifier - match frontend's expected field
  noticeId: { type: String, required: true, unique: true }, 

  id: { type: String, required: true, unique: true },
  
  // Notice Information
  title: { type: String, required: true }, 
  type: { type: String, required: true, enum: [
    "Academic", "Schedule", "Deadline", "Venue", "Technical", 
    "Faculty", "Administrative", "Resource", "Workshop", 
    "Requirements", "Evaluation", "Equipment", "Remote", 
    "Accommodation", "Grading", "Extension", "FAQ", 
    "Emergency", "General"
  ]},
  priority: { type: String, required: true, enum: ["High", "Medium", "Low"], default: "Medium" }, 
  effectiveDate: { type: Date, required: true }, 
  expirationDate: { type: Date }, 

  // Content
  body: { type: String, required: true }, 
  attachments: [{ type: String }],
  tags: [{ type: String }],
  
  // Publishing Options
  publishToStudents: { type: Boolean, default: false },
  publishToExaminers: { type: Boolean, default: false },
  publishToFrontend: { type: Boolean, default: false }, // Legacy field
  highlightNotice: { type: Boolean, default: false },
  
  // Extended fields can remain but should be optional
  links: [{ type: String }], 
  recipients: [{ type: String }], // Made optional
  distributionChannels: [{ type: String, enum: ["Email", "Intranet", "SMS", "Bulletin"] }], // Made optional
  deliveryDate: { type: Date },
  acknowledgmentRequired: { type: Boolean, default: false }, 

  // Metadata (keep)
  author: { type: String, required: true }, 
  createdAt: { type: Date, default: Date.now }, 
  lastUpdated: { type: Date, default: Date.now }, 
  version: { type: Number, default: 1 },
  
  // Keep other fields but make them optional
  // (Compliance, Tracking, Access Control, Archival sections)
  // ...
});

// Middleware to update the 'lastUpdated' field before saving
noticeSchema.pre("save", function (next) {
  this.lastUpdated = Date.now();
  next();
});

export default mongoose.model("Notice", noticeSchema);
