import { Router } from "express";
import {
    getChats,
    getMessages,
    sendMessage,
    createGroup,
    leaveGroup,
    addMembers,
    removeMembers,
    updateGroup,
} from "../controllers/chat.controller.js";
import { verifyAuth } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.use(verifyAuth);

router.get("/", getChats);
router.get("/:chatId", getMessages);
router.post("/:chatId", upload.array("attachments", 5), sendMessage);
// For groups
router.post("/group", createGroup);
router.put("/group/:id", updateGroup);
router.put("/group/:id/leave", leaveGroup);
router.put("/group/:id/members/add", addMembers);
router.put("/group/:id/members/remove", removeMembers);

export default router;
