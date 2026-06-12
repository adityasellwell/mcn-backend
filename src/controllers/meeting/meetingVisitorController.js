import prisma from "../../config/prisma.js";

export const assignVisitorToMeeting = async (req, res) => {
  try {
    const { meetingId, visitorId } = req.body;

    const meeting = await prisma.meeting.findUnique({
      where: {
        id: Number(meetingId),
      },
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    const visitor = await prisma.visitor.findUnique({
      where: {
        id: Number(visitorId),
      },
    });

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found",
      });
    }

    const existingAssignment = await prisma.meetingVisitor.findFirst({
      where: {
        meetingId: Number(meetingId),
        visitorId: Number(visitorId),
      },
    });

    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: "Visitor already assigned to this meeting",
      });
    }

    const meetingVisitor = await prisma.meetingVisitor.create({
      data: {
        meetingId: Number(meetingId),
        visitorId: Number(visitorId),
      },
    });

    await prisma.visitor.update({
      where: {
        id: Number(visitorId),
      },
      data: {
        status: "INVITED",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Visitor assigned successfully",
      data: meetingVisitor,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getMeetingVisitors = async (req, res) => {
  try {
    const { meetingId } = req.params;

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
      count: visitors.length,
      data: visitors,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const removeVisitorFromMeeting = async (req, res) => {
  try {
    const { id } = req.params;

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

    await prisma.meetingVisitor.delete({
      where: {
        id: Number(id),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Visitor removed from meeting successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};