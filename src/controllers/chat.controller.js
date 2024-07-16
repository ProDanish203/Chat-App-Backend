import { Chat } from "../models/chat.model.js";
import { Message } from "../models/message.model.js";
import { getRecipientSocketId, io } from "../socket/socket.js";
import { uploadFile } from "../utils/fileUpload.js";

export const getChats = async (req, res, next) => {
    try {
        const chats = await Chat.aggregate([
            { $match: { participants: req.user._id } },
            {
                $lookup: {
                    from: "users",
                    localField: "participants",
                    foreignField: "_id",
                    as: "participants",
                },
            },
            {
                $lookup: {
                    from: "messages",
                    localField: "lastMessage",
                    foreignField: "_id",
                    as: "lastMessageArray",
                },
            },
            {
                $addFields: {
                    participants: {
                        $filter: {
                            input: "$participants",
                            as: "participant",
                            cond: { $ne: ["$$participant._id", req.user._id] },
                        },
                    },
                    lastMessage: { $arrayElemAt: ["$lastMessageArray", 0] },
                },
            },
            {
                $project: {
                    participants: {
                        _id: 1,
                        username: 1,
                        avatar: 1,
                        fullName: 1,
                    },
                    lastMessage: {
                        message: 1,
                        attachments: 1,
                        readBy: 1,
                        sender: 1,
                        createdAt: 1,
                    },
                    createdAt: 1,
                },
            },
            {
                $sort: {
                    "lastMessage.createdAt": -1,
                    createdAt: -1,
                },
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
        const files = req.files;
        // Validations
        if (!chatId) return next("ChatId is required");
        if (!message && (!files || files.length === 0))
            return next("Message is required");

        const chat = await Chat.findById(chatId);
        if (!chat) return next("Chat not found");

        let attachments = [];
        if (files && files.length > 0) {
            if (files.length > 5)
                return next(
                    "You can only upload a maximum of 5 files at a time"
                );
            for (const file of files) {
                const result = await uploadFile(file.path);
                if (result) {
                    attachments.push({
                        public_id: result.public_id,
                        url: result.secure_url,
                    });
                }
            }
        }

        const newMessage = await Message.create({
            chatId,
            message,
            sender: req.user._id,
            attachments,
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
