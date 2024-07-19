import { User } from "../models/user.model.js";

export const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select(
            "fullName username avatar email bio createdAt"
        );

        if (!user) return next("User not found");

        return res.status(200).json({
            success: true,
            message: "User found",
            data: user,
        });
    } catch (error) {
        next(error);
        console.log(error);
    }
};

export const getUsersBySearch = async (req, res, next) => {
    try {
        const { search } = req.body;
        const currentUserId = req.user.id;
        const friendRequests = await Request.find({
            status: "approved",
            $or: [{ sender: currentUserId }, { receiver: currentUserId }],
        });

        const friendIds = friendRequests.map((request) =>
            request.sender.equals(currentUserId)
                ? request.receiver
                : request.sender
        );

        const excludeIds = [currentUserId, ...friendIds];

        const users = await User.find({
            $and: [
                { _id: { $nin: excludeIds } },
                {
                    $or: [
                        { username: { $regex: search, $options: "i" } },
                        { email: { $regex: search, $options: "i" } },
                    ],
                },
            ],
        }).select("_id username email fullName avatar");

        return res.status(200).json({
            success: true,
            message: "Users found",
            data: users,
        });
    } catch (error) {
        next(error);
        console.log(error);
    }
};
