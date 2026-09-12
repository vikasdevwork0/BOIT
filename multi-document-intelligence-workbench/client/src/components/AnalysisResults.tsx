import React, { useState } from 'react';
import type { AnalysisResponse, FindingItem } from '../types/api.types.js';
import { FindingTable } from './FindingTable.js';
import { EvidenceInspectorModal } from './EvidenceInspectorModal.js';

interface AnalysisResultsProps {
  analysis: AnalysisResponse;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analysis }) => {
  const [copied, setCopied] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv' | 'md'>('pdf');

  const getReportText = () => {
    return `=== MULTI-DOCUMENT INTELLIGENCE UNDERWRITING REPORT ===
ID: ${analysis.id}
Date: ${new Date(analysis.createdAt).toLocaleString()}
Domain: Banking & Commercial Underwriting
Prompt: "${analysis.prompt}"

--- CREDIT RISK ASSESSMENT SCORE ---
Risk Rating: ${riskLabel} (${riskScore}/100)
High Severity Discrepancies: ${highCount}
Medium Severity Inconsistencies: ${mediumCount}

--- EXECUTIVE SYNTHESIS ---
${analysis.summary || analysis.result?.summary || 'No summary provided.'}

--- STRUCTURED FINDINGS (${findingsList.length}) ---
${findingsList
  .map(
    (f, idx) =>
      `[${idx + 1}] ${f.type.toUpperCase()} (${f.severity.toUpperCase()})
Title: ${f.title}
Description: ${f.description}
Value / Metric: ${f.value || 'N/A'}
Classification: ${f.isAiInterpretation ? 'AI Interpretation' : 'Extracted Fact'}
Sources: ${
        f.sources && f.sources.length > 0
          ? f.sources.map((s) => `${s.documentName} (${s.reference})`).join(', ')
          : f.sourceDocumentName
          ? `${f.sourceDocumentName} (${f.sourceReference || 'N/A'})`
          : 'N/A'
      }
`
  )
  .join('\n')}
=== END OF REPORT ===
`;
  };

  const handleCopyResults = async () => {
    try {
      await navigator.clipboard.writeText(getReportText());
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleExport = () => {
    if (exportFormat === 'csv') {
      const headers = ['Type', 'Title', 'Description', 'Severity', 'Value', 'Classification', 'Sources'];
      const rows = findingsList.map((f) => {
        const sourceStr = f.sources && f.sources.length > 0
          ? f.sources.map((s) => `${s.documentName} (${s.reference})`).join('; ')
          : f.sourceDocumentName
          ? `${f.sourceDocumentName} (${f.sourceReference || 'N/A'})`
          : 'N/A';

        return [
          `"${f.type.replace(/"/g, '""')}"`,
          `"${f.title.replace(/"/g, '""')}"`,
          `"${f.description.replace(/"/g, '""')}"`,
          `"${f.severity.replace(/"/g, '""')}"`,
          `"${(f.value || '').replace(/"/g, '""')}"`,
          `"${f.isAiInterpretation ? 'AI Interpretation' : 'Extracted Fact'}"`,
          `"${sourceStr.replace(/"/g, '""')}"`,
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Credit_Underwriting_Report_${analysis.id.slice(0, 8)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (exportFormat === 'pdf') {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Credit Underwriting Report - ${analysis.id.slice(0, 8)}</title>
              <style>
                body { font-family: sans-serif; padding: 30px; color: #1e293b; line-height: 1.5; }
                h1 { color: #0f172a; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
                .score-box { background: #f8fafc; border: 1px solid #cbd5e1; padding: 15px; border-radius: 8px; margin: 20px 0; }
                .badge { font-weight: bold; padding: 4px 8px; border-radius: 4px; color: white; display: inline-block; }
                .badge-high { background: #dc2626; }
                .badge-med { background: #d97706; }
                .badge-low { background: #059669; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; font-size: 13px; }
                th { background: #f1f5f9; }
              </style>
            </head>
            <body>
              <h1>🏛️ Commercial Credit Underwriting Report</h1>
              <p><strong>Report ID:</strong> ${analysis.id}</p>
              <p><strong>Date:</strong> ${new Date(analysis.createdAt).toLocaleString()}</p>
              <p><strong>Prompt:</strong> ${analysis.prompt}</p>

              <div class="score-box">
                <h2>Credit Risk Rating: <span class="badge ${riskScore < 60 ? 'badge-high' : riskScore < 85 ? 'badge-med' : 'badge-low'}">${riskLabel} (${riskScore}/100)</span></h2>
                <p>High Severity Issues: ${highCount} | Medium Warnings: ${mediumCount}</p>
              </div>

              <h2>Executive Synthesis</h2>
              <p>${analysis.summary || analysis.result?.summary || 'Analysis complete.'}</p>

              <h2>Structured Findings (${findingsList.length})</h2>
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Title & Description</th>
                    <th>Severity</th>
                    <th>Value / Metric</th>
                    <th>Sources</th>
                  </tr>
                </thead>
                <tbody>
                  ${findingsList
                    .map(
                      (f) => `
                    <tr>
                      <td><strong>${f.type.toUpperCase()}</strong></td>
                      <td><strong>${f.title}</strong><br/>${f.description}</td>
                      <td>${f.severity.toUpperCase()}</td>
                      <td><code>${f.value || '—'}</code></td>
                      <td>${
                        f.sources && f.sources.length > 0
                          ? f.sources.map((s) => `${s.documentName} (${s.reference})`).join('<br/>')
                          : f.sourceDocumentName
                          ? `${f.sourceDocumentName} (${f.sourceReference || 'N/A'})`
                          : 'N/A'
                      }</td>
                    </tr>
                  `
                    )
                    .join('')}
                </tbody>
              </table>
              <script>
                window.onload = function() { window.print(); }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    } else {
      const reportContent = getReportText();
      const blob = new Blob([reportContent], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Credit_Underwriting_Report_${analysis.id.slice(0, 8)}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="results-container">
      <div className="results-header">
        <div className="results-title-group">
          <h2 className="results-title">Analysis & Underwriting Results</h2>
          <span className="results-badge">ID: {analysis.id.slice(0, 8)}</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(51, 65, 85, 0.8)', border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as any)}
              style={{
                background: 'transparent',
                color: '#e2e8f0',
                border: 'none',
                padding: '8px 12px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="pdf" style={{ background: '#1e293b' }}>📄 PDF Document (.pdf)</option>
              <option value="csv" style={{ background: '#1e293b' }}>📊 CSV Data (.csv)</option>
              <option value="md" style={{ background: '#1e293b' }}>📝 Text / Markdown (.md)</option>
            </select>
            <button
              type="button"
              className="btn-copy"
              onClick={handleExport}
              style={{ borderLeft: '1px solid var(--border-color)', borderRadius: '0' }}
            >
              📥 Export Report
            </button>
          </div>
          <button
            type="button"
            className={`btn-copy ${copied ? 'btn-copied' : ''}`}
            onClick={handleCopyResults}
          >
            {copied ? '✓ Copied!' : '📋 Copy Results'}
          </button>
        </div>
      </div>

      {/* Credit Risk Meter Banner */}
      <div className="risk-meter-banner">
        <div className="risk-info-group">
          <span className={`risk-badge-large ${riskBadgeClass}`}>{riskLabel}</span>
          <div>
            <div className="risk-score-title">Commercial Credit Risk Score</div>
            <div className="risk-score-subtitle">
              Calculated from {highCount} high severity discrepancies & {mediumCount} medium warnings
            </div>
          </div>
        </div>
        <div className="risk-gauge-container">
          <div className="risk-gauge-number">{riskScore} / 100</div>
          <div className="risk-gauge-bar">
            <div
              className="risk-gauge-fill"
              style={{
                width: `${riskScore}%`,
                backgroundColor: riskScore < 60 ? '#ef4444' : riskScore < 85 ? '#eab308' : '#10b981',
              }}
            />
          </div>
        </div>
      </div>

      <div className="summary-card">
        <div className="summary-label">Executive Synthesis</div>
        <div className="summary-text">
          {analysis.summary || analysis.result?.summary || 'Analysis complete.'}
        </div>
      </div>

      <div className="findings-section">
        <div className="findings-header">
          <h3 className="findings-title">
            Structured Findings ({filteredFindings.length} of {findingsList.length})
          </h3>
        </div>

        {/* Category Filter Chips */}
        <div className="filter-chips-container">
          <span className="preset-label">Filter Findings:</span>
          <button
            type="button"
            className={`filter-chip ${activeFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveFilter('ALL')}
          >
            All Findings ({findingsList.length})
          </button>
          <button
            type="button"
            className={`filter-chip ${activeFilter === 'DISCREPANCY' ? 'active' : ''}`}
            onClick={() => setActiveFilter('DISCREPANCY')}
          >
            Discrepancies Only
          </button>
          <button
            type="button"
            className={`filter-chip ${activeFilter === 'MISSING' ? 'active' : ''}`}
            onClick={() => setActiveFilter('MISSING')}
          >
            Missing Info
          </button>
          <button
            type="button"
            className={`filter-chip ${activeFilter === 'FACT' ? 'active' : ''}`}
            onClick={() => setActiveFilter('FACT')}
          >
            Extracted Facts
          </button>
        </div>

        <FindingTable
          findings={filteredFindings}
          onSelectFinding={(f) => setSelectedFinding(f)}
        />
      </div>

      <EvidenceInspectorModal
        finding={selectedFinding}
        onClose={() => setSelectedFinding(null)}
      />
    </div>
  );
};
