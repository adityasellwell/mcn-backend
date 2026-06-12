import prisma from "../../config/prisma.js";

export const markMemberAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { attendanceStatus } = req.body;

    const meetingMember = await prisma.meetingMember.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!meetingMember) {
      return res.status(404).json({
        success: false,
        message: "Meeting member not found",
      });
    }

    const updatedAttendance = await prisma.meetingMember.update({
      where: {
        id: Number(id),
      },
      data: {
        attendanceStatus,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Attendance marked successfully",
      data: updatedAttendance,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const markVisitorAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { attendanceStatus } = req.body;

    const meetingVisitor = await prisma.meetingVisitor.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!meetingVisitor) {
      return res.status(404).json({
        success: false,
        message: "Meeting visitor not found",
      });
    }

    const updatedAttendance = await prisma.meetingVisitor.update({
      where: {
        id: Number(id),
      },
      data: {
        attendanceStatus,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Attendance marked successfully",
      data: updatedAttendance,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getMeetingAttendance = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const members = await prisma.meetingMember.findMany({
      where: {
        meetingId: Number(meetingId),
      },
      include: {
        member: true,
      },
    });

    const visitors = await prisma.meetingVisitor.findMany({
      where: {
        meetingId: Number(meetingId),
      },
      include: {
        visitor: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        members,
        visitors,
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