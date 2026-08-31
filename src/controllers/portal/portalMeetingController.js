import prisma from "../../config/prisma.js";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload.js";

// Update profile (Self-Service)
export const updatePortalProfile = async (req, res) => {
  try {
    const { id, role } = req.portalUser;

    if (role === "MEMBER") {
      const { companyName, profession, businessCategory, website } = req.body;

      const updated = await prisma.member.update({
        where: { id },
        data: {
          companyName: companyName !== undefined ? companyName : undefined,
          profession: profession !== undefined ? profession : undefined,
          businessCategory: businessCategory !== undefined ? businessCategory : undefined,
          website: website !== undefined ? website : undefined,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: updated,
      });
    }

    if (role === "VISITOR") {
      const { companyName, businessCategory } = req.body;

      const updated = await prisma.visitor.update({
        where: { id },
        data: {
          companyName: companyName !== undefined ? companyName : undefined,
          businessCategory: businessCategory !== undefined ? businessCategory : undefined,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: updated,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid portal role",
    });
  } catch (error) {
    console.error("PORTAL PROFILE UPDATE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get Portal Meetings
export const getPortalMeetings = async (req, res) => {
  try {
    const { id, role } = req.portalUser;

    if (role === "MEMBER") {
      // Find the member's chapter
      const member = await prisma.member.findUnique({
        where: { id },
        select: { chapterId: true },
      });

      if (!member) {
        return res.status(404).json({
          success: false,
          message: "Member not found",
        });
      }

      // Find active meetings in their chapter
      const meetings = await prisma.meeting.findMany({
        where: {
          chapterId: member.chapterId,
          status: "ACTIVE",
        },
        include: {
          chapter: true,
          meetingMembers: {
            where: { memberId: id },
          },
        },
        orderBy: {
          meetingDate: "desc",
        },
      });

      // Normalize shape so the frontend knows the user's registration state
      const formatted = meetings.map((m) => {
        const reg = m.meetingMembers[0] || null;
        const { meetingMembers, ...meetingData } = m;
        return {
          ...meetingData,
          registration: reg
            ? {
                id: reg.id,
                paymentStatus: reg.paymentStatus,
                paymentScreenshot: reg.paymentScreenshot,
                utrNumber: reg.utrNumber,
                attendanceStatus: reg.attendanceStatus,
              }
            : null,
        };
      });

      return res.status(200).json({
        success: true,
        data: formatted,
      });
    }

    if (role === "VISITOR") {
      // Visitors see all active meetings
      const meetings = await prisma.meeting.findMany({
        where: {
          status: "ACTIVE",
        },
        include: {
          chapter: true,
          meetingVisitors: {
            where: { visitorId: id },
          },
        },
        orderBy: {
          meetingDate: "desc",
        },
      });

      const formatted = meetings.map((m) => {
        const reg = m.meetingVisitors[0] || null;
        const { meetingVisitors, ...meetingData } = m;
        return {
          ...meetingData,
          registration: reg
            ? {
                id: reg.id,
                paymentStatus: reg.paymentStatus,
                paymentScreenshot: reg.paymentScreenshot,
                utrNumber: reg.utrNumber,
                attendanceStatus: reg.attendanceStatus,
              }
            : null,
        };
      });

      return res.status(200).json({
        success: true,
        data: formatted,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid portal role",
    });
  } catch (error) {
    console.error("PORTAL GET MEETINGS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Register for Meeting
export const registerPortalMeeting = async (req, res) => {
  try {
    const { id, role } = req.portalUser;
    const meetingId = parseInt(req.params.meetingId);

    if (isNaN(meetingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid meeting ID",
      });
    }

    const meeting = await prisma.meeting.findFirst({
      where: { id: meetingId, status: "ACTIVE" },
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found or inactive",
      });
    }

    if (role === "MEMBER") {
      const existing = await prisma.meetingMember.findUnique({
        where: {
          meetingId_memberId: {
            meetingId,
            memberId: id,
          },
        },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "You are already registered for this meeting",
        });
      }

      const registration = await prisma.meetingMember.create({
        data: {
          meetingId,
          memberId: id,
          paymentStatus: "PENDING",
        },
      });

      return res.status(201).json({
        success: true,
        message: "Registered for meeting successfully",
        data: registration,
      });
    }

    if (role === "VISITOR") {
      const existing = await prisma.meetingVisitor.findUnique({
        where: {
          meetingId_visitorId: {
            meetingId,
            visitorId: id,
          },
        },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "You are already registered for this meeting",
        });
      }

      const registration = await prisma.meetingVisitor.create({
        data: {
          meetingId,
          visitorId: id,
          paymentStatus: "PENDING",
        },
      });

      return res.status(201).json({
        success: true,
        message: "Registered for meeting successfully",
        data: registration,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid portal role",
    });
  } catch (error) {
    console.error("PORTAL REGISTER MEETING ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Submit Payment for Meeting (Screenshot and/or UTR)
export const submitPortalMeetingPayment = async (req, res) => {
  try {
    const { id, role } = req.portalUser;
    const meetingId = parseInt(req.params.meetingId);
    const { utrNumber } = req.body;

    if (isNaN(meetingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid meeting ID",
      });
    }

    let paymentScreenshot = null;
    if (req.file) {
      const uploadedFile = await uploadToCloudinary(req.file.buffer, "mcn/payments");
      paymentScreenshot = uploadedFile.secure_url;
    }

    if (!paymentScreenshot && !utrNumber) {
      return res.status(400).json({
        success: false,
        message: "Please upload a payment screenshot or provide a UTR number",
      });
    }

    if (role === "MEMBER") {
      const registration = await prisma.meetingMember.findUnique({
        where: {
          meetingId_memberId: {
            meetingId,
            memberId: id,
          },
        },
      });

      if (!registration) {
        return res.status(404).json({
          success: false,
          message: "Registration not found. Please register for the meeting first.",
        });
      }

      const updated = await prisma.meetingMember.update({
        where: {
          meetingId_memberId: {
            meetingId,
            memberId: id,
          },
        },
        data: {
          paymentScreenshot: paymentScreenshot || undefined,
          utrNumber: utrNumber || undefined,
          paymentStatus: "SUBMITTED",
        },
      });

      return res.status(200).json({
        success: true,
        message: "Payment proof submitted successfully",
        data: updated,
      });
    }

    if (role === "VISITOR") {
      const registration = await prisma.meetingVisitor.findUnique({
        where: {
          meetingId_visitorId: {
            meetingId,
            visitorId: id,
          },
        },
      });

      if (!registration) {
        return res.status(404).json({
          success: false,
          message: "Registration not found. Please register for the meeting first.",
        });
      }

      const updated = await prisma.meetingVisitor.update({
        where: {
          meetingId_visitorId: {
            meetingId,
            visitorId: id,
          },
        },
        data: {
          paymentScreenshot: paymentScreenshot || undefined,
          utrNumber: utrNumber || undefined,
          paymentStatus: "SUBMITTED",
        },
      });

      return res.status(200).json({
        success: true,
        message: "Payment proof submitted successfully",
        data: updated,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid portal role",
    });
  } catch (error) {
    console.error("PORTAL SUBMIT PAYMENT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
