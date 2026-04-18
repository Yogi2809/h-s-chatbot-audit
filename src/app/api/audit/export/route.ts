import { NextRequest, NextResponse } from 'next/server';
import { mapAuditToOutput, AuditResult } from '@/lib/output-mapper';
import { convertToCSV } from '@/lib/csv-export';

/**
 * POST /api/audit/export
 * Exports audit results as CSV file
 */
export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { records, auditResults, fileName } = body;

    if (!records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { error: 'No records provided' },
        { status: 400 }
      );
    }

    if (!auditResults || !Array.isArray(auditResults)) {
      return NextResponse.json(
        { error: 'No audit results provided' },
        { status: 400 }
      );
    }

    // Map audit results to output format
    const outputRows = mapAuditToOutput(records, auditResults);

    // Convert to CSV
    const csvContent = convertToCSV(outputRows);

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const exportFileName = fileName || `audit-results-${timestamp}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv;charset=utf-8',
        'Content-Disposition': `attachment; filename="${exportFileName}"`,
      },
    });
  } catch (error) {
    console.error('CSV export error:', error);
    return NextResponse.json(
      { error: 'Failed to export CSV: ' + String(error) },
      { status: 500 }
    );
  }
};
