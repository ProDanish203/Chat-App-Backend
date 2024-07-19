import { Chat } from "../models/chat.model.js";
import { Friend } from "../models/friend.model.js";
import { User } from "../models/user.model.js";
import { getPaginatedData, getPaginatedFriends } from "../utils/helpers.js";

export const sendRequest = async (req, res, next) => {
    try {
        const { receiverId } = req.body;
        const senderId = req.user._id;
        if (!receiverId) return next("Receiver ID is required");

        if (receiverId == senderId)
            return next("You can't send a request to yourself");

        const existingRequest = await Request.findOne({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId },
            ],
            status: { $in: ["pending", "approved"] },
        })
            .populate("sender", "fullName")
            .populate("receiver", "fullName");

        if (existingRequest) {
            if (existingRequest.status === "blocked") {
                const blockedUser =
                    existingRequest.blockedBy.toString() === senderId.toString()
                        ? existingRequest.receiver
                        : existingRequest.sender;
                return next(
                    `You can't send a request to ${blockedUser.fullName}. This user is blocked.`
                );
            }

            const otherUser =
                existingRequest.sender._id.toString() === senderId.toString()
                    ? existingRequest.receiver
                    : existingRequest.sender;

            if (existingRequest.status === "pending") {
                return next(
                    `A friend request already exists between you and ${otherUser.fullName}`
                );
            } else if (existingRequest.status === "approved") {
                return next(
                    `You are already friends with ${otherUser.fullName}`
                );
            }
        }

        const request = Request.create({
            sender: req.user._id,
            receiver: receiverId,
        });

        if (!request) return next("Request not sent, Try again later");

        return res.status(201).json({
            success: true,
            message: "Request sent",
            data: request,
        });
    } catch (error) {
        next(error);
        console.log(error);
    }
};

export const acceptOrRejectRequest = async (req, res, next) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        if (!status) return next("Status is required");

        if (!["approved", "rejected"].includes(status))
            return next("Invalid status");

        // Before updating the request, check if the request exists and the receiver is the current user
        const request = await Request.findOne({
            _id: id,
            receiver: req.user._id,
        });

        if (!request) return next("Request not found");

        const updatedRequest = await Request.findOneAndUpdate(request._id, {
            status,
        });
        if (!updatedRequest) return next("An error occured, Try again later");

        if (status === "approved") {
            const chat = await Chat.create({
                participants: [request.sender, request.receiver],
            });
            if (!chat) return next("An error occured, Try again later");
        }

        return res.status(200).json({
            success: true,
            message: `Request ${status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}`,
            data: updatedRequest,
        });
    } catch (error) {
        next(error);
        console.log(error);
    }
};

export const withdrawRequest = async (req, res, next) => {
    try {
        const { id } = req.params;

        const request = await Request.findOneAndDelete({
            _id: id,
            sender: req.user._id,
        });

        if (!request) return next("Request not found");

        return res.status(200).json({
            success: true,
            message: "Request withdrawn",
            data: request,
        });
    } catch (error) {
        next(error);
        console.log(error);
    }
};

export const getIncomingRequests = async (req, res, next) => {
    try {
        const page = +(req.query.page || 1);
        const limit = +(req.query.limit || 10);

        const incomingRequests = await getPaginatedData({
            model: Request,
            query: { receiver: req.user._id, status: "pending" },
            page,
            limit,
            populate: {
                path: "sender",
                model: User,
                select: "fullName avatar bio",
            },
        });

        return res.status(200).json({
            success: true,
            message: "Incoming requests",
            data: incomingRequests,
        });
    } catch (error) {
        next(error);
        console.log(error);
    }
};

export const getPendingRequest = async (req, res, next) => {
    try {
        const page = +(req.query.page || 1);
        const limit = +(req.query.limit || 10);

        const pendingRequests = await getPaginatedData({
            model: Request,
            query: { sender: req.user._id, status: "pending" },
            page,
            limit,
            populate: {
                path: "receiver",
                model: User,
                select: "fullName avatar bio",
            },
        });

        return res.status(200).json({
            success: true,
            message: "Pending requests",
            data: pendingRequests,
        });
    } catch (error) {
        next(error);
        console.log(error);
    }
};

export const getAllFriends = async (req, res, next) => {
    try {
        const page = +(req.query.page || 1);
        const limit = +(req.query.limit || 10);
        const search = req.query.search || "";

        const friends = await getPaginatedFriends({
            model: Request,
            query: {
                status: "approved",
                $or: [{ sender: req.user._id }, { receiver: req.user._id }],
            },
            page,
            limit,
            search,
            currentUser: req.user._id,
        });

        return res.status(200).json({
            success: true,
            message: "My Friends",
            data: friends,
        });
    } catch (error) {
        next(error);
        console.log(error);
    }
};

export const blockUser = async (req, res, next) => {
    try {
        const { userToBlockId } = req.body;
        const currentUserId = req.user._id;

        if (!userToBlockId) return next("User ID is required");
        if (userToBlockId == currentUserId)
            return next("You can't block yourself");

        const existingRequest = await Friend.findOne({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId },
            ],
            status: "approved",
        });

        if (!existingRequest)
            return next("You can't block a user you are not friends with");

        const blockedUser = await Friend.findByIdAndUpdate(
            existingRequest._id,
            {
                status: "blocked",
                blockedBy: currentUserId,
            }
        );

        if (!blockedUser) return next("An error occured, Try again later");

        return res.status(200).json({
            success: true,
            message: "User blocked successfully",
            data: blockedUser,
        });
    } catch (error) {
        next(error);
        console.log(error);
    }
};

export const unblockUser = async (req, res, next) => {
    try {
        const { userToUnblockId } = req.body;
        const currentUserId = req.user._id;

        if (!userToUnblockId) return next("User ID is required");

        const request = await Friend.findOne({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId },
            ],
            status: "blocked",
            blockedBy: currentUserId,
        });

        if (!request)
            return next("You can't block a user you are not friends with");

        const unblockUser = await Friend.findByIdAndUpdate(request._id, {
            status: "approved",
            blockedBy: "",
        });

        if (!unblockUser) return next("An error occured, Try again later");

        return res.status(200).json({
            success: true,
            message: "User unblocked successfully",
            data: unblockUser,
        });
    } catch (error) {
        next(error);
        console.log(error);
    }
};
