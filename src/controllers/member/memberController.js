import prisma from "../../config/prisma.js";
import { generateMemberCode } from "../../utils/generateMemberCode.js";

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

export const deleteMember = async (req, res) => {
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

    await prisma.member.update({
      where: {
        id: Number(id),
      },
      data: {
        status: "INACTIVE",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Member deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};