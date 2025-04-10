import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js"; // Database connection
import { Server as SocketServer } from "socket.io"; // Rename the socket.io Server to SocketServer
import { createServer } from "http";
import http from "http";
import userRoutes from "./routes/userRoutes.js";
import examinerRoutes from "./routes/examinerRoutes.js";
<<<<<<< HEAD
import presentationRoutes from "./routes/presentationRoutes.js";
import noticeRoutes from "./routes/noticeRoutes.js";
=======
import studentRoutes from "./routes/studentRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
>>>>>>> parent of 0b1f3947 (Merge pull request #9 from Kavindu-18/Kavinga_NoticeManagement)

dotenv.config();
const app = express();

// HTTP server for Socket.io
const httpServer = http.createServer(app);

const io = new SocketServer(httpServer, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
});

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// Database Connection
connectDB();

// Routes
app.use("/api/users", userRoutes);
app.use("/api/examiners", examinerRoutes);
<<<<<<< HEAD
app.use("/api/presentations", presentationRoutes);
app.use("/api/notices", noticeRoutes);
=======
// app.use("/api/presentations", presentationRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/bookings", bookingRoutes);
>>>>>>> parent of 0b1f3947 (Merge pull request #9 from Kavindu-18/Kavinga_NoticeManagement)

const PORT = process.env.PORT || 5001;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Initialize Socket.io for real-time updates
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

export { io };
