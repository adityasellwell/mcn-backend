import express from "express";
import { createMember, getAllMembers, getMemberById, updateMember, updateMemberStatus, deleteMember, lookupMember } from "../controllers/member/memberController.js";
import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import { memberLookupLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// ─── Public — must be registered before "/:id" or it'd be swallowed by it ───
router.get(
  "/lookup",
  memberLookupLimiter,
  lookupMember
);

router.post(
  "/",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  createMember
);

router.get(
  "/",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  getAllMembers
);

router.get(
  "/:id",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  getMemberById
);

router.put(
  "/:id",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  updateMember
);

router.patch(
  "/:id/status",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  updateMemberStatus
);

router.delete(
  "/:id",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  deleteMember
);

export default router;