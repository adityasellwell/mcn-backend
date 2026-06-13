import prisma from "../../config/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import  {generateAccessToken, generateRefreshToken} from "../../utils/jwt.js";

export const seedAdmin = async (req, res) => {
  try {
    const existingAdmin = await prisma.admin.findUnique({
      where: {
        email: "admin@mcn.com",
      },
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
            }
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const accessToken = generateAccessToken(admin);
    const refreshToken = generateRefreshToken(admin);

    await prisma.refreshToken.create({
      data: {
        adminId: admin.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

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
    // ─── TEMPORARY — expose actual error in production ───
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message, // ← shows actual error
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: {
        id: req.admin.id,
      },
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

    return res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const tokenRecord = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        isRevoked: false,
      },
    });

    if (!tokenRecord) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
    });

    const accessToken = generateAccessToken(admin);

    return res.status(200).json({
      success: true,
      accessToken,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Refresh token expired",
    });
  }
};

export const logoutAdmin = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: {
          token: refreshToken,
        },
        data: {
          isRevoked: true,
        },
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
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, profilePhoto } = req.body;

    const admin = await prisma.admin.update({
      where: {
        id: req.admin.id,
      },
      data: {
        name,
        phone,
        profilePhoto,
      },
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
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const admin = await prisma.admin.findUnique({
      where: {
        id: req.admin.id,
      },
    });

    const isMatch = await bcrypt.compare(
      currentPassword,
      admin.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      12
    );

    await prisma.admin.update({
      where: {
        id: admin.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const changeEmail = async (req, res) => {
  try {
    const { password, newEmail } = req.body;

    const admin = await prisma.admin.findUnique({
      where: {
        id: req.admin.id,
      },
    });

    const isMatch = await bcrypt.compare(
      password,
      admin.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Password is incorrect",
      });
    }

    const existingEmail = await prisma.admin.findUnique({
      where: {
        email: newEmail,
      },
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    await prisma.admin.update({
      where: {
        id: admin.id,
      },
      data: {
        email: newEmail,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Email updated successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};