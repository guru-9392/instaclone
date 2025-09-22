import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import path from "path";

// Routes
import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import messageRoute from "./routes/message.route.js";

// Socket setup
import { Server } from "socket.io";
import http from "http";

dotenv.config();

// Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
  origin: process.env.URL,
  credentials: true,
};
app.use(cors(corsOptions));

// API routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/message", messageRoute);

// Serve frontend
const __dirname = path.resolve();
const frontendPath = path.join(__dirname, "frontend", "dist");
app.use(express.static(frontendPath));

// React catch-all route
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Create HTTP server & Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.URL,
    methods: ["GET", "POST"],
  },
});

// User socket map
const userSocketMap = {}; // userId -> socketId
export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // Emit online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    if (userId) delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Start server
server.listen(PORT, async () => {
  await connectDB();
  console.log(`Server listening at port ${PORT}`);
});
