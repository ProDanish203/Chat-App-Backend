import { Server } from "socket.io";
import http from "http";
import express from "express";
import { Message } from "../models/message.model.js";

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
    // Send online users data to client
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Handle the typing events from client
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

    socket.on(
        "markMessagesAsSeen",
        async ({ participants, chatId, userId }) => {
            participants.forEach(async (participantId) => {
                const participantSocketId = getRecipientSocketId(participantId);
                try {
                    if (participantSocketId) {
                        await Message.updateMany(
                            {
                                chatId,
                                readBy: { $ne: participantId },
                            },
                            {
                                $addToSet: { readBy: participantId },
                            }
                        );
                        io.to(userSocketMap[userId]).emit("messagesSeen", {
                            chatId,
                            userId: participantId,
                        });
                    }
                } catch (err) {
                    console.log(err);
                }
            });
        }
    );

    // Handle the disconnect event from client
    socket.on("disconnect", () => {
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { app, server, io };
