import express from "express";

import {
  markMemberAttendance,
  markVisitorAttendance,
  getMeetingAttendance,
} from "../controllers/attendance/attendanceController.js";

import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.patch(
  "/member/:id",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  markMemberAttendance
);

router.patch(
  "/visitor/:id",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  markVisitorAttendance
);

router.get(
  "/meeting/:meetingId",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  getMeetingAttendance
);

export default router;