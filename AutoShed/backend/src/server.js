import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyparser from "body-parser"; 
import jwt from "jsonwebtoken";
import morgan from "morgan";
import connectDB from "./config/db.js"; // Database connection
import { Server as SocketServer } from "socket.io"; // Rename the socket.io Server to SocketServer
import { createServer } from "http";
import http from "http";
import UserRouter from "./routes/userRoutes.js"
import examinerRoutes from "./routes/examinerRoutes.js";
import presentationRoutes from "./routes/presentationRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";

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

app.use(bodyparser.json());

app.use((req, res, next) => {
    let token = req.header
    ("Authorization"); 

    if (token != null) {
        token = token.replace("Bearer ", ""); 

        jwt.verify(token, process.env.JWT_SECRET,
        (err, decoded) => {
            if (!err) {
                req.user = decoded; 
            }
        });
    }

    next(); 
});

// Database Connection
connectDB();

// Routes
app.use("/api/users",UserRouter)
app.use("/api/examiners", examinerRoutes);
app.use("/api/presentations", presentationRoutes);
app.use("/api/students", studentRoutes);

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




//mongodb+srv://itpmuser:a0JqZk4dhNRf5iWs@itpm.j7hf8.mongodb.net/?retryWrites=true&w=majority&appName=ITPM
