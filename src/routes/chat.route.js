import { Router } from "express";
import { getChats, getMessages, sendMessage } from "../controllers/chat.controller.js";
import { verifyAuth } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyAuth);

router.get("/", getChats);
router.get("/:chatId", getMessages);
router.post("/:chatId", sendMessage);

export default router;
