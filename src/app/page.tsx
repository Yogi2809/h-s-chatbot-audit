'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import ResultsDisplay from '@/components/ResultsDisplay';

interface Issue {
  type: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  recordId?: string;
}

interface AuditRecord {
  recordId: string;
  sessionId?: string;
  issues: Issue[];
  score: number;
}

interface Summary {
  totalRecords: number;
  recordsWithIssues: number;
  averageScore: number;
  highSeverityIssues: number;
  mediumSeverityIssues: number;
  lowSeverityIssues: number;
}

interface AuditResponse {
  success: boolean;
  totalRecords: number;
  results: AuditRecord[];
  summary: Summary;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [auditResults, setAuditResults] = useState<AuditResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setAuditResults(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/audit', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      const data: AuditResponse = await response.json();
      setAuditResults(data);
    } catch (err) {
      setError(String(err instanceof Error ? err.message : 'An error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">H&S Chatbot Audit System</h1>
          <p className="mt-2 text-lg text-gray-600">Audit and analyze chatbot conversations for compliance and quality</p>
        </div>

        {/* Upload Section */}
        <FileUpload onUpload={handleUpload} isLoading={isLoading} />

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-800">
              <p className="font-semibold">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {auditResults && (
          <ResultsDisplay
            summary={auditResults.summary}
            results={auditResults.results}
          />
        )}

        {/* Empty State */}
        {!auditResults && !isLoading && !error && (
          <div className="mt-8 rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="mt-4 text-lg text-gray-600">Upload a CSV file to get started</p>
            <p className="mt-2 text-sm text-gray-500">Analyze chatbot conversations for compliance, quality, and issues</p>
          </div>
        )}
      </div>
    </main>
  );
}
