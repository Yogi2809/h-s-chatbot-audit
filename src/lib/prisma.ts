// Prisma client for database operations
// This is optional - database features work only when DATABASE_URL is configured

let prisma: any = null;

try {
  const { PrismaClient } = require('@prisma/client');
  
  const globalForPrisma = global as unknown as { prisma: any };

  prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
      log: ['error'],
    });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
  }
} catch (err) {
  console.warn('Prisma not available - database features disabled');
  prisma = null;
}

export { prisma };

