import express from "express";
import { seedAdmin, loginAdmin, getProfile, refreshToken, logoutAdmin, updateProfile, changePassword, changeEmail} from "../controllers/admin/authController.js";
import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js"
const router = express.Router();

router.get("/seed-admin", seedAdmin);
router.post("/login", loginAdmin);
router.get("/profile", adminAuthMiddleware, roleMiddleware("ADMIN"), getProfile);
router.post("/refresh-token", refreshToken);
router.post("/logout", adminAuthMiddleware, roleMiddleware("ADMIN"), logoutAdmin);
router.put("/profile", adminAuthMiddleware, roleMiddleware("ADMIN"), updateProfile);
router.put("/change-password", adminAuthMiddleware, roleMiddleware("ADMIN"), changePassword);
router.put("/change-email", adminAuthMiddleware, roleMiddleware("ADMIN"), changeEmail);
export default router;