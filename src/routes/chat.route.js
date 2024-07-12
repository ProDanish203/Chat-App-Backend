import { Router } from "express";
import { getChats } from "../controllers/chat.controller.js";
import { verifyAuth } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyAuth);

router.get("/", getChats);
// router.post("/send", sendMessage);

export default router;
