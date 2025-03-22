const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  examinerId: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  isBooked: { type: Boolean, default: false },
});

module.exports = mongoose.model("Booking", BookingSchema);
