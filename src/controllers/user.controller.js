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
