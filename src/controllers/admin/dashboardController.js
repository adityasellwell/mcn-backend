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
    // ─── Scope to the nearest upcoming meeting so the dashboard reflects
    // what's currently being registered for, not the whole application
    // history across every past meeting ───
    const latestMeeting = await prisma.meeting.findFirst({
      where: { meetingDate: { gte: new Date() } },
      orderBy: { meetingDate: "asc" },
    });

    const applications =
      await prisma.registrationApplication.findMany({
        where: latestMeeting ? { meetingId: latestMeeting.id } : {},
        take: 10,
        orderBy: {
          createdAt: "desc",
        },
      });

    return res.status(200).json({
      success: true,
      data: applications,
      meeting: latestMeeting,
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