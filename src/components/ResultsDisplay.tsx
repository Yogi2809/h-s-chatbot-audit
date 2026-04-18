'use client';

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

interface ResultsDisplayProps {
  summary: Summary;
  results: AuditRecord[];
}

export default function ResultsDisplay({ summary, results }: ResultsDisplayProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <section className="mt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Audit Results</h2>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="text-sm font-medium text-gray-600">Total Records</div>
          <div className="text-3xl font-bold text-gray-900">{summary.totalRecords}</div>
        </div>

        <div className="card">
          <div className="text-sm font-medium text-gray-600">Average Score</div>
          <div className={`text-3xl font-bold ${getScoreColor(summary.averageScore)}`}>
            {summary.averageScore}%
          </div>
        </div>

        <div className="card">
          <div className="text-sm font-medium text-gray-600">Records with Issues</div>
          <div className="text-3xl font-bold text-orange-600">{summary.recordsWithIssues}</div>
        </div>

        <div className="card">
          <div className="text-sm font-medium text-gray-600">High Severity Issues</div>
          <div className="text-3xl font-bold text-red-600">{summary.highSeverityIssues}</div>
        </div>
      </div>

      {/* Issue Breakdown */}
      <div className="card mb-8">
        <h3 className="font-semibold text-lg text-gray-900 mb-4">Issue Severity Breakdown</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-700">High Severity</span>
            </div>
            <span className="font-semibold text-red-600">{summary.highSeverityIssues}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-700">Medium Severity</span>
            </div>
            <span className="font-semibold text-yellow-600">{summary.mediumSeverityIssues}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-700">Low Severity</span>
            </div>
            <span className="font-semibold text-blue-600">{summary.lowSeverityIssues}</span>
          </div>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="card">
        <h3 className="font-semibold text-lg text-gray-900 mb-4">Detailed Results</h3>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {results.map((result, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-medium text-gray-900">{result.recordId}</div>
                  {result.sessionId && (
                    <div className="text-sm text-gray-600">Session: {result.sessionId}</div>
                  )}
                </div>
                <div className={`text-lg font-bold ${getScoreColor(result.score)}`}>
                  {result.score}%
                </div>
              </div>

              {result.issues.length > 0 ? (
                <div className="space-y-2">
                  {result.issues.map((issue, issueIdx) => (
                    <div
                      key={issueIdx}
                      className={`text-sm p-2 rounded border ${getSeverityColor(issue.severity)}`}
                    >
                      <div className="font-medium">{issue.type}</div>
                      <div className="text-xs mt-1">{issue.message}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-green-600 font-medium">✓ No issues found</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
