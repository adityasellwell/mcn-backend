import prisma from "../../config/prisma.js";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload.js"; // import uploadToCloudinary from "../../utils/cloudinaryUpload.js";
import { sendEmail } from "../../utils/sendEmail.js";
import { exportToExcel } from "../../utils/excelExport.js";

import {
  registrationUserTemplate,
} from "../../templates/registrationUserTemplate.js";

import {
  registrationAdminTemplate,
} from "../../templates/registrationAdminTemplate.js";
 
export const createApplication = async (req, res) => {
  try {
    // ─── Handle payment screenshot upload ───
    let paymentScreenshot = null;
    if (req.file && process.env.CLOUDINARY_CLOUD_NAME) {
      const uploadedFile = await uploadToCloudinary(
        req.file.buffer,
        "mcn/applications"
      );
      paymentScreenshot = uploadedFile.secure_url;
    }

    const {
      registrationType,
      chapterId,
      chapterName,
      meetingId,
      fullName,
      mobile,
      email,
      companyName,
      businessCategory,
      website,
      socialLinks,
      address,
      referredBy,
      utrNumber,
    } = req.body;

    // ─── Parse socialLinks JSON string → array ───
    let parsedSocialLinks = [];
    if (socialLinks) {
      try {
        parsedSocialLinks = JSON.parse(socialLinks);
      } catch {
        parsedSocialLinks = [];
      }
    }

    // ─── Parse IDs as integers ───
    const parsedChapterId = chapterId ? parseInt(chapterId) : null;
    const parsedMeetingId = meetingId ? parseInt(meetingId) : null;

    // ─── Create application ───
    const application = await prisma.registrationApplication.create({
      data: {
        registrationType,
        chapterName: chapterName || null,
        chapterId: parsedChapterId,
        meetingId: parsedMeetingId,
        fullName,
        mobile,
        email,
        companyName,
        businessCategory,
        website: website || null,
        socialProfiles: parsedSocialLinks,
        address,
        referredBy: referredBy || null,
        utrNumber: utrNumber || null,
        paymentScreenshot,
      },
    });

    // ─── Auto-create visitor if VISITOR type ───
    if (registrationType === "VISITOR") {
      await prisma.visitor.create({
        data: {
          firstName: fullName,
          email,
          phone: mobile,
          companyName,
          businessCategory,
          source: "WEBSITE",
          status: "REGISTERED",
        },
      });
    }

    // ─── Fetch meeting details for email ───
    let meeting = null;
    if (parsedMeetingId) {
      meeting = await prisma.meeting.findUnique({
        where: { id: parsedMeetingId },
      });
    }

    console.log("socialProfiles before email:", application.socialProfiles);

    // ─── Send confirmation email ───
    if (process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
      await sendEmail({
        to: application.email,
        subject: "MCN Registration Received",
        html: registrationUserTemplate(application, meeting),
      });
    }

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: application,
      meeting,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const exportApplications =
async (req, res) => {
  try {
    const applications =
      await prisma.registrationApplication.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

    const workbook =
      await exportToExcel({
        sheetName: "Applications",

        columns: [
          {
            header: "ID",
            key: "id",
          },

          {
            header: "Name",
            key: "fullName",
          },

          {
            header: "Mobile",
            key: "mobile",
          },

          {
            header: "Email",
            key: "email",
          },

          {
            header: "Company",
            key: "companyName",
          },

          {
            header: "Category",
            key: "businessCategory",
          },

          {
            header: "Type",
            key: "registrationType",
          },

          {
            header: "Chapter",
            key: "chapterName",
          },

          {
            header: "UTR",
            key: "utrNumber",
          },

          {
            header: "Created At",
            key: "createdAt",
          },
        ],

        data: applications,
      });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=applications.xlsx"
    );

    await workbook.xlsx.write(res);

    res.end();
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ─────────────────────────────────────────────
// GET /api/application
// List all applications (admin)
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// GET /api/application
// List all applications (admin)
// ─────────────────────────────────────────────
export const getApplications = async (req, res) => {
  try {
    const { status, type, search } = req.query;

    const where = {};

    // Filter by status enum
    if (status) where.status = status;

    // Filter by registration type enum
    if (type) where.registrationType = type;

    // Search by name, email, or mobile
    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { email: { contains: search } },
        { mobile: { contains: search } },
      ];
    }

    const applications =
      await prisma.registrationApplication.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });

    return res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ─────────────────────────────────────────────
// GET /api/application/:id
// Get single application by ID (admin)
// ─────────────────────────────────────────────
export const getApplicationById = async (req, res) => {
  try {
    // Parse id as Int — schema uses Int primary key
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const application =
      await prisma.registrationApplication.findUnique({
        where: { id },
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ─────────────────────────────────────────────
// PUT /api/application/:id/approve
// Approve application (admin)
// ─────────────────────────────────────────────
export const approveApplication = async (req, res) => {
  try {
    // Parse id as Int — schema uses Int primary key
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const application =
      await prisma.registrationApplication.findUnique({
        where: { id },
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (application.status === "APPROVED") {
      return res.status(400).json({
        success: false,
        message: "Application already approved",
      });
    }

    // Update status to APPROVED
    const updated =
      await prisma.registrationApplication.update({
        where: { id },
        data: { status: "APPROVED" },
      });

    // Send approval email if SMTP is configured
    if (
      process.env.SMTP_EMAIL &&
      process.env.SMTP_PASSWORD
    ) {
      await sendEmail({
        to: updated.email,
        subject: "MCN Application Approved",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0C831F;">Application Approved!</h2>
            <p>Dear ${updated.fullName},</p>
            <p>Your registration application for MCN has been <strong>approved</strong>.</p>
            <p>Our team will reach out to you shortly with further details about your membership and upcoming meetings.</p>
            <br/>
            <p>Welcome to the MCN family!</p>
            <p style="color: #666;">— MCN Team</p>
          </div>
        `,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Application approved successfully",
      data: updated,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ─────────────────────────────────────────────
// PUT /api/application/:id/reject
// Reject application (admin)
// ─────────────────────────────────────────────
export const rejectApplication = async (req, res) => {
  try {
    // Parse id as Int — schema uses Int primary key
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const application =
      await prisma.registrationApplication.findUnique({
        where: { id },
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (application.status === "REJECTED") {
      return res.status(400).json({
        success: false,
        message: "Application already rejected",
      });
    }

    // Update status to REJECTED
    const updated =
      await prisma.registrationApplication.update({
        where: { id },
        data: { status: "REJECTED" },
      });

    // Send rejection email if SMTP is configured
    if (
      process.env.SMTP_EMAIL &&
      process.env.SMTP_PASSWORD
    ) {
      await sendEmail({
        to: updated.email,
        subject: "MCN Application Update",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #e53e3e;">Application Status Update</h2>
            <p>Dear ${updated.fullName},</p>
            <p>After reviewing your registration application, we are unable to proceed at this time.</p>
            <p>If you have any questions, please feel free to contact us.</p>
            <br/>
            <p style="color: #666;">— MCN Team</p>
          </div>
        `,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Application rejected",
      data: updated,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};