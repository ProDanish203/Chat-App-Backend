import { Router } from "express";
import { verifyAuth } from "../middlewares/auth.middleware.js";
import {
    getUserById,
    getUsersBySearch,
} from "../controllers/user.controller.js";

const router = Router();
router.use(verifyAuth);

router.get("/:id", getUserById);
router.post("/search-user", getUsersBySearch);

export default router;
