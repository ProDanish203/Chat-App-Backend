import { Router } from "express";
import {
    acceptOrRejectRequest,
    getAllFriends,
    getIncomingRequests,
    getPendingRequest,
    sendRequest,
    withdrawRequest,
} from "../controllers/friend.controller.js";
import { verifyAuth } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyAuth);

router.post("/send-request", sendRequest);
router.put("/accept-reject-request/:id", acceptOrRejectRequest);
router.delete("/withdraw-request/:id", withdrawRequest);
router.get("/incoming-requests", getIncomingRequests);
router.get("/pending-requests", getPendingRequest);
router.get("/all", getAllFriends);

export default router;
