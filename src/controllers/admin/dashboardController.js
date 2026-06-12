import prisma from "../../config/prisma.js";

export const getDashboardOverview = async (req, res) => {
  try {
    const [
      totalMembers,
      totalVisitors,
      totalChapters,
      totalMeetings,
      totalReferrals,
      pendingApplications,
      pendingMemberPayments,
      pendingVisitorPayments,
    ] = await Promise.all([
      prisma.member.count(),

      prisma.visitor.count(),

      prisma.chapter.count(),

      prisma.meeting.count(),

      prisma.referral.count(),

      prisma.registrationApplication.count(),

      prisma.meetingMember.count({
        where: {
          paymentStatus: "PENDING",
        },
      }),

      prisma.meetingVisitor.count({
        where: {
          paymentStatus: "PENDING",
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalMembers,
        totalVisitors,
        totalChapters,
        totalMeetings,
        totalReferrals,
        pendingApplications,
        pendingPayments:
          pendingMemberPayments +
          pendingVisitorPayments,
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

export const getRecentApplications = async (req, res) => {
  try {
    const applications =
      await prisma.registrationApplication.findMany({
        take: 10,
        orderBy: {
          createdAt: "desc",
        },
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

export const getUpcomingMeetings = async (req, res) => {
  try {
    const meetings = await prisma.meeting.findMany({
      where: {
        meetingDate: {
          gte: new Date(),
        },
      },
      include: {
        chapter: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
      },
      orderBy: {
        meetingDate: "asc",
      },
      take: 10,
    });

    return res.status(200).json({
      success: true,
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