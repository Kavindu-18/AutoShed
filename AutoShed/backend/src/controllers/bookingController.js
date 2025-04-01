import Booking from "../models/Booking.js";

export const addBooking = async (req, res) => {
  try {
    const { examinerId, date, time } = req.body;
    // Create new booking
    const newBooking = new Booking({ examinerId, date, time, isBooked: true });
    await newBooking.save();
    res.status(201).json({ message: "Booking added successfully", booking: newBooking });
  } catch (error) {
    console.error("Error adding booking:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateBooking = async (req, res) => {
  try {
    const { examinerId } = req.body;
    
    // Find the booking first
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    
    // Check if the examiner trying to update is the same one who created it
    if (booking.examinerId !== examinerId) {
      return res.status(403).json({ message: "You can only update your own bookings" });
    }
    
    // Proceed with update
    const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "Booking updated successfully", booking: updatedBooking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    // Get examinerId from request body or query params
    const { examinerId } = req.body;
    
    // Find the booking first
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    
    // Check if the examiner trying to delete is the same one who created it
    if (booking.examinerId !== examinerId) {
      return res.status(403).json({ message: "You can only delete your own bookings" });
    }
    
    // Proceed with deletion
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};