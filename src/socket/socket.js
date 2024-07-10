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

const userSocketMap = {}; // userId: socketId

io.on("connection", (socket) => {
    console.log("user connected", socket.id);
    const userId = socket.handshake.query.userId;
    console.log(userId)
    if (userId) userSocketMap[userId] = socket.id;
    // Send data to client
    io.emit("getOnlineUser", Object.keys(userSocketMap));

    console.log(userSocketMap)

    // Handle the event from client
    socket.on("disconnect", () => {
        console.log("user disconnected", socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUser", Object.keys(userSocketMap));
    });
});

export { app, server, io };
