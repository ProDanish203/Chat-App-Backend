import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST", "PUT", "DELETE"],
    },
});

export const getRecipientSocketId = (recipientId) => {
    return userSocketMap[recipientId];
};

const userSocketMap = {}; // userId: socketId

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) userSocketMap[userId] = socket.id;
    // Send data to client
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("startTyping", ({ participants, chatId }) => {
        participants.forEach((participantId) => {
            const participantSocketId = getRecipientSocketId(participantId);
            if (participantSocketId) {
                io.to(participantSocketId).emit("typing", { chatId, userId });
            }
        });
    });

    socket.on("stopTyping", ({ participants, chatId }) => {
        participants.forEach((participantId) => {
            const participantSocketId = getRecipientSocketId(participantId);
            if (participantSocketId) {
                io.to(participantSocketId).emit("typingStopped", {
                    chatId,
                    userId,
                });
            }
        });
    });

    // Handle the event from client
    socket.on("disconnect", () => {
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { app, server, io };
