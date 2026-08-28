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

import {
  registrationApprovalTemplate,
} from "../../templates/registrationApprovalTemplate.js";

import { generateMemberCode } from "../../utils/generateMemberCode.js";

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
        parsedSocialLinks = typeof socialLinks === "string" ? JSON.parse(socialLinks) : socialLinks;
      } catch {
        parsedSocialLinks = [];
      }
    }

    const socialProfilesString = Array.isArray(parsedSocialLinks) && parsedSocialLinks.length > 0
      ? JSON.stringify(parsedSocialLinks)
      : null;

    // ─── Parse IDs as integers ───
    const parsedChapterId = chapterId ? parseInt(chapterId) : null;
    const parsedMeetingId = meetingId ? parseInt(meetingId) : null;

    // ─── Guard against duplicate submissions (double-click, retry, etc.) ───
    // Same person + same meeting/type submitted again within the last 2 minutes
    // while still PENDING is treated as a duplicate, not a new application.
    const duplicateWindowStart = new Date(Date.now() - 2 * 60 * 1000);
    const existingDuplicate = await prisma.registrationApplication.findFirst({
      where: {
        email,
        mobile,
        registrationType,
        meetingId: parsedMeetingId,
        status: "PENDING",
        createdAt: { gte: duplicateWindowStart },
      },
      orderBy: { createdAt: "desc" },
    });

    if (existingDuplicate) {
      return res.status(200).json({
        success: true,
        message: "Application already submitted",
        data: existingDuplicate,
      });
    }

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
        socialProfiles: socialProfilesString,
        address,
        referredBy: referredBy || null,
        utrNumber: utrNumber || null,
        paymentScreenshot,
      },
    });

    // ─── Auto-create visitor if VISITOR type — only if one doesn't already
    // exist for this phone number. Visitor.phone is unique, so a returning
    // visitor registering for a new meeting would otherwise crash this
    // insert and fail the whole request. ───
    if (registrationType === "VISITOR") {
      const existingVisitor = await prisma.visitor.findUnique({
        where: { phone: mobile },
      });

      if (!existingVisitor) {
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
    const { status, meetingId } = req.query;

    const where = {};
    if (status) where.status = status;
    if (meetingId) where.meetingId = Number(meetingId);

    const applications =
      await prisma.registrationApplication.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          meeting: {
            select: {
              title: true,
            },
          },
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
            header: "Meeting ID",
            key: "meetingId",
          },

          {
            header: "Meeting Title",
            key: "meetingTitle",
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

        data: applications.map((application) => ({
          ...application,
          meetingTitle: application.meeting?.title || "",
        })),
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
    const { status, type, search, meetingId } = req.query;

    const where = {};

    // Filter by status enum
    if (status) where.status = status;

    // Filter by registration type enum
    if (type) where.registrationType = type;

    // Filter by meeting
    if (meetingId) where.meetingId = Number(meetingId);

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
// DELETE /api/application/:id
// Hard delete application (admin) — permanently removes the row
// ─────────────────────────────────────────────
export const deleteApplication = async (req, res) => {
  try {
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

    await prisma.registrationApplication.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Application permanently deleted",
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

    // ─── Approving a MEMBER application must create the actual Member
    // record — otherwise the applicant never shows up on the Members page ───
    if (application.registrationType === "MEMBER") {
      if (!application.chapterId) {
        return res.status(400).json({
          success: false,
          message:
            "This application has no chapter assigned. Please assign a chapter before approving.",
        });
      }

      const existingMember = await prisma.member.findFirst({
        where: {
          OR: [
            { email: application.email },
            { phone: application.mobile },
          ],
        },
      });

      if (!existingMember) {
        const nameParts = application.fullName.trim().split(/\s+/);
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(" ") || nameParts[0];

        const memberCode = await generateMemberCode(application.chapterId);

        await prisma.member.create({
          data: {
            chapterId: application.chapterId,
            memberCode,
            firstName,
            lastName,
            email: application.email,
            phone: application.mobile,
            companyName: application.companyName,
            profession: application.businessCategory,
            businessCategory: application.businessCategory,
            website: application.website || null,
            status: "ACTIVE",
          },
        });
      }
    }

    // Update status to APPROVED
    const updated =
      await prisma.registrationApplication.update({
        where: { id },
        data: { status: "APPROVED" },
      });

    // Fetch meeting details if meetingId exists
    let meeting = null;
    if (updated.meetingId) {
      meeting = await prisma.meeting.findUnique({
        where: { id: updated.meetingId },
      });
    }

    // Send approval email if SMTP is configured
    if (
      process.env.SMTP_EMAIL &&
      process.env.SMTP_PASSWORD
    ) {
      await sendEmail({
        to: updated.email,
        subject: "MCN Application Approved",
        html: registrationApprovalTemplate(updated, meeting),
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
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <div style="background: #0C831F; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
              <h1 style="color: white; margin: 0; font-size: 24px;">MCN - Muslim Community Network</h1>
              <p style="color: #d4f5d4; margin: 6px 0 0;">Application Status Update</p>
            </div>
            <p>Dear <strong>${updated.fullName}</strong>,</p>
            <p>After careful review of your registration application for <strong>Muslim Community Network (MCN)</strong>, we are unable to proceed at this time.</p>
            <p>If you have any questions or would like more information, please feel free to reach out to us.</p>
            <p>We appreciate your interest in our community.</p>
            <br/>
            <p>Regards,<br/><strong>Muslim Community Network Team</strong></p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <div style="text-align: center; font-size: 11px; color: #888; margin-top: 20px; font-style: italic;">
              Beautifully developed and maintained by <a href="https://inspiringinfosys.com" style="color: #0C831F; text-decoration: none; font-weight: bold;">Inspiring Infosys</a>
            </div>
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