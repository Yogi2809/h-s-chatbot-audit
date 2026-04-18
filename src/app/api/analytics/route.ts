import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    // Get statistics
    const [totalConversations, totalAuditRuns, recentConversations, issueStats] =
      await Promise.all([
        // Total conversations
        prisma.conversation.count({
          where: {
            createdAt: { gte: sinceDate },
          },
        }),

        // Total audit runs
        prisma.auditRun.count({
          where: {
            createdAt: { gte: sinceDate },
          },
        }),

        // Recent conversations
        prisma.conversation.findMany({
          where: {
            createdAt: { gte: sinceDate },
          },
          select: {
            id: true,
            sessionId: true,
            messageType: true,
            createdAt: true,
            auditResults: {
              select: {
                severity: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),

        // Issue statistics
        prisma.auditResult.groupBy({
          by: ['severity'],
          where: {
            createdAt: { gte: sinceDate },
          },
          _count: {
            id: true,
          },
        }),
      ]);

    // Calculate average score
    const avgScoreResult = await prisma.auditResult.aggregate({
      where: {
        createdAt: { gte: sinceDate },
      },
      _avg: {
        score: true,
      },
    });

    // Group issues by type
    const issuesByType = await prisma.auditResult.groupBy({
      by: ['issueType'],
      where: {
        createdAt: { gte: sinceDate },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5,
    });

    const severityMap = issueStats.reduce(
      (acc, stat) => ({
        ...acc,
        [stat.severity]: stat._count.id,
      }),
      { high: 0, medium: 0, low: 0 }
    );

    return NextResponse.json({
      success: true,
      period: { days, since: sinceDate },
      summary: {
        totalConversations,
        totalAuditRuns,
        averageScore: Math.round(avgScoreResult._avg.score || 0),
        highSeverityIssues: severityMap.high,
        mediumSeverityIssues: severityMap.medium,
        lowSeverityIssues: severityMap.low,
      },
      recentConversations,
      topIssueTypes: issuesByType,
    });
  } catch (error) {
    console.error('Error retrieving analytics:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve analytics: ' + String(error) },
      { status: 500 }
    );
  }
};
