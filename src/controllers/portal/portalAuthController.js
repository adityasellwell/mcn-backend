import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../config/prisma.js";
import { sendEmail } from "../../utils/sendEmail.js";
import { portalOtpTemplate } from "../../templates/portalOtpTemplate.js";
import {
  generatePortalAccessToken,
  generatePortalRefreshToken,
} from "../../utils/portalJwt.js";

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_OTP_ATTEMPTS = 5;
const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
});

// ─── Looks up an account by email: Member first, then Visitor. Returns a
// normalized "actor" shape, or null if neither table has a match. ───
export const findPortalActorByEmail = async (email) => {
  const member = await prisma.member.findUnique({ where: { email } });
  if (member) {
    return {
      role: "MEMBER",
      id: member.id,
      email: member.email,
      phone: member.phone || null,
      name: `${member.firstName} ${member.lastName || ""}`.trim(),
    };
  }

  const visitor = await prisma.visitor.findFirst({ where: { email } });
  if (visitor) {
    return {
      role: "VISITOR",
      id: visitor.id,
      email: visitor.email,
      phone: visitor.phone || null,
      name: `${visitor.firstName} ${visitor.lastName || ""}`.trim(),
    };
  }

  return null;
};

export const findPortalActorById = async (id, role) => {
  if (role === "MEMBER") {
    const member = await prisma.member.findUnique({ where: { id } });
    if (!member) return null;
    return {
      role: "MEMBER",
      id: member.id,
      email: member.email,
      phone: member.phone || null,
      name: `${member.firstName} ${member.lastName || ""}`.trim(),
    };
  }

  if (role === "VISITOR") {
    const visitor = await prisma.visitor.findUnique({ where: { id } });
    if (!visitor) return null;
    return {
      role: "VISITOR",
      id: visitor.id,
      email: visitor.email,
      phone: visitor.phone || null,
      name: `${visitor.firstName} ${visitor.lastName || ""}`.trim(),
    };
  }

  return null;
};

// ─────────────────────────────────────────────
// POST /api/portal/auth/request-otp
// { email } — only sends a code if the email belongs to an existing
// Member or Visitor. Never allows self-signup through this endpoint.
// ─────────────────────────────────────────────
export const requestOtp = async (req, res) => {
  try {
    const emailRaw = req.body?.email;

    if (!emailRaw || typeof emailRaw !== "string") {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const email = emailRaw.trim().toLowerCase();

    const actor = await findPortalActorByEmail(email);

    if (!actor) {
      return res.status(404).json({
        success: false,
        message:
          "No account found with this email. If you're new here, please register first.",
      });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const hashedCode = await bcrypt.hash(code, 12);

    await prisma.portalOtp.create({
      data: {
        email,
        code: hashedCode,
        purpose: "LOGIN",
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      },
    });

    try {
      await sendEmail({
        to: email,
        subject: "Your MCN Portal Login Code",
        html: portalOtpTemplate(actor.name, code),
      });
    } catch (emailError) {
      console.error("PORTAL OTP EMAIL ERROR:", emailError);
      return res.status(500).json({
        success: false,
        message: "Could not send the login code right now. Please try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "A login code has been sent to your email.",
    });
  } catch (error) {
    console.error("REQUEST OTP ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ─────────────────────────────────────────────
// POST /api/portal/auth/verify-otp
// { email, code }
// ─────────────────────────────────────────────
export const verifyOtp = async (req, res) => {
  try {
    const emailRaw = req.body?.email;
    const code = req.body?.code;

    if (!emailRaw || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and code are required",
      });
    }

    const email = String(emailRaw).trim().toLowerCase();

    const otp = await prisma.portalOtp.findFirst({
      where: { email, purpose: "LOGIN", consumedAt: null },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "No pending login code. Please request a new one.",
      });
    }

    if (otp.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "This code has expired. Please request a new one.",
      });
    }

    if (otp.attempts >= MAX_OTP_ATTEMPTS) {
      return res.status(400).json({
        success: false,
        message: "Too many incorrect attempts. Please request a new code.",
      });
    }

    const isMatch = await bcrypt.compare(String(code).trim(), otp.code);

    if (!isMatch) {
      await prisma.portalOtp.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      });

      return res.status(400).json({
        success: false,
        message: "Incorrect code. Please try again.",
      });
    }

    const actor = await findPortalActorByEmail(email);

    if (!actor) {
      return res.status(404).json({
        success: false,
        message: "This account no longer exists.",
      });
    }

    await prisma.portalOtp.update({
      where: { id: otp.id },
      data: { consumedAt: new Date() },
    });

    const accessToken = generatePortalAccessToken(actor);
    const refreshToken = generatePortalRefreshToken(actor);

    await prisma.portalSession.create({
      data: {
        actorType: actor.role,
        actorId: actor.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS),
      },
    });

    res.cookie("portalRefreshToken", refreshToken, {
      ...cookieOptions(),
      maxAge: REFRESH_TOKEN_MAX_AGE_MS,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: actor,
        role: actor.role,
        accessToken,
      },
    });
  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ─────────────────────────────────────────────
// POST /api/portal/auth/refresh-token
// ─────────────────────────────────────────────
export const refreshPortalToken = async (req, res) => {
  try {
    const token = req.cookies.portalRefreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_PORTAL_REFRESH_SECRET);

    const sessionRecord = await prisma.portalSession.findFirst({
      where: { token, isRevoked: false },
    });

    if (!sessionRecord) {
      return res.status(401).json({
        success: false,
        message: "Token revoked or invalid",
      });
    }

    const actor = await findPortalActorById(decoded.id, decoded.role);

    if (!actor) {
      return res.status(401).json({
        success: false,
        message: "Account not found",
      });
    }

    const accessToken = generatePortalAccessToken(actor);

    return res.status(200).json({
      success: true,
      accessToken,
    });
  } catch (error) {
    console.error("PORTAL REFRESH ERROR:", error.message);
    return res.status(401).json({
      success: false,
      message: "Refresh token expired or invalid",
    });
  }
};

// ─────────────────────────────────────────────
// POST /api/portal/auth/logout
// ─────────────────────────────────────────────
export const logoutPortal = async (req, res) => {
  try {
    const token = req.cookies.portalRefreshToken;

    if (token) {
      await prisma.portalSession.updateMany({
        where: { token },
        data: { isRevoked: true },
      });
    }

    res.clearCookie("portalRefreshToken", cookieOptions());

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("PORTAL LOGOUT ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ─────────────────────────────────────────────
// GET /api/portal/auth/me
// ─────────────────────────────────────────────
export const getPortalProfile = async (req, res) => {
  try {
    const { id, role } = req.portalUser;

    if (role === "MEMBER") {
      const member = await prisma.member.findUnique({
        where: { id },
        include: { chapter: true, chapterRoles: true },
      });

      if (!member) {
        return res.status(404).json({ success: false, message: "Member not found" });
      }

      const { password, ...safeMember } = member;

      return res.status(200).json({
        success: true,
        data: { role: "MEMBER", profile: safeMember },
      });
    }

    if (role === "VISITOR") {
      const visitor = await prisma.visitor.findUnique({
        where: { id },
        include: { referredByMember: { select: { id: true, firstName: true, lastName: true } } },
      });

      if (!visitor) {
        return res.status(404).json({ success: false, message: "Visitor not found" });
      }

      return res.status(200).json({
        success: true,
        data: { role: "VISITOR", profile: visitor },
      });
    }

    return res.status(400).json({ success: false, message: "Unknown role" });
  } catch (error) {
    console.error("GET PORTAL PROFILE ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ─────────────────────────────────────────────
// POST /api/portal/auth/impersonate/:role/:id
// Admin-only — logs the admin directly into a Member or Visitor's portal
// session, e.g. for support/troubleshooting. Requires adminAuthMiddleware
// + roleMiddleware("ADMIN") on the route (sets req.admin, not
// req.portalUser). Every impersonation session is stamped with the
// admin's id for audit purposes.
// ─────────────────────────────────────────────
export const adminImpersonatePortalUser = async (req, res) => {
  try {
    const role = String(req.params.role || "").toUpperCase();
    const id = Number(req.params.id);

    if (!["MEMBER", "VISITOR"].includes(role) || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role or id",
      });
    }

    const actor = await findPortalActorById(id, role);

    if (!actor) {
      return res.status(404).json({
        success: false,
        message: `${role === "MEMBER" ? "Member" : "Visitor"} not found`,
      });
    }

    const accessToken = generatePortalAccessToken(actor, { impersonated: true });
    const refreshToken = generatePortalRefreshToken(actor, { impersonated: true });

    await prisma.portalSession.create({
      data: {
        actorType: actor.role,
        actorId: actor.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS),
        issuedByAdminId: req.admin.id,
      },
    });

    res.cookie("portalRefreshToken", refreshToken, {
      ...cookieOptions(),
      maxAge: REFRESH_TOKEN_MAX_AGE_MS,
    });

    return res.status(200).json({
      success: true,
      message: `Logged in as ${actor.name || actor.email}`,
      data: {
        user: actor,
        role: actor.role,
        accessToken,
        impersonated: true,
      },
    });
  } catch (error) {
    console.error("ADMIN IMPERSONATE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
