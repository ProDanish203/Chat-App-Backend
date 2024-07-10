import { Router } from "express";
import { sendMessage } from "../controllers/chat.controller.js";
import { verifyAuth } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyAuth);

router.post("/send", sendMessage);


export default router;
