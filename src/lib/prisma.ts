// Prisma client for database operations (optional - requires DATABASE_URL)
// This is intentionally minimal and safe to prevent build issues

export const prisma: any = null;

// Prisma initialization is disabled by default
// To enable: 
// 1. Set DATABASE_URL environment variable
// 2. Run: npm run prisma:generate && npm run prisma:migrate:deploy
// 3. Uncomment the code below

/*
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient | null };

export const prisma = 
  globalForPrisma.prisma || 
  new PrismaClient({ 
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
*/

