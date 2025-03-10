import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js"; // Database connection
import { Server } from "socket.io";
import { createServer } from "http";
import userRoutes from "./routes/userRoutes.js";
import examinerRoutes from "./routes/examinerRoutes.js";
import presentationRoutes from "./routes/presentationRoutes.js";

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

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// HTTP server for Socket.io
const httpServer = createServer(app);

app.use("/api/examiners", examinerRoutes);
app.use("/api/presentations", presentationRoutes);

// Initialize Socket.io for real-time updates
const io = new Server(httpServer, {
    cors: { origin: "*" },
  });
  
  io.on("connection", (socket) => {
    console.log("New client connected");
  
    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
    });

    export { io };