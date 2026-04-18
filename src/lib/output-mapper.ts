/**
 * Output Mapper
 * Transforms audit results and input records into audit output rows
 * Maps fields from CSV input to standardized audit output format
 */

import { AuditOutputRow } from './csv-export';

export interface ConversationRecord {
  [key: string]: string;
}

export interface AuditResult {
  recordId: string;
  sessionId?: string;
  issues: IssueFound[];
  score: number;
}

export interface IssueFound {
  type: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  recordId?: string;
}

/**
 * Map input records and audit results to standardized output format
 */
export const mapAuditToOutput = (
  records: ConversationRecord[],
  auditResults: AuditResult[]
): AuditOutputRow[] => {
  return records.map((record, index) => {
    const auditResult = auditResults[index] || {};
    const issues = auditResult.issues || [];

    // Extract and categorize issues
    const issuesByType = groupIssuesByType(issues);
    const issueCategories = Object.keys(issuesByType).join('; ');
    const issueDescriptions = issues.map(i => i.message).join('; ');

    // Determine raise type based on issues
    const raiseType = determineRaiseType(issues, auditResult.score || 0);

    // Determine resolution based on score and issue severity
    const resolution = determineResolution(auditResult.score || 0, issues);

    return {
      SessionId: record['Session ID'] || record['SessionId'] || `Session-${index + 1}`,
      Appointment_ID: record['Appointment ID'] || record['Appointment_ID'] || 'N/A',
      SessionType: record['Session Type'] || record['SessionType'] || 'Chat',
      POC: record['POC'] || record['Point of Contact'] || 'Bot',
      ChatDate: record['Chat Date'] || record['ChatDate'] || new Date().toISOString().split('T')[0],
      AuditDate: new Date().toISOString().split('T')[0],
      BotAction: record['Bot Action'] || record['BotAction'] || extractBotAction(record),
      CustomerIntent: record['Customer Intent'] || record['CustomerIntent'] || extractCustomerIntent(record),
      RaiseType: raiseType,
      TicketID: record['Ticket ID'] || record['TicketID'] || `TKT-${index + 1}`,
      TicketStatus: determineTicketStatus(auditResult.score || 0),
      IssueDescription: issueDescriptions || 'No issues found',
      IssueCategory: issueCategories || 'NONE',
      Resolution: resolution,
      CEP: record['CEP'] || calculateCEP(issues),
      CNP: record['CNP'] || calculateCNP(record),
      FirstPitch: record['First Pitch'] || record['FirstPitch'] || 'Initial greeting',
      SecondPitch: record['Second Pitch'] || record['SecondPitch'] || '',
      ThirdPitch: record['Third Pitch'] || record['ThirdPitch'] || '',
      FinalPitch: record['Final Pitch'] || record['FinalPitch'] || 'Closing statement',
    };
  });
};

/**
 * Group issues by type for categorization
 */
const groupIssuesByType = (issues: IssueFound[]): Record<string, IssueFound[]> => {
  return issues.reduce(
    (acc, issue) => {
      if (!acc[issue.type]) {
        acc[issue.type] = [];
      }
      acc[issue.type].push(issue);
      return acc;
    },
    {} as Record<string, IssueFound[]>
  );
};

/**
 * Determine raise type based on issues and audit score
 */
const determineRaiseType = (issues: IssueFound[], score: number): string => {
  const highSeverityCount = issues.filter(i => i.severity === 'high').length;
  const mediumSeverityCount = issues.filter(i => i.severity === 'medium').length;

  if (highSeverityCount > 0) {
    return 'CRITICAL';
  } else if (mediumSeverityCount > 2 || score < 50) {
    return 'MAJOR';
  } else if (mediumSeverityCount > 0 || score < 75) {
    return 'MINOR';
  }
  return 'NONE';
};

/**
 * Determine ticket status based on audit score
 */
const determineTicketStatus = (score: number): string => {
  if (score >= 90) return 'RESOLVED';
  if (score >= 75) return 'IN_PROGRESS';
  if (score >= 50) return 'PENDING';
  return 'OPEN';
};

/**
 * Determine resolution recommendation
 */
const determineResolution = (score: number, issues: IssueFound[]): string => {
  if (score >= 90) return 'Conversation meets standards - No action required';
  if (score >= 75) {
    return `Minor issues detected - Review conversation flow`;
  }
  if (score >= 50) {
    const highSevere = issues.filter(i => i.severity === 'high');
    return highSevere.length > 0
      ? 'Requires bot retraining on sensitive data handling'
      : 'Improve message clarity and response quality';
  }
  return 'Comprehensive review and retraining required';
};

/**
 * Extract bot action from conversation record
 */
const extractBotAction = (record: ConversationRecord): string => {
  const content = record['Content'] || record['CONTENT'] || record['Message'] || '';
  if (content.toLowerCase().includes('clarify') || content.toLowerCase().includes('ask')) {
    return 'Asked for clarification';
  }
  if (content.toLowerCase().includes('error') || content.toLowerCase().includes('sorry')) {
    return 'Handled error';
  }
  if (content.toLowerCase().includes('help') || content.toLowerCase().includes('assist')) {
    return 'Provided assistance';
  }
  return 'Responded to customer';
};

/**
 * Extract customer intent from conversation record
 */
const extractCustomerIntent = (record: ConversationRecord): string => {
  const content = (record['Content'] || record['CONTENT'] || record['Message'] || '').toLowerCase();
  
  if (content.includes('help') || content.includes('support')) return 'Seeking support';
  if (content.includes('complaint') || content.includes('issue') || content.includes('problem')) {
    return 'Filing complaint';
  }
  if (content.includes('question') || content.includes('how') || content.includes('why')) {
    return 'Asking question';
  }
  if (content.includes('book') || content.includes('appointment') || content.includes('schedule')) {
    return 'Schedule appointment';
  }
  if (content.includes('cancel') || content.includes('reschedule')) {
    return 'Modify appointment';
  }
  return 'General inquiry';
};

/**
 * Calculate CEP (Customer Effort Point) score
 */
const calculateCEP = (issues: IssueFound[]): string => {
  const hasComplexIssues = issues.some(i =>
    ['SENSITIVE_DATA', 'NEGATIVE_SENTIMENT'].includes(i.type)
  );
  const highSeverityCount = issues.filter(i => i.severity === 'high').length;

  if (highSeverityCount > 1) return '5'; // High effort required
  if (hasComplexIssues) return '4';
  if (issues.length > 2) return '3';
  if (issues.length > 0) return '2';
  return '1'; // Minimal effort
};

/**
 * Calculate CNP (Conversation Naturalness Point) score
 */
const calculateCNP = (record: ConversationRecord): string => {
  const content = (record['Content'] || record['CONTENT'] || record['Message'] || '').toLowerCase();
  const length = content.length;

  // Assess naturalness based on message characteristics
  if (length < 10) return '2'; // Too short
  if (length > 500) return '3'; // Verbose
  if (content.includes('ERROR') || content.includes('FAIL')) return '3'; // Error messages
  if (content.includes('?') || content.includes('!')) return '5'; // Natural questions/exclamations
  return '4'; // Normal conversation
};
