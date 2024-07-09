import { Request } from "../models/request.model.js";
import { User } from "../models/user.model.js";
import { getPaginatedData, getPaginatedFriends } from "../utils/helpers.js";

export const sendRequest = async (req, res, next) => {
    try {
        const { receiverId } = req.body;
        if (!receiverId) return next("Receiver ID is required");

        if (receiverId == req.user._id)
            return next("You can't send a request to yourself");

        // Check if the request has been sent before
        const alreadySent = await Request.findOne({
            sender: req.user._id,
            receiver: receiverId,
            status: "pending",
        });
        if (alreadySent) return next("Request already sent");

        // Check if the users are already friends with a status of "approved"
        const alreadyFriends = await Request.findOne({
            status: "approved",
            $or: [
                { sender: receiverId, receiver: req.user._id },
                { sender: req.user._id, receiver: receiverId },
            ],
        })
            .populate({
                path: "receiver",
                model: User,
                select: "fullName",
            })
            .populate({
                path: "sender",
                model: User,
                select: "fullName",
            });

        if (alreadyFriends) {
            const friendUser =
                alreadyFriends.sender._id.toString() === req.user._id.toString()
                    ? alreadyFriends.receiver
                    : alreadyFriends.sender;

            return next(`You are already friends with ${friendUser.fullName}`);
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
            message: "Pending requests",
            data: friends,
        });
    } catch (error) {
        next(error);
        console.log(error);
    }
};
