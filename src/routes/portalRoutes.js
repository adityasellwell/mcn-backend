import express from "express";
import {
  requestOtp,
  verifyOtp,
  refreshPortalToken,
  logoutPortal,
  getPortalProfile,
  adminImpersonatePortalUser,
} from "../controllers/portal/portalAuthController.js";
import {
  updatePortalProfile,
  getPortalMeetings,
  registerPortalMeeting,
  submitPortalMeetingPayment,
} from "../controllers/portal/portalMeetingController.js";
import {
  getPortalReferrals,
  createPortalReferral,
  invitePortalVisitor,
  getPortalMembers,
} from "../controllers/portal/portalReferralController.js";

import portalAuthMiddleware from "../middleware/portalAuthMiddleware.js";
import requirePortalRole from "../middleware/requirePortalRole.js";
import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import {
  portalOtpRequestLimiter,
  portalOtpVerifyLimiter,
} from "../middleware/rateLimiter.js";

const router = express.Router();

// ─── Public — auth entry points ───
router.post("/auth/request-otp", portalOtpRequestLimiter, requestOtp);
router.post("/auth/verify-otp", portalOtpVerifyLimiter, verifyOtp);
router.post("/auth/refresh-token", refreshPortalToken);

// ─── Requires a valid portal session ───
router.post("/auth/logout", portalAuthMiddleware, logoutPortal);
router.get("/auth/me", portalAuthMiddleware, getPortalProfile);

// ─── Profile & Self-Service Profile Update ───
router.patch("/profile", portalAuthMiddleware, updatePortalProfile);

// ─── Meetings (Member/Visitor) ───
router.get("/meetings", portalAuthMiddleware, getPortalMeetings);
router.post("/meetings/:meetingId/register", portalAuthMiddleware, registerPortalMeeting);
router.patch(
  "/meetings/:meetingId/payment",
  portalAuthMiddleware,
  upload.single("paymentScreenshot"),
  submitPortalMeetingPayment
);

// ─── Referrals & Invites (Member-Only) ───
router.get("/referrals", portalAuthMiddleware, requirePortalRole("MEMBER"), getPortalReferrals);
router.post("/referrals", portalAuthMiddleware, requirePortalRole("MEMBER"), createPortalReferral);
router.post("/invite", portalAuthMiddleware, requirePortalRole("MEMBER"), invitePortalVisitor);
router.get("/members", portalAuthMiddleware, requirePortalRole("MEMBER"), getPortalMembers);

// ─── Admin-only — "log in as" a Member/Visitor from the admin panel ───
router.post(
  "/auth/impersonate/:role/:id",
  adminAuthMiddleware,
  roleMiddleware("ADMIN"),
  adminImpersonatePortalUser
);

export default router;
