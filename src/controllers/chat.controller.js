import { Chat } from "../models/chat.model.js";
import { Message } from "../models/message.model.js";
import { getRecipientSocketId, io } from "../socket/socket.js";

export const getChats = async (req, res, next) => {
    try {
        const chats = await Chat.find({
            participants: req.user._id,
        }).populate([
            {
                path: "participants",
                model: "User",
                select: "username avatar fullName",
                match: { _id: { $ne: req.user._id } },
            },
            {
                path: "lastMessage",
                model: "Message",
                select: "message readBy sender createdAt",
            },
        ]);

        return res.status(200).json({
            success: true,
            message: "Chats retrieved successfully",
            data: chats,
        });
    } catch (error) {
        next(error);
    }
};

export const sendMessage = async (req, res, next) => {
    try {
        const { chatId } = req.params;
        const { message } = req.body;
        // Validations
        if (!chatId) return next("ChatId is required");
        if (!message) return next("Message is required");

        const chat = await Chat.findById(chatId);
        if (!chat) return next("Chat not found");

        const newMessage = await Message.create({
            chatId,
            message,
            sender: req.user._id,
        });

        if (!newMessage) return next("An error occured, Try again later");

        // Update the last message in chat
        chat.lastMessage = newMessage._id;
        chat.updatedAt = Date.now();
        await chat.save();

        // Send the message through socket
        const chatParticipants = chat.participants;
        chatParticipants.forEach((participantId) => {
            const participantSocketId = getRecipientSocketId(participantId);
            if (participantSocketId) {
                io.to(participantSocketId).emit("newMessage", newMessage);
            }
        });

        return res.status(200).json({
            success: true,
            message: "Message sent successfully",
            data: newMessage,
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
};

export const getMessages = async (req, res, next) => {
    try {
        const { chatId } = req.params;
        if (!chatId) return next("ChatId is required");

        const messages = await Message.find({
            chatId,
        }).sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            message: "Chats retrieved successfully",
            data: messages,
        });
    } catch (error) {
        next(error);
    }
};
