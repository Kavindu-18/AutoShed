import mongoose from "mongoose";


const bookingSchema = new mongoose.Schema({
  examinerId: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  isBooked: { type: Boolean, default: false },
});

// export default mongoose.exports = mongoose.model("Booking", bookingSchema);
export default mongoose.model("Booking", bookingSchema);
