import prisma from "../../config/prisma.js";
import { generateMemberCode } from "../../utils/generateMemberCode.js";

// ─────────────────────────────────────────────
// GET /api/member/lookup?phone=&email=
// Public — used by the registration form's "Fetch Details" action.
// Requires BOTH phone and email to match an existing member, so a phone
// number alone can't be used to scrape member PII.
// ─────────────────────────────────────────────
export const lookupMember = async (req, res) => {
  try {
    const { phone, email } = req.query;

    if (!phone || !email) {
      return res.status(400).json({
        success: false,
        message: "Phone and email are required",
      });
    }

    const member = await prisma.member.findFirst({
      where: {
        phone: String(phone).trim(),
        email: String(email).trim().toLowerCase(),
      },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        companyName: true,
        profession: true,
        businessCategory: true,
        website: true,
        chapterId: true,
        chapter: {
          select: { id: true, name: true, city: true },
        },
      },
    });

    if (!member) {
      return res.status(200).json({
        success: true,
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      data: member,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const createMember = async (req, res) => {
  try {
    const {
      chapterId,
      firstName,
      lastName,
      email,
      phone,
      companyName,
      profession,
      businessCategory,
      website,
    } = req.body;

    const memberCode = await generateMemberCode(
      Number(chapterId)
    );

    const member = await prisma.member.create({
      data: {
        chapterId: Number(chapterId),
        memberCode,
        firstName,
        lastName,
        email,
        phone,
        companyName,
        profession,
        businessCategory,
        website,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Member created successfully",
      data: member,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getAllMembers = async (req, res) => {
  try {
    const members = await prisma.member.findMany({
      include: {
        chapter: true,
      },
      orderBy: {
        createdAt: "desc",
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

export const getMemberById = async (req, res) => {
  try {
    const { id } = req.params;

    const member = await prisma.member.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        chapter: true,
        chapterRoles: true,
      },
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: member,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateMember = async (req, res) => {
  try {
    const { id } = req.params;

    const member = await prisma.member.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    const updatedMember = await prisma.member.update({
      where: {
        id: Number(id),
      },
      data: req.body,
    });

    return res.status(200).json({
      success: true,
      message: "Member updated successfully",
      data: updatedMember,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateMemberStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const member = await prisma.member.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    const updatedMember = await prisma.member.update({
      where: {
        id: Number(id),
      },
      data: {
        status,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Member status updated successfully",
      data: updatedMember,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ─── Hard delete member — permanently removes the row and its dependents ───
export const deleteMember = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const member = await prisma.member.findUnique({
      where: { id },
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    await prisma.$transaction([
      prisma.chapterRole.deleteMany({ where: { memberId: id } }),
      prisma.meetingMember.deleteMany({ where: { memberId: id } }),
      prisma.referral.deleteMany({
        where: { OR: [{ givenByMemberId: id }, { receivedByMemberId: id }] },
      }),
      prisma.visitor.updateMany({
        where: { referredByMemberId: id },
        data: { referredByMemberId: null },
      }),
      prisma.member.delete({ where: { id } }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Member permanently deleted",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};