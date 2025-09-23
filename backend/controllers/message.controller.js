import { Conversation } from "../models/conversation.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import { Message } from "../models/message.model.js";

// Send a new message
export const sendMessage = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const { textMessage } = req.body;

        // Find or create conversation
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
            });
        }

        // Create new message
        const newMessage = await Message.create({
            conversationId: conversation._id,
            sender: senderId,
            text: textMessage,
        });

        // Add message to conversation
        conversation.messages.push(newMessage._id);
        await conversation.save();

        // Emit socket event to receiver
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        return res.status(201).json({
            success: true,
            newMessage,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Get all messages of a conversation
export const getMessages = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;

        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        }).populate({
            path: "messages",
            populate: { path: "sender", select: "username profilePicture" },
        });

        if (!conversation)
            return res.status(200).json({ success: true, messages: [] });

        return res.status(200).json({ success: true, messages: conversation.messages });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};
