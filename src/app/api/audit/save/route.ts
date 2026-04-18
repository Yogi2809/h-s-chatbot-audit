import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parse } from 'csv-parse/sync';

export const POST = async (request: NextRequest) => {
  try {
    // Check if database is configured
    if (!prisma) {
      return NextResponse.json(
        {
          success: true,
          message: 'Audit processed (database not configured)',
          warning: 'Results not persisted - set DATABASE_URL to enable storage',
        },
        { status: 200 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Read file as text
    const content = await file.text();

    // Parse CSV
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    if (!records || records.length === 0) {
      return NextResponse.json(
        { error: 'CSV file is empty' },
        { status: 400 }
      );
    }

    // Create audit run record
    const auditRun = await prisma.auditRun.create({
      data: {
        fileName: file.name,
        totalRecords: records.length,
        processedRecords: 0,
        failedRecords: 0,
        status: 'processing',
        averageScore: 0,
        highSeverity: 0,
        mediumSeverity: 0,
        lowSeverity: 0,
        recordsWithIssues: 0,
      },
    });

    // Process records and save to database
    const auditResults = await processAndSaveAudit(records, auditRun.id);

    // Update audit run with results
    await prisma.auditRun.update({
      where: { id: auditRun.id },
      data: {
        processedRecords: auditResults.totalProcessed,
        failedRecords: records.length - auditResults.totalProcessed,
        status: 'completed',
        completedAt: new Date(),
        averageScore: auditResults.averageScore,
        highSeverity: auditResults.highSeverity,
        mediumSeverity: auditResults.mediumSeverity,
        lowSeverity: auditResults.lowSeverity,
        recordsWithIssues: auditResults.recordsWithIssues,
      },
    });

    return NextResponse.json({
      success: true,
      auditRunId: auditRun.id,
      totalRecords: records.length,
      results: auditResults,
    });
  } catch (error) {
    console.error('Audit error:', error);
    return NextResponse.json(
      { error: 'Failed to process audit: ' + String(error) },
      { status: 500 }
    );
  }
};

interface ConversationRecord {
  [key: string]: string;
}

interface ProcessedAudit {
  totalProcessed: number;
  averageScore: number;
  highSeverity: number;
  mediumSeverity: number;
  lowSeverity: number;
  recordsWithIssues: number;
}

const processAndSaveAudit = async (
  records: ConversationRecord[],
  auditRunId: string
): Promise<ProcessedAudit> => {
  let totalProcessed = 0;
  let totalScore = 0;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;
  let recordsWithIssues = 0;

  for (const record of records) {
    try {
      // Create conversation record
      const conversation = await prisma.conversation.create({
        data: {
          sessionId: record['Session ID'] || `record-${Math.random()}`,
          appointmentId: record['Appointment ID'],
          sessionType: record['Session Type'],
          chatDate: record['Chat Date'] ? new Date(record['Chat Date']) : undefined,
          chatTime: record['Chat Time IST'],
          poc: record['POC'],
          messageType: record['MSG TYPE'],
          content: record['CONTENT'],
        },
      });

      // Analyze for issues
      const issues = analyzeContent(record['CONTENT'] || '', record['Session ID']);

      // Calculate score
      let score = 100;
      for (const issue of issues) {
        if (issue.severity === 'high') {
          score -= 30;
          highCount++;
        } else if (issue.severity === 'medium') {
          score -= 15;
          mediumCount++;
        } else {
          score -= 5;
          lowCount++;
        }
      }
      score = Math.max(0, score);
      totalScore += score;

      if (issues.length > 0) {
        recordsWithIssues++;

        // Save audit results
        for (const issue of issues) {
          await prisma.auditResult.create({
            data: {
              conversationId: conversation.id,
              issueType: issue.type,
              severity: issue.severity,
              message: issue.message,
              score,
              recordId: record['Session ID'],
            },
          });
        }
      }

      totalProcessed++;
    } catch (err) {
      console.error('Error processing record:', err);
      // Continue with next record
    }
  }

  return {
    totalProcessed,
    averageScore: Math.round(totalScore / Math.max(totalProcessed, 1)),
    highSeverity: highCount,
    mediumSeverity: mediumCount,
    lowSeverity: lowCount,
    recordsWithIssues,
  };
};

interface Issue {
  type: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
}

const analyzeContent = (content: string, recordId: string): Issue[] => {
  const issues: Issue[] = [];

  // Check for empty content
  if (!content || content.trim() === '') {
    issues.push({
      type: 'EMPTY_CONTENT',
      severity: 'medium',
      message: 'Empty message content found',
    });
  }

  // Check for excessive message length
  if (content.length > 500) {
    issues.push({
      type: 'EXCESSIVE_LENGTH',
      severity: 'low',
      message: `Message is very long (${content.length} chars)`,
    });
  }

  // Check for sensitive information
  const sensitivePatterns = [
    /\d{3}-\d{2}-\d{4}/, // SSN
    /\d{16}/, // Credit card
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
  ];

  for (const pattern of sensitivePatterns) {
    if (pattern.test(content)) {
      issues.push({
        type: 'SENSITIVE_DATA',
        severity: 'high',
        message: 'Potential sensitive information detected',
      });
      break;
    }
  }

  // Check for negative sentiment
  const negativeKeywords = ['error', 'problem', 'issue', 'failed', 'crash', 'bug'];
  const hasNegative = negativeKeywords.some(keyword =>
    content.toLowerCase().includes(keyword)
  );

  if (hasNegative) {
    issues.push({
      type: 'NEGATIVE_SENTIMENT',
      severity: 'medium',
      message: 'Message contains negative or error-related keywords',
    });
  }

  return issues;
};
