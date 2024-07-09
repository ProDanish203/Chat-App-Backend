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
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.post("/register", upload.single("avatar"), registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyAuth, logoutUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/forgot-password", sendForgotLink);
router.post("/reset-password", resetPassword);

export default router;