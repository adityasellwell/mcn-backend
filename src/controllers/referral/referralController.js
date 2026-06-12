import prisma from "../../config/prisma.js";

const VALID_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "CLOSED",
  "REJECTED",
];

export const createReferral = async (req, res) => {
  try {
    const {
      givenByMemberId,
      receivedByMemberId,
      title,
      description,
      referralValue,
    } = req.body;

    if (
      !givenByMemberId ||
      !receivedByMemberId ||
      !title
    ) {
      return res.status(400).json({
        success: false,
        message:
          "givenByMemberId, receivedByMemberId and title are required",
      });
    }

    if (
      Number(givenByMemberId) ===
      Number(receivedByMemberId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Member cannot refer himself",
      });
    }

    const givenMember = await prisma.member.findUnique({
      where: {
        id: Number(givenByMemberId),
      },
    });

    if (!givenMember) {
      return res.status(404).json({
        success: false,
        message: "Given by member not found",
      });
    }

    const receivedMember =
      await prisma.member.findUnique({
        where: {
          id: Number(receivedByMemberId),
        },
      });

    if (!receivedMember) {
      return res.status(404).json({
        success: false,
        message: "Received member not found",
      });
    }

    const referral = await prisma.referral.create({
      data: {
        givenByMemberId: Number(
          givenByMemberId
        ),
        receivedByMemberId: Number(
          receivedByMemberId
        ),
        title,
        description,
        referralValue,
      },
      include: {
        givenByMember: {
          select: {
            id: true,
            memberCode: true,
            firstName: true,
            lastName: true,
          },
        },
        receivedByMember: {
          select: {
            id: true,
            memberCode: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message:
        "Referral created successfully",
      data: referral,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Internal Server Error",
    });
  }
};

export const getAllReferrals = async (
  req,
  res
) => {
  try {
    const referrals =
      await prisma.referral.findMany({
        include: {
          givenByMember: {
            select: {
              id: true,
              memberCode: true,
              firstName: true,
              lastName: true,
            },
          },
          receivedByMember: {
            select: {
              id: true,
              memberCode: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return res.status(200).json({
      success: true,
      data: referrals,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Internal Server Error",
    });
  }
};

export const getReferralById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const referral =
      await prisma.referral.findUnique({
        where: {
          id: Number(id),
        },
        include: {
          givenByMember: {
            select: {
              id: true,
              memberCode: true,
              firstName: true,
              lastName: true,
            },
          },
          receivedByMember: {
            select: {
              id: true,
              memberCode: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

    if (!referral) {
      return res.status(404).json({
        success: false,
        message: "Referral not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: referral,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Internal Server Error",
    });
  }
};

export const updateReferral = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const referral =
      await prisma.referral.findUnique({
        where: {
          id: Number(id),
        },
      });

    if (!referral) {
      return res.status(404).json({
        success: false,
        message: "Referral not found",
      });
    }

    const {
      title,
      description,
      referralValue,
    } = req.body;

    const updatedReferral =
      await prisma.referral.update({
        where: {
          id: Number(id),
        },
        data: {
          title,
          description,
          referralValue,
        },
      });

    return res.status(200).json({
      success: true,
      message:
        "Referral updated successfully",
      data: updatedReferral,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Internal Server Error",
    });
  }
};

export const updateReferralStatus =
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (
        !VALID_STATUSES.includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid referral status",
        });
      }

      const referral =
        await prisma.referral.findUnique({
          where: {
            id: Number(id),
          },
        });

      if (!referral) {
        return res.status(404).json({
          success: false,
          message: "Referral not found",
        });
      }

      const updatedReferral =
        await prisma.referral.update({
          where: {
            id: Number(id),
          },
          data: {
            status,
          },
        });

      return res.status(200).json({
        success: true,
        message:
          "Referral status updated successfully",
        data: updatedReferral,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Internal Server Error",
      });
    }
  };

export const deleteReferral = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const referral =
      await prisma.referral.findUnique({
        where: {
          id: Number(id),
        },
      });

    if (!referral) {
      return res.status(404).json({
        success: false,
        message: "Referral not found",
      });
    }

    await prisma.referral.delete({
      where: {
        id: Number(id),
      },
    });

    return res.status(200).json({
      success: true,
      message:
        "Referral deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Internal Server Error",
    });
  }
};

export const getReferralStats = async (
  req,
  res
) => {
  try {
    const [
      totalReferrals,
      open,
      inProgress,
      closed,
      rejected,
    ] = await Promise.all([
      prisma.referral.count(),

      prisma.referral.count({
        where: {
          status: "OPEN",
        },
      }),

      prisma.referral.count({
        where: {
          status: "IN_PROGRESS",
        },
      }),

      prisma.referral.count({
        where: {
          status: "CLOSED",
        },
      }),

      prisma.referral.count({
        where: {
          status: "REJECTED",
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalReferrals,
        open,
        inProgress,
        closed,
        rejected,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Internal Server Error",
    });
  }
};