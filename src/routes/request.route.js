import { Router } from "express";
import {
    acceptOrRejectRequest,
    getAllFriends,
    getIncomingRequests,
    getPendingRequest,
    getUsersBySearch,
    sendRequest,
    withdrawRequest,
} from "../controllers/request.controller.js";
import { verifyAuth } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyAuth);

router.post("/send", sendRequest);
router.put("/accept-reject-request/:id", acceptOrRejectRequest);
router.delete("/withdraw/:id", withdrawRequest);
router.get("/incoming", getIncomingRequests);
router.get("/pending", getPendingRequest);
router.get("/all-friends", getAllFriends);
router.post("/users", getUsersBySearch);

export default router;
