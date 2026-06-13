import prisma from "../../config/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";

// ─────────────────────────────────────────────
// POST /api/admin/seed-admin
// Seed default admin (run once)
// ─────────────────────────────────────────────
export const seedAdmin = async (req, res) => {
  try {
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: "admin@mcn.com" },
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin already exists",
      });
    }

    const hashedPassword = await bcrypt.hash("admin123", 12);

    const admin = await prisma.admin.create({
      data: {
        name: "MCN Admin",
        email: "admin@mcn.com",
        password: hashedPassword,
        phone: "9999999999",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Admin seeded successfully",
      data: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        status: admin.status,
      },
    });
  } catch (error) {
    console.error("SEED ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ─────────────────────────────────────────────
// POST /api/admin/login
// Admin login
// ─────────────────────────────────────────────
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ─── Validate input ───
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // ─── Find admin ───
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // ─── Verify password ───
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // ─── Generate tokens ───
    const accessToken = generateAccessToken(admin);
    const refreshToken = generateRefreshToken(admin);

    // ─── Store refresh token ───
    await prisma.refreshToken.create({
      data: {
        adminId: admin.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // ─── Set refresh token cookie ───
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
        accessToken,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// GET /api/admin/profile
// Get admin profile
// ─────────────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profilePhoto: true,
        role: true,
        status: true,
      },
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    console.error("PROFILE ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ─────────────────────────────────────────────
// POST /api/admin/refresh-token
// Refresh access token using cookie
// ─────────────────────────────────────────────
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
      });
    }

    // ─── Verify token signature ───
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // ─── Check token in DB ───
    const tokenRecord = await prisma.refreshToken.findFirst({
      where: {
        token,
        isRevoked: false,
      },
    });

    if (!tokenRecord) {
      return res.status(401).json({
        success: false,
        message: "Token revoked or invalid",
      });
    }

    // ─── Find admin ───
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin not found",
      });
    }

    // ─── Generate new access token ───
    const accessToken = generateAccessToken(admin);

    return res.status(200).json({
      success: true,
      accessToken,
    });
  } catch (error) {
    console.error("REFRESH ERROR:", error.message);
    return res.status(401).json({
      success: false,
      message: "Refresh token expired or invalid",
    });
  }
};

// ─────────────────────────────────────────────
// POST /api/admin/logout
// Logout and revoke refresh token
// ─────────────────────────────────────────────
export const logoutAdmin = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      await prisma.refreshToken.updateMany({
        where: { token },
        data: { isRevoked: true },
      });
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("LOGOUT ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ─────────────────────────────────────────────
// PUT /api/admin/profile
// Update admin profile
// ─────────────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, profilePhoto } = req.body;

    const admin = await prisma.admin.update({
      where: { id: req.admin.id },
      data: { name, phone, profilePhoto },
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        profilePhoto: admin.profilePhoto,
      },
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ─────────────────────────────────────────────
// PUT /api/admin/change-password
// Change admin password
// ─────────────────────────────────────────────
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current and new password are required",
      });
    }

    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.id },
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.admin.update({
      where: { id: admin.id },
      data: { password: hashedPassword },
    });

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ─────────────────────────────────────────────
// PUT /api/admin/change-email
// Change admin email
// ─────────────────────────────────────────────
export const changeEmail = async (req, res) => {
  try {
    const { password, newEmail } = req.body;

    if (!password || !newEmail) {
      return res.status(400).json({
        success: false,
        message: "Password and new email are required",
      });
    }

    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.id },
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Password is incorrect",
      });
    }

    const existingEmail = await prisma.admin.findUnique({
      where: { email: newEmail },
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    await prisma.admin.update({
      where: { id: admin.id },
      data: { email: newEmail },
    });

    return res.status(200).json({
      success: true,
      message: "Email updated successfully",
    });
  } catch (error) {
    console.error("CHANGE EMAIL ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};