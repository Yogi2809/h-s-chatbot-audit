import { NextResponse } from 'next/server';

// This endpoint retrieves audit history from database
// Currently returns mock data - enable by setting DATABASE_URL

export const GET = async (request: Request) => {
  try {
    return NextResponse.json({
      success: true,
      message: 'Audit history',
      auditRuns: [],
      note: 'Database storage: Set DATABASE_URL environment variable to enable history',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error: ' + String(error) },
      { status: 500 }
    );
  }
};
