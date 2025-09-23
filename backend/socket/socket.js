import { Server } from "socket.io";

let io;
export const onlineUsers = {}; // userId -> [socketId1, socketId2]

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      if (!onlineUsers[userId]) onlineUsers[userId] = [];
      onlineUsers[userId].push(socket.id);
      console.log(`✅ User connected: ${userId}`);
    }

    socket.on("sendMessage", ({ senderId, receiverId, text }) => {
      const receiverSockets = onlineUsers[receiverId] || [];
      receiverSockets.forEach((socketId) => {
        io.to(socketId).emit("newMessage", { senderId, text });
      });
    });

    socket.on("disconnect", () => {
      if (userId) {
        onlineUsers[userId] = onlineUsers[userId].filter(
          (id) => id !== socket.id
        );
        if (onlineUsers[userId].length === 0) delete onlineUsers[userId];
      }
      console.log(`❌ User disconnected: ${userId}`);
    });
  });

  return io;
};

export const getReceiverSocketIds = (userId) => onlineUsers[userId] || [];
export { io };
