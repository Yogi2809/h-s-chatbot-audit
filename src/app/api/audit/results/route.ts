import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const GET = async (request: Request) => {
  try {
    // Check if database is configured
    if (!prisma) {
      return NextResponse.json({
        success: true,
        message: 'Database not configured',
        auditRuns: [],
        warning: 'Set DATABASE_URL to enable result persistence',
      });
    }

    const { searchParams } = new URL(request.url);
    const auditRunId = searchParams.get('runId');
    const limit = searchParams.get('limit') || '50';

    if (!auditRunId) {
      // Return recent audit runs
      const auditRuns = await prisma.auditRun.findMany({
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        select: {
          id: true,
          fileName: true,
          totalRecords: true,
          processedRecords: true,
          status: true,
          averageScore: true,
          recordsWithIssues: true,
          highSeverity: true,
          mediumSeverity: true,
          lowSeverity: true,
          createdAt: true,
          completedAt: true,
        },
      });

      return NextResponse.json({
        success: true,
        auditRuns,
      });
    }

    // Get specific audit run with results
    const auditRun = await prisma.auditRun.findUnique({
      where: { id: auditRunId },
    });

    if (!auditRun) {
      return NextResponse.json(
        { error: 'Audit run not found' },
        { status: 404 }
      );
    }

    // Get conversations and their audit results
    const conversations = await prisma.conversation.findMany({
      where: {
        auditResults: {
          some: {}, // Has audit results
        },
      },
      include: {
        auditResults: true,
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
    });

    return NextResponse.json({
      success: true,
      auditRun,
      conversations,
    });
  } catch (error) {
    console.error('Error retrieving audit results:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve audit results: ' + String(error) },
      { status: 500 }
    );
  }
};
