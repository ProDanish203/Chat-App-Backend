import { Router } from "express";
import {
    getChats,
    getMessages,
    sendMessage,
} from "../controllers/chat.controller.js";
import { verifyAuth } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.use(verifyAuth);

router.get("/", getChats);
router.get("/:chatId", getMessages);
router.post("/:chatId", upload.array("attachments", 5), sendMessage);

export default router;
