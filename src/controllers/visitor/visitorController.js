import prisma from "../../config/prisma.js";

export const createVisitor = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      companyName,
      profession,
      businessCategory,
      source,
      referredByMemberId,
      notes,
    } = req.body;

    const existingVisitor = await prisma.visitor.findUnique({
      where: {
        phone,
      },
    });

    if (existingVisitor) {
      return res.status(400).json({
        success: false,
        message: "Visitor already exists with this phone number",
      });
    }

    if (referredByMemberId) {
      const member = await prisma.member.findUnique({
        where: {
          id: Number(referredByMemberId),
        },
      });

      if (!member) {
        return res.status(404).json({
          success: false,
          message: "Referring member not found",
        });
      }
    }

    const visitor = await prisma.visitor.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        companyName,
        profession,
        businessCategory,
        source: source || "ADMIN",
        status: "LEAD",
        referredByMemberId: referredByMemberId
          ? Number(referredByMemberId)
          : null,
        notes,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Visitor created successfully",
      data: visitor,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getAllVisitors = async (req, res) => {
  try {
    const visitors = await prisma.visitor.findMany({
      include: {
        referredByMember: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: visitors.length,
      data: visitors,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getVisitorById = async (req, res) => {
  try {
    const { id } = req.params;

    const visitor = await prisma.visitor.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        referredByMember: true,
      },
    });

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: visitor,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateVisitor = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      firstName,
      lastName,
      email,
      phone,
      companyName,
      profession,
      businessCategory,
      notes,
    } = req.body;

    const visitor = await prisma.visitor.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found",
      });
    }

    const updatedVisitor = await prisma.visitor.update({
      where: {
        id: Number(id),
      },
      data: {
        firstName,
        lastName,
        email,
        phone,
        companyName,
        profession,
        businessCategory,
        notes,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Visitor updated successfully",
      data: updatedVisitor,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const deleteVisitor = async (req, res) => {
  try {
    const { id } = req.params;

    const visitor = await prisma.visitor.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found",
      });
    }

    await prisma.visitor.delete({
      where: {
        id: Number(id),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Visitor deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const convertVisitorToMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { chapterId } = req.body;

    const visitor = await prisma.visitor.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found",
      });
    }

    if (visitor.status === "CONVERTED") {
      return res.status(400).json({
        success: false,
        message: "Visitor already converted",
      });
    }

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

    const latestMember = await prisma.member.findFirst({
      where: {
        chapterId: Number(chapterId),
      },
      orderBy: {
        id: "desc",
      },
    });

    let nextNumber = 1;

    if (latestMember?.memberCode) {
      const parts = latestMember.memberCode.split("-");
      nextNumber = Number(parts[2]) + 1;
    }

    const cityCode = chapter.city
      .toUpperCase()
      .replace(/\s+/g, "");

    const memberCode = `MCN-${cityCode}-${String(
      nextNumber
    ).padStart(4, "0")}`;

    const member = await prisma.member.create({
      data: {
        chapterId: Number(chapterId),

        memberCode,

        firstName: visitor.firstName,

        lastName: visitor.lastName || "",

        email:
          visitor.email ||
          `${Date.now()}@mcn.local`,

        phone: visitor.phone,

        companyName:
          visitor.companyName || "",

        profession:
          visitor.profession || "",

        businessCategory:
          visitor.businessCategory || "",

        status: "ACTIVE",
      },
    });

    await prisma.visitor.update({
      where: {
        id: Number(id),
      },
      data: {
        status: "CONVERTED",
      },
    });

    return res.status(201).json({
      success: true,
      message:
        "Visitor converted successfully",
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