import prisma from "../src/config/prisma.js";

async function clearAlamAnsariRegistration() {
  try {
    // Find member by name
    const members = await prisma.member.findMany({
      where: {
        OR: [
          { firstName: { contains: "Alam" } },
          { lastName: { contains: "Ansari" } },
        ],
      },
    });

    console.log("Found members:", members.map((m) => ({ id: m.id, name: `${m.firstName} ${m.lastName}`, phone: m.phone })));

    for (const member of members) {
      // Delete meetingMember rows for this member
      const deleted = await prisma.meetingMember.deleteMany({
        where: { memberId: member.id },
      });
      console.log(`Deleted ${deleted.count} meeting registration(s) for member ID ${member.id} (${member.firstName} ${member.lastName})`);
    }
  } catch (err) {
    console.error("Error clearing registration:", err);
  } finally {
    await prisma.$disconnect();
  }
}

clearAlamAnsariRegistration();
