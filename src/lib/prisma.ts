// Prisma client for database operations (optional - requires DATABASE_URL)
// This file is intentionally minimal to avoid build issues

export const prisma = null;

// When DATABASE_URL is set, initialize Prisma like this:
// import { PrismaClient } from '@prisma/client';
// const globalForPrisma = global as unknown as { prisma: PrismaClient | null };
// export const prisma = globalForPrisma.prisma || new PrismaClient({ log: ['error'] });
// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

