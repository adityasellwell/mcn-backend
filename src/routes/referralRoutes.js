import express from "express";
import {
  createReferral,
  getAllReferrals,
  getReferralStats,
  getReferralById,
  updateReferral,
  updateReferralStatus,
  deleteReferral,
} from "../controllers/referral/referralController.js";
import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

const auth = [adminAuthMiddleware, roleMiddleware("ADMIN")];

router.post("/", ...auth, createReferral);
router.get("/", ...auth, getAllReferrals);
router.get("/stats", ...auth, getReferralStats);
router.get("/:id", ...auth, getReferralById);
router.put("/:id", ...auth, updateReferral);
router.patch("/:id/status", ...auth, updateReferralStatus);
router.delete("/:id", ...auth, deleteReferral);

export default router;