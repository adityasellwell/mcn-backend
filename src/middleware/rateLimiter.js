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
