import { Server } from "socket.io";

let io;
export const onlineUsers = {};

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.URL, // your frontend URL
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"], // support WebSocket and fallback
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      onlineUsers[userId] = socket.id;
      console.log(`✅ User connected: ${userId}`);
    }

    socket.on("sendMessage", (message) => {
      const receiverSocketId = onlineUsers[message.receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", message);
      }
    });

    socket.on("disconnect", () => {
      if (userId) delete onlineUsers[userId];
      console.log(`❌ User disconnected: ${userId}`);
    });
  });

  return io;
};

export const getReceiverSocketId = (userId) => onlineUsers[userId];
export { io };
