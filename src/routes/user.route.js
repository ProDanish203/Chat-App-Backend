import { Router } from "express";
import {} from "../controllers/user.controller.js";
import { verifyAuth } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyAuth);

router.get("/current-user", getCurrentUser);
router.get("/users", getUser);
router.post("/logout", logoutUser);

export default router;
