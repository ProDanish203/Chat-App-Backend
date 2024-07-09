import { Router } from "express";
import {
} from "../controllers/user.controller.js";
import { verifyAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/current-user" , verifyAuth, getCurrentUser);
router.get("/users", verifyAuth, getUser);
router.post("/logout", verifyAuth, logoutUser);

export default router;