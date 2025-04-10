import mongoose from "mongoose";

const presentationSchema = mongoose.Schema({
  examinerId: { type: mongoose.Schema.Types.ObjectId, ref: "Examiner", required: true },
  date: { type: String, required: true }, // e.g., "2025-03-15"
  time: { type: String, required: true }, // e.g., "11:00 AM"
  status: { type: String, enum: ["scheduled", "completed"], default: "scheduled" },
});

export default mongoose.model("Presentation", presentationSchema);
