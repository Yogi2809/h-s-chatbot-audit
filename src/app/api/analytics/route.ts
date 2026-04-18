import { NextResponse } from 'next/server';

// This endpoint returns analytics and statistics
// Currently returns mock data - enable by setting DATABASE_URL

export const GET = async (request: Request) => {
  try {
    return NextResponse.json({
      success: true,
      message: 'Analytics',
      summary: {
        totalConversations: 0,
        totalAuditRuns: 0,
        averageScore: 0,
        highSeverityIssues: 0,
        mediumSeverityIssues: 0,
        lowSeverityIssues: 0,
      },
      recentConversations: [],
      topIssueTypes: [],
      note: 'Database analytics: Set DATABASE_URL environment variable to enable',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error: ' + String(error) },
      { status: 500 }
    );
  }
};
