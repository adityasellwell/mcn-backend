import prisma from "../../config/prisma.js";

export const assignMemberToMeeting = async (req, res) => {
  try {
    const { meetingId, memberId } = req.body;

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

    const member = await prisma.member.findUnique({
      where: {
        id: Number(memberId),
      },
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    const existingAssignment = await prisma.meetingMember.findFirst({
      where: {
        meetingId: Number(meetingId),
        memberId: Number(memberId),
      },
    });

    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: "Member already assigned to this meeting",
      });
    }

    const meetingMember = await prisma.meetingMember.create({
      data: {
        meetingId: Number(meetingId),
        memberId: Number(memberId),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Member assigned successfully",
      data: meetingMember,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getMeetingMembers = async (req, res) => {
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

    return res.status(200).json({
      success: true,
      count: members.length,
      data: members,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const removeMemberFromMeeting = async (req, res) => {
  try {
    const { id } = req.params;

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

    await prisma.meetingMember.delete({
      where: {
        id: Number(id),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Member removed from meeting successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};