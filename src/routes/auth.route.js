import { Router } from "express";
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resetPassword,
  sendForgotLink,
} from "../controllers/auth.controller.js";
import { verifyAuth } from "../middlewares/auth.middleware.js";
import { ROLES } from "../utils/constants.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyAuth(Object.values(ROLES)), logoutUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/forgot-password", sendForgotLink);
router.post("/reset-password", resetPassword);

export default router;