import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import {
  createApplication,
  exportApplications,
  getApplications,
  getApplicationById,
  approveApplication,
  rejectApplication,
} from "../controllers/application/applicationController.js";

const router = express.Router();

// ─── Public Routes ───────────────────────────

// Submit registration form (public)
router.post(
  "/",
  upload.single("screenshot"),
  createApplication
);

// ─── Admin Routes ────────────────────────────

// List all applications
router.get(
  "/",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  getApplications
);

// Export applications to Excel
router.get(
  "/export",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  exportApplications
);

// Get single application
router.get(
  "/:id",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  getApplicationById
);

// Approve application
router.put(
  "/:id/approve",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  approveApplication
);

// Reject application
router.put(
  "/:id/reject",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  rejectApplication
);

export default router;