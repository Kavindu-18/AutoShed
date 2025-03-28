const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const io = require("../socket"); // Socket instance

// Get all bookings
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

// Create a booking
router.post("/", async (req, res) => {
  try {
    const { examinerId, date, time } = req.body;
    const newBooking = new Booking({ examinerId, date, time, isBooked: true });
    await newBooking.save();
    io.getIO().emit("scheduleUpdate", { message: "New booking added" }); // Emit event
    res.status(201).json(newBooking);
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

// Update a booking
router.put("/:id", async (req, res) => {
  try {
    const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    io.getIO().emit("scheduleUpdate", { message: "Booking updated" });
    res.json(updatedBooking);
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

// Delete a booking
router.delete("/:id", async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    io.getIO().emit("scheduleUpdate", { message: "Booking deleted" });
    res.json({ message: "Booking deleted" });
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

module.exports = router;
