import prisma from "../../config/prisma.js";

export const assignRole = async (req, res) => {
  try {
    const { chapterId, memberId, role } = req.body;

    const chapter = await prisma.chapter.findUnique({
      where: {
        id: Number(chapterId),
      },
    });

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found",
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

    const existingRole = await prisma.chapterRole.findFirst({
      where: {
        chapterId: Number(chapterId),
        role,
      },
    });

    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: `${role} already assigned`,
      });
    }

    const chapterRole = await prisma.chapterRole.create({
      data: {
        chapterId: Number(chapterId),
        memberId: Number(memberId),
        role,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Role assigned successfully",
      data: chapterRole,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getAllChapterRoles = async (req, res) => {
  try {
    const roles = await prisma.chapterRole.findMany({
      include: {
        chapter: true,
        member: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: roles.length,
      data: roles,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getChapterRoles = async (req, res) => {
  try {
    const { chapterId } = req.params;

    const roles = await prisma.chapterRole.findMany({
      where: {
        chapterId: Number(chapterId),
      },
      include: {
        member: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: roles,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { memberId, role } = req.body;

    const existingRole = await prisma.chapterRole.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existingRole) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    const duplicateRole = await prisma.chapterRole.findFirst({
      where: {
        chapterId: existingRole.chapterId,
        role,
        NOT: {
          id: Number(id),
        },
      },
    });

    if (duplicateRole) {
      return res.status(400).json({
        success: false,
        message: `${role} already assigned in this chapter`,
      });
    }

    const updatedRole = await prisma.chapterRole.update({
      where: {
        id: Number(id),
      },
      data: {
        memberId: Number(memberId),
        role,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Role updated successfully",
      data: updatedRole,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const removeRole = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await prisma.chapterRole.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    await prisma.chapterRole.delete({
      where: {
        id: Number(id),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Role removed successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};