import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 100
  },
  body: {
    type: String,
    required: true,
    trim: true,
    minlength: 10
  },
  type: {
    type: String,
    enum: ["Academic", "Administrative", "Event"],
    required: true
  },
  priority: {
    type: String,
    enum: ["High", "Medium", "Low"],
    required: true,
    default: "Medium"
  },
  status: {
    type: String,
    enum: ["Draft", "Published", "Archived"],
    default: "Draft"
  },
  targetAudience: [{
    type: String,
    enum: ["students", "examiners", "common"]
  }],
  author: {
    type: String,
    default: "Admin"
  },
  effectiveDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  expirationDate: {
    type: Date,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  attachments: [{
    filename: String,
    url: String,
    type: String,
    size: Number
  }],
  highlightNotice: {
    type: Boolean,
    default: false
  },
  notifyViaEmail: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, {
  timestamps: true
});

// Indexes for better query performance
notificationSchema.index({ effectiveDate: 1, expirationDate: 1 });
notificationSchema.index({ targetAudience: 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ type: 1, priority: 1 });

// Validation middleware
notificationSchema.pre('save', function(next) {
  // Ensure expiration date is after effective date
  if (this.expirationDate <= this.effectiveDate) {
    next(new Error('Expiration date must be after effective date'));
  }
  
  // Ensure at least one target audience is selected
  if (!this.targetAudience || this.targetAudience.length === 0) {
    next(new Error('At least one target audience must be selected'));
  }
  
  next();
});

// Static methods for filtering
notificationSchema.statics.findActiveNotifications = function(audience = null) {
  const now = new Date();
  const query = {
    status: "Published",
    effectiveDate: { $lte: now },
    expirationDate: { $gt: now }
  };
  
  if (audience) {
    query.targetAudience = audience;
  }
  
  return this.find(query).sort({ priority: -1, effectiveDate: -1 });
};

notificationSchema.statics.findByAudience = function(audience) {
  return this.find({ 
    targetAudience: audience,
    status: "Published"
  }).sort({ effectiveDate: -1 });
};

// Instance methods
notificationSchema.methods.isActive = function() {
  const now = new Date();
  return this.status === "Published" && 
         this.effectiveDate <= now && 
         this.expirationDate > now;
};

notificationSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

export default mongoose.model("Notification", notificationSchema);