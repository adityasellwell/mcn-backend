import express from "express";

import {
  assignMemberToMeeting,
  getMeetingMembers,
  removeMemberFromMeeting,
} from "../controllers/meeting/meetingMemberController.js";

import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
  "/",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  assignMemberToMeeting
);

router.get(
  "/meeting/:meetingId",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  getMeetingMembers
);

router.delete(
  "/:id",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  removeMemberFromMeeting
);

export default router;