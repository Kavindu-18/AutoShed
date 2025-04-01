import Booking from "../models/Booking.js";

export const addBooking = async (req, res) => {
  try {
    const { examinerId, date, time } = req.body;
    
    // Create new booking
    const newBooking = new Booking({ examinerId, date, time, isBooked: true });
    await newBooking.save();

    res.status(201).json({ message: "Booking added successfully", booking: newBooking });
  } catch (error) {
    console.error("Error adding booking:", error); // ✅ This will print the actual error in the backend logs
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
    const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });

    res.json({ message: "Booking updated successfully", booking: updatedBooking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    await Booking.findByIdAndDelete(req.params.id);

    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
