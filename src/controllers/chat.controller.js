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

export const createGroup = async (req, res, next) => {
    try {
        const { groupName, members } = req.body;
        const currentUserId = req.user._id;

        if (!groupName) return next("Group name is required");
        if (members.length < 2)
            return next("Group must have at least 2 members");
        if (members.length > 20)
            return next("Group can have a maximum of 20 members");

        const group = await Chat.create({
            groupChatName: groupName,
            participants: [...members, currentUserId],
            createdBy: currentUserId,
            isGroupChat: true,
        });

        if (!group) return next("An error occured while creating the group");

        return res.status(200).json({
            success: true,
            message: "Group created successfully",
            data: group,
        });
    } catch (error) {
        next(error);
    }
};

export const addMembers = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { members } = req.body;
        if (!members) return next("Members are required");

        const group = await Chat.findById(id);
        if (!group) return next("Group not found");

        if (group.createdBy.toString() !== req.user._id.toString())
            return next("You are not authorized to add members to this group");

        if (group.participants.length + members.length > 20)
            return next("Group can have a maximum of 20 members");

        const newMembers = members.filter(
            (member) => !group.participants.includes(member)
        );
        group.participants = [...group.participants, ...newMembers];
        await group.save();

        return res.status(200).json({
            success: true,
            message: `${members.length > 1 ? "Members" : "Member"} added successfully`,
            data: group,
        });
    } catch (error) {
        next(error);
    }
};

export const leaveGroup = async (req, res, next) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user._id;

        const group = await Chat.findById(id);
        if (!group) return next("Group not found");

        if (!group.participants.includes(currentUserId))
            return next("You are not a member of this group");

        // Make any random participant the new group creator if the current user is the creator
        if (group.createdBy.toString() === currentUserId.toString()) {
            const randomParticipant = group.participants.find(
                (participant) =>
                    participant.toString() !== currentUserId.toString()
            );
            if (randomParticipant) {
                group.createdBy = randomParticipant;
            }
        }

        // if (group.createdBy.toString() === currentUserId.toString())
        //     return next("You cannot leave a group you created");

        group.participants = group.participants.filter(
            (participant) => participant.toString() !== currentUserId.toString()
        );

        await group.save();

        return res.status(200).json({
            success: true,
            message: "Group left successfully",
            data: "",
        });
    } catch (error) {
        next(error);
    }
};

export const removeMembers = async (req, res, next) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user._id;

        const { members } = req.body;
        if (!members) return next("Members are required");

        const group = await Chat.findById(id);
        if (!group) return next("Group not found");

        if (group.createdBy.toString() !== currentUserId.toString())
            return next(
                "You are not authorized to remove members from this group"
            );

        group.participants = group.participants.filter(
            (participant) => !members.includes(participant.toString())
        );
        await group.save();

        return res.status(200).json({
            success: true,
            message: "Group left successfully",
            data: "",
        });
    } catch (error) {
        next(error);
    }
};

export const updateGroup = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { groupName, groupDescription } = req.body;

        const group = await Chat.findById(id);
        if (!group) return next("Group not found");

        if (group.createdBy.toString() !== req.user._id.toString())
            return next("You are not authorized to update this group");

        group.groupChatName = groupName || group.groupChatName;
        group.groupDescription =
            groupDescription || group.groupDescription || "";

        await group.save();

        return res.status(200).json({
            success: true,
            message: "Group updated successfully",
            data: group,
        });
    } catch (error) {
        next(error);
    }
};
