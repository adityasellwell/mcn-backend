import prisma from "../../config/prisma.js";

export const createChapter = async (req, res) => {
  try {
    const {
      name,
      city,
      state,
      meetingDay,
      meetingTime,
      address,
    } = req.body;

    const existingChapter = await prisma.chapter.findFirst({
      where: {
        name,
      },
    });

    if (existingChapter) {
      return res.status(400).json({
        success: false,
        message: "Chapter already exists",
      });
    }

    const chapter = await prisma.chapter.create({
      data: {
        name,
        city,
        state,
        meetingDay,
        meetingTime,
        address,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Chapter created successfully",
      data: chapter,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
export const getAllChapters = async (req, res) => {
  try {
    const chapters = await prisma.chapter.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: chapters.length,
      data: chapters,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getChapterById = async (req, res) => {
  try {
    const { id } = req.params;

    const chapter = await prisma.chapter.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: chapter,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateChapter = async (req, res) => {
  try {
    const { id } = req.params;

    const chapter = await prisma.chapter.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found",
      });
    }

    const updatedChapter = await prisma.chapter.update({
      where: {
        id: Number(id),
      },
      data: req.body,
    });

    return res.status(200).json({
      success: true,
      message: "Chapter updated successfully",
      data: updatedChapter,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const deleteChapter = async (req, res) => {
  try {
    const { id } = req.params;

    const chapter = await prisma.chapter.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found",
      });
    }

    await prisma.chapter.update({
      where: {
        id: Number(id),
      },
      data: {
        status: "INACTIVE",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Chapter deactivated successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};