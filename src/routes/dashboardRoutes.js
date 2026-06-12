import express from "express";
import adminAuthMiddleware from  "../middleware/adminAuthMiddleware.js";
import roleMiddleware from  "../middleware/roleMiddleware.js";
import {
  getDashboardOverview,
  getRecentApplications,
  getUpcomingMeetings,
} from "../controllers/admin/dashboardController.js";

const router = express.Router();

router.get("/overview", getDashboardOverview);

router.get(
  "/recent-applications",
  getRecentApplications
);

router.get(
  "/upcoming-meetings",
  getUpcomingMeetings
);

export default router;