import { PrismaClient } from "@prisma/client";

// ─── Bound the connection pool so restarts/redeploys can't pile up enough
// aborted connections to trip MySQL's max_connect_errors host-block ───
const buildPooledUrl = (url) => {
  if (!url) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}connection_limit=5&pool_timeout=20`;
};

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: buildPooledUrl(process.env.DATABASE_URL),
    },
  },
});

// ─── Ensure connections are closed cleanly on shutdown instead of the
// process being killed mid-handshake, which is what accumulates the
// aborted-connection count MySQL uses to block a host ───
const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

export default prisma;