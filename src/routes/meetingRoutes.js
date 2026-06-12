import express from "express";

import {
  createMeeting,
  getAllMeetings,
  getMeetingById,
  updateMeeting,
  deleteMeeting,
  getUpcomingMeetingByChapter
} from "../controllers/meeting/meetingController.js";

import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
  "/",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  createMeeting
);

router.get(
  "/",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  getAllMeetings
);

router.get(
  "/:id",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  getMeetingById
);

router.put(
  "/:id",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  updateMeeting
);

router.delete(
  "/:id",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  deleteMeeting
);

router.get(
  "/chapter/:chapterId/upcoming",
  getUpcomingMeetingByChapter
);

export default router;