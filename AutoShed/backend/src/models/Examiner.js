import mongoose from "mongoose";

const examinerSchema = mongoose.Schema({
  name: { type: String, required: true },
  availability: [
    {
      day: { type: String, required: true }, // e.g., "Monday"
      startTime: { type: String, required: true }, // e.g., "10:00 AM"
      endTime: { type: String, required: true }, // e.g., "3:00 PM"
    },
  ],
  maxDailySlots: { type: Number, default: 5 }, // To balance workload
});

export default mongoose.model("Examiner", examinerSchema);
