import prisma from "../../config/prisma.js";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload.js";

export const createMeeting = async (req, res) => {
  try {
    const {
      chapterId,
      title,
      description,
      meetingDate,
      startTime,
      endTime,
      address,
      meetingFee,
      agenda,
    } = req.body;

    let meetingQrUrl = null;
    if (req.file && process.env.CLOUDINARY_CLOUD_NAME) {
      const uploadedFile = await uploadToCloudinary(
        req.file.buffer,
        "meeting_qr"
      );
      meetingQrUrl = uploadedFile.secure_url;
    }

    const meeting = await prisma.meeting.create({
      data: {
        chapterId: Number(chapterId),
        title,
        description,
        meetingDate: new Date(meetingDate),
        startTime,
        endTime,
        address,
        meetingFee: meetingFee ? Number(meetingFee) : null,
        agenda,
        meetingQrUrl,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Meeting created successfully",
      data: meeting,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getAllMeetings = async (req, res) => {
  try {
    const meetings = await prisma.meeting.findMany({
      include: {
        chapter: true,
      },
      orderBy: {
        meetingDate: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: meetings.length,
      data: meetings,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getMeetingById = async (req, res) => {
  try {
    const { id } = req.params;

    const meeting = await prisma.meeting.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        chapter: true,
      },
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: meeting,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateMeeting = async (req, res) => {
  try {
    const { id } = req.params;

    const meeting = await prisma.meeting.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    const {
      chapterId,
      title,
      description,
      meetingDate,
      startTime,
      endTime,
      address,
      meetingFee,
      agenda,
      status,
    } = req.body;

    let meetingQrUrl = undefined;
    if (req.file && process.env.CLOUDINARY_CLOUD_NAME) {
      const uploadedFile = await uploadToCloudinary(
        req.file.buffer,
        "meeting_qr"
      );
      meetingQrUrl = uploadedFile.secure_url;
    }

    const updatedMeeting = await prisma.meeting.update({
      where: {
        id: Number(id),
      },
      data: {
        chapterId: chapterId !== undefined ? Number(chapterId) : undefined,
        title: title !== undefined ? title : undefined,
        description: description !== undefined ? description : undefined,
        meetingDate: meetingDate !== undefined ? new Date(meetingDate) : undefined,
        startTime: startTime !== undefined ? startTime : undefined,
        endTime: endTime !== undefined ? endTime : undefined,
        address: address !== undefined ? address : undefined,
        meetingFee: meetingFee !== undefined ? (meetingFee !== null ? Number(meetingFee) : null) : undefined,
        agenda: agenda !== undefined ? agenda : undefined,
        status: status !== undefined ? status : undefined,
        meetingQrUrl: meetingQrUrl !== undefined ? meetingQrUrl : undefined,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Meeting updated successfully",
      data: updatedMeeting,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ─── Hard delete — permanently removes the meeting and its
// registrations. Applications that referenced this meeting are kept,
// just detached (meetingId set to null), not deleted — matches the
// project-wide rule of never destroying application/member/visitor
// history as a side effect of removing something else. ───
export const deleteMeeting = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const meeting = await prisma.meeting.findUnique({
      where: { id },
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    await prisma.$transaction([
      prisma.meetingMember.deleteMany({ where: { meetingId: id } }),
      prisma.meetingVisitor.deleteMany({ where: { meetingId: id } }),
      prisma.registrationApplication.updateMany({
        where: { meetingId: id },
        data: { meetingId: null },
      }),
      prisma.meeting.delete({ where: { id } }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Meeting permanently deleted",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getUpcomingMeetingByChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;

    const meeting = await prisma.meeting.findFirst({
      where: {
        chapterId: Number(chapterId),
        status: "ACTIVE",
        meetingDate: {
          gte: new Date(),
        },
      },
      orderBy: {
        meetingDate: "asc",
      },
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "No upcoming meeting found",
      });
    }

    return res.status(200).json({
      success: true,
      data: meeting,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getWebsiteMeetings = async (req, res) => {
  try {
    const meetings = await prisma.meeting.findMany({
      where: {
        status: "ACTIVE",
      },
      include: {
        chapter: true,
        _count: {
          select: {
            meetingMembers: true,
            meetingVisitors: true,
          },
        },
      },
      orderBy: {
        meetingDate: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: meetings,
    });
  } catch (error) {
    console.error("Error in getWebsiteMeetings:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getWebsiteMeetingDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const meeting = await prisma.meeting.findFirst({
      where: {
        id: Number(id),
        status: "ACTIVE",
      },
      include: {
        chapter: true,
        _count: {
          select: {
            meetingMembers: true,
            meetingVisitors: true,
          },
        },
      },
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found or inactive",
      });
    }

    return res.status(200).json({
      success: true,
      data: meeting,
    });
  } catch (error) {
    console.error("Error in getWebsiteMeetingDetail:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};