import { Router } from "express";
import {
    acceptOrRejectRequest,
    getAllFriends,
    getIncomingRequests,
    getPendingRequest,
    sendRequest,
    withdrawRequest,
} from "../controllers/request.controller.js";
import { verifyAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/send", verifyAuth, sendRequest);
router.put("/accept-reject-request/:id", verifyAuth, acceptOrRejectRequest);
router.delete("/withdraw/:id", verifyAuth, withdrawRequest);
router.get("/incoming", verifyAuth, getIncomingRequests);
router.get("/pending", verifyAuth, getPendingRequest);
router.get("/all-friends", verifyAuth, getAllFriends);

export default router;
