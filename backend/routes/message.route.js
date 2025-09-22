import express from "express";
import { sendMessage, getMessages } from "../controllers/message.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

// Send a message
router.post("/send/:id", isAuthenticated, sendMessage);

// Get messages with a specific user
router.get("/:id", isAuthenticated, getMessages);

export default router;
