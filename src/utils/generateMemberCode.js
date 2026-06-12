import prisma from "../config/prisma.js";

const cityCodes = {
  Mumbai: "MUM",
  Delhi: "DEL",
  Pune: "PUN",
  Surat: "SUR",
  Ahmedabad: "AMD",
};

export const generateMemberCode = async (chapterId) => {
  const chapter = await prisma.chapter.findUnique({
    where: {
      id: chapterId,
    },
  });

  const cityCode =
    cityCodes[chapter.city] ||
    chapter.city.substring(0, 3).toUpperCase();

  const count = await prisma.member.count({
    where: {
      chapterId,
    },
  });

  const nextNumber = String(count + 1).padStart(4, "0");

  return `MCN-${cityCode}-${nextNumber}`;
};