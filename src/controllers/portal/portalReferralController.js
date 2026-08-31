import prisma from "../../config/prisma.js";

// Get referrals (Given or Received by the logged-in Member)
export const getPortalReferrals = async (req, res) => {
  try {
    const { id } = req.portalUser;

    const referrals = await prisma.referral.findMany({
      where: {
        OR: [
          { givenByMemberId: id },
          { receivedByMemberId: id },
        ],
        isDeleted: false,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: referrals,
    });
  } catch (error) {
    console.error("PORTAL GET REFERRALS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Create a new referral (Self-Service)
export const createPortalReferral = async (req, res) => {
  try {
    const { id } = req.portalUser;
    const { receivedByMemberId, title, description, referralValue } = req.body;

    if (!receivedByMemberId || !title) {
      return res.status(400).json({
        success: false,
        message: "Receiver member and title are required",
      });
    }

    const parsedReceiverId = parseInt(receivedByMemberId);
    if (isNaN(parsedReceiverId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid receiver member ID",
      });
    }

    if (parsedReceiverId === id) {
      return res.status(400).json({
        success: false,
        message: "You cannot give a referral to yourself",
      });
    }

    // Ensure receiver exists
    const receiver = await prisma.member.findUnique({
      where: { id: parsedReceiverId },
    });

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver member not found",
      });
    }

    const referral = await prisma.referral.create({
      data: {
        givenByMemberId: id,
        receivedByMemberId: parsedReceiverId,
        title,
        description: description || null,
        referralValue: referralValue ? parseFloat(referralValue) : null,
        status: "OPEN",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Referral submitted successfully",
      data: referral,
    });
  } catch (error) {
    console.error("PORTAL CREATE REFERRAL ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Invite someone (creates a visitor row with source MEMBER)
export const invitePortalVisitor = async (req, res) => {
  try {
    const { id } = req.portalUser;
    const { firstName, lastName, phone, email, companyName, businessCategory, notes } = req.body;

    if (!firstName || !phone) {
      return res.status(400).json({
        success: false,
        message: "First name and phone number are required",
      });
    }

    const cleanPhone = phone.trim();

    // Check unique visitor phone constraint
    const existingVisitor = await prisma.visitor.findUnique({
      where: { phone: cleanPhone },
    });

    if (existingVisitor) {
      return res.status(400).json({
        success: false,
        message: "A visitor with this phone number has already been invited or registered",
      });
    }

    const visitor = await prisma.visitor.create({
      data: {
        firstName,
        lastName: lastName || null,
        phone: cleanPhone,
        email: email ? email.trim().toLowerCase() : null,
        companyName: companyName || null,
        businessCategory: businessCategory || null,
        source: "MEMBER",
        referredByMemberId: id,
        status: "LEAD",
        notes: notes || null,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Invitation recorded successfully",
      data: visitor,
    });
  } catch (error) {
    console.error("PORTAL INVITE VISITOR ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Lightweight member list for pickers
export const getPortalMembers = async (req, res) => {
  try {
    const { id } = req.portalUser;

    const members = await prisma.member.findMany({
      where: {
        status: "ACTIVE",
        id: { not: id },
      },
      select: {
        id: true,
        memberCode: true,
        firstName: true,
        lastName: true,
      },
      orderBy: {
        firstName: "asc",
      },
    });

    return res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error) {
    console.error("PORTAL GET MEMBERS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
