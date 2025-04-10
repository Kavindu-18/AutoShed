import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyparser from "body-parser"; 
import jwt from "jsonwebtoken";
import morgan from "morgan";
import connectDB from "./config/db.js"; // Database connection
import UserRouter from "./routes/userRoutes.js";
import examinerRoutes from "./routes/examinerRoutes.js";
import presentationRoutes from "./routes/presentationRoutes.js";
import noticeRoutes from "./routes/noticeRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(bodyparser.json());

app.use((req, res, next) => {
    let token = req.header("Authorization"); 

    if (token != null) {
        token = token.replace("Bearer ", ""); 

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
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
app.use("/api/users", UserRouter);
app.use("/api/examiners", examinerRoutes);
app.use("/api/presentations", presentationRoutes);
app.use("/api/notices", noticeRoutes);
// app.use("/api/presentations", presentationRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/bookings", bookingRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
