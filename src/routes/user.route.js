import { Router } from "express";
import { verifyAuth } from "../middlewares/auth.middleware.js";
import { getUserById } from "../controllers/user.controller.js";

const router = Router();
router.use(verifyAuth);

router.get("/:id", getUserById);

export default router;
