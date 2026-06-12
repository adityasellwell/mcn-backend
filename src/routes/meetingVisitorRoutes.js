import express from "express";

import {
  assignVisitorToMeeting,
  getMeetingVisitors,
  removeVisitorFromMeeting,
} from "../controllers/meeting/meetingVisitorController.js";

import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
  "/",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  assignVisitorToMeeting
);

router.get(
  "/meeting/:meetingId",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  getMeetingVisitors
);

router.delete(
  "/:id",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  removeVisitorFromMeeting
);

export default router;