import rateLimit from "express-rate-limit";

// ─── Limits the public member-lookup endpoint so it can't be used to
// bulk-scrape member details. Generous enough that a real applicant
// mistyping their phone/email a few times never gets blocked. ───
export const memberLookupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again in a few minutes.",
  },
});

// ─── Limits how often an OTP can be requested per IP, so the portal login
// can't be used to spam someone's inbox with codes. ───
export const portalOtpRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 6, // per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again in a few minutes.",
  },
});

// ─── Limits how often a code can be verified per IP, to slow brute-forcing
// the 6-digit code even though it's short-lived and attempt-capped too. ───
export const portalOtpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again in a few minutes.",
  },
});
