import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyAuth = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) return next("Unauthorized Access");

    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(payload?._id).select(
      "-password -refreshToken -forgotPasswordToken -forgotPasswordTokenExpiry"
    );

    if (!user) return next("Unauthorized Access");
    if (!roles.includes(user.role)) return next("Unauthorized Access");

    req.user = user;
    next();
  } catch (error) {
    next("Authentication Error");
    console.log(error);
  }
};
