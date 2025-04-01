import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js"; // Database connection
import userRoutes from "./routes/userRoutes.js";
import examinerRoutes from "./routes/examinerRoutes.js";
import presentationRoutes from "./routes/presentationRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// Database Connection
connectDB();

// Routes
app.use("/api/users", userRoutes);
app.use("/api/examiners", examinerRoutes);
app.use("/api/presentations", presentationRoutes);
app.use("/api/bookings", bookingRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
