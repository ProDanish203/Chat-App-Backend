import { Chat } from "../models/chat.model.js";

export const getChats = async (req, res, next) => {
    try {
        const chats = await Chat.find({
            participants: req.user._id,
        }).populate([
            {
                path: "participants",
                model: "User",
                select: "username avatar",
                match: { _id: { $ne: req.user._id } },
            },
            {
                path: "lastMessage",
                model: "Message",
                select: "message createdAt",
            },
        ]);

        return res.status(200).json({
            success: true,
            message: "Request withdrawn",
            data: chats,
        });
    } catch (error) {
        next(error);
    }
};
