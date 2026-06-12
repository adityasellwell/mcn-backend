import express from "express";

import {
  uploadMemberPayment,
  uploadVisitorPayment,

  approveMemberPayment,
  rejectMemberPayment,

  approveVisitorPayment,
  rejectVisitorPayment,

  getAllPayments,
  getPendingPayments,
  getApprovedPayments,
  getRejectedPayments,
} from "../controllers/payment/paymentController.js";

import upload from "../middleware/uploadMiddleware.js";

import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
  "/",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  getAllPayments
);

router.get(
  "/pending",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  getPendingPayments
);

router.get(
  "/approved",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  getApprovedPayments
);

router.get(
  "/rejected",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  getRejectedPayments
);

router.patch(
  "/member/:id/upload",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  upload.single("paymentScreenshot"),
  uploadMemberPayment
);

router.patch(
  "/visitor/:id/upload",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  upload.single("paymentScreenshot"),
  uploadVisitorPayment
);

router.patch(
  "/member/:id/approve",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  approveMemberPayment
);

router.patch(
  "/member/:id/reject",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  rejectMemberPayment
);

router.patch(
  "/visitor/:id/approve",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  approveVisitorPayment
);

router.patch(
  "/visitor/:id/reject",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  rejectVisitorPayment
);

export default router;