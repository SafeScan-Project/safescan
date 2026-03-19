import { PrismaClient } from '@prisma/client';

// Prevent multiple Prisma instances in dev
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

const datasourceUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
    datasources: {
      db: { url: datasourceUrl },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
