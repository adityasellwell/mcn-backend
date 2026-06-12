import express from "express";
import { createMember, getAllMembers, getMemberById, updateMember, updateMemberStatus, deleteMember } from "../controllers/member/memberController.js";
import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

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