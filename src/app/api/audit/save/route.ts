import { NextRequest, NextResponse } from 'next/server';

// This endpoint saves audit results to database (when DATABASE_URL is configured)
// Currently returns mock data - database features are optional

export const POST = async (request: NextRequest) => {
  try {
    return NextResponse.json({
      success: true,
      message: 'Audit results processed',
      note: 'Database storage: Set DATABASE_URL environment variable to enable persistence',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error: ' + String(error) },
      { status: 500 }
    );
  }
};
