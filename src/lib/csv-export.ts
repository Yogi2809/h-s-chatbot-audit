/**
 * CSV Export Utility
 * Converts audit results to CSV format for download
 */

export interface AuditOutputRow {
  SessionId: string;
  Appointment_ID: string;
  SessionType: string;
  POC: string;
  ChatDate: string;
  AuditDate: string;
  BotAction: string;
  CustomerIntent: string;
  RaiseType: string;
  TicketID: string;
  TicketStatus: string;
  IssueDescription: string;
  IssueCategory: string;
  Resolution: string;
  CEP: string;
  CNP: string;
  FirstPitch: string;
  SecondPitch: string;
  ThirdPitch: string;
  FinalPitch: string;
}

/**
 * Convert array of objects to CSV string
 * Handles proper escaping and formatting
 */
export const convertToCSV = (data: AuditOutputRow[]): string => {
  if (!data || data.length === 0) {
    return '';
  }

  // Get headers from first row
  const headers = Object.keys(data[0]);

  // Create header row
  const headerRow = headers
    .map(header => escapeCSVField(header))
    .join(',');

  // Create data rows
  const dataRows = data
    .map(row =>
      headers
        .map(header => escapeCSVField(String(row[header as keyof AuditOutputRow] || '')))
        .join(',')
    )
    .join('\n');

  return `${headerRow}\n${dataRows}`;
};

/**
 * Escape CSV field values
 * Handles commas, quotes, and newlines
 */
const escapeCSVField = (field: string): string => {
  if (field === null || field === undefined) {
    return '';
  }

  const stringField = String(field);

  // Check if field needs quotes
  if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
    // Escape quotes by doubling them
    return `"${stringField.replace(/"/g, '""')}"`;
  }

  return stringField;
};

/**
 * Download CSV as file (client-side only)
 * Creates a blob and triggers download
 */
export const downloadCSV = (csvContent: string, filename: string = 'audit-results.csv'): void => {
  if (typeof window === 'undefined') {
    return; // Not in browser
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
