import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';

export const POST = async (request: NextRequest) => {
  try {
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

    // Process records through audit engine
    const auditResults = processAudit(records);

    return NextResponse.json({
      success: true,
      totalRecords: records.length,
      results: auditResults,
      summary: generateSummary(auditResults),
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

interface IssueFound {
  type: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  recordId?: string;
}

interface AuditResult {
  recordId: string;
  sessionId?: string;
  issues: IssueFound[];
  score: number;
}

const processAudit = (records: ConversationRecord[]): AuditResult[] => {
  return records.map((record, index) => {
    const issues: IssueFound[] = [];
    const recordId = record['Session ID'] || `Record-${index + 1}`;

    // Check for empty content
    if (!record['CONTENT'] || record['CONTENT'].trim() === '') {
      issues.push({
        type: 'EMPTY_CONTENT',
        severity: 'medium',
        message: 'Empty message content found',
        recordId,
      });
    }

    // Check for excessive message length
    if (record['CONTENT'] && record['CONTENT'].length > 500) {
      issues.push({
        type: 'EXCESSIVE_LENGTH',
        severity: 'low',
        message: `Message is very long (${record['CONTENT'].length} chars)`,
        recordId,
      });
    }

    // Check for potential sensitive information
    const sensitivePatterns = [
      /\d{3}-\d{2}-\d{4}/, // SSN
      /\d{16}/, // Credit card
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
    ];

    for (const pattern of sensitivePatterns) {
      if (pattern.test(record['CONTENT'] || '')) {
        issues.push({
          type: 'SENSITIVE_DATA',
          severity: 'high',
          message: 'Potential sensitive information detected',
          recordId,
        });
        break;
      }
    }

    // Check for negative sentiment keywords
    const negativeKeywords = ['error', 'problem', 'issue', 'failed', 'crash', 'bug'];
    const content = (record['CONTENT'] || '').toLowerCase();
    const hasNegative = negativeKeywords.some(keyword => content.includes(keyword));
    
    if (hasNegative) {
      issues.push({
        type: 'NEGATIVE_SENTIMENT',
        severity: 'medium',
        message: 'Message contains negative or error-related keywords',
        recordId,
      });
    }

    // Calculate score (0-100)
    let score = 100;
    for (const issue of issues) {
      if (issue.severity === 'high') score -= 30;
      else if (issue.severity === 'medium') score -= 15;
      else score -= 5;
    }

    return {
      recordId,
      sessionId: record['Session ID'],
      issues,
      score: Math.max(0, score),
    };
  });
};

interface Summary {
  totalRecords: number;
  recordsWithIssues: number;
  averageScore: number;
  highSeverityIssues: number;
  mediumSeverityIssues: number;
  lowSeverityIssues: number;
}

const generateSummary = (results: AuditResult[]): Summary => {
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;
  let totalScore = 0;

  for (const result of results) {
    totalScore += result.score;
    for (const issue of result.issues) {
      if (issue.severity === 'high') highCount++;
      else if (issue.severity === 'medium') mediumCount++;
      else lowCount++;
    }
  }

  return {
    totalRecords: results.length,
    recordsWithIssues: results.filter(r => r.issues.length > 0).length,
    averageScore: Math.round(totalScore / results.length),
    highSeverityIssues: highCount,
    mediumSeverityIssues: mediumCount,
    lowSeverityIssues: lowCount,
  };
};
