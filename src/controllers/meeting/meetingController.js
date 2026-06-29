import prisma from "../../config/prisma.js";

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

    const meeting = await prisma.meeting.create({
      data: {
        chapterId: Number(chapterId),
        title,
        description,
        meetingDate: new Date(meetingDate),
        startTime,
        endTime,
        address,
        meetingFee,
        agenda,
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

export const deleteMeeting = async (req, res) => {
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

    await prisma.meeting.update({
      where: {
        id: Number(id),
      },
      data: {
        status: "INACTIVE",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Meeting deleted successfully",
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