import express from "express";
import { getBookings, updateBooking, deleteBooking ,addBooking} from "../controllers/bookingController.js";

const router = express.Router();

router.post("/", addBooking);

// Get all bookings
router.get("/", getBookings);

// Update a booking
router.put("/:id", updateBooking);

// Delete a booking
router.delete("/:id", deleteBooking);


export default router;

export default router;

