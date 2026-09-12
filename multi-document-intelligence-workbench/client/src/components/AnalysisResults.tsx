import React, { useState } from 'react';
import type { AnalysisResponse, FindingItem } from '../types/api.types.js';
import { FindingTable } from './FindingTable.js';
import { EvidenceInspectorModal } from './EvidenceInspectorModal.js';

interface AnalysisResultsProps {
  analysis: AnalysisResponse;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analysis }) => {
  const [copied, setCopied] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [selectedFinding, setSelectedFinding] = useState<any | null>(null);

  const findingsList: FindingItem[] =
    analysis.result?.findings || analysis.findings || [];

  // Calculate Banking Credit Risk Score
  const highCount = findingsList.filter(
    (f) => f.severity.toUpperCase() === 'HIGH' || f.severity.toUpperCase() === 'CRITICAL'
  ).length;
  const mediumCount = findingsList.filter(
    (f) => f.severity.toUpperCase() === 'MEDIUM'
  ).length;

  const riskScore = Math.max(0, 100 - highCount * 25 - mediumCount * 10);
  const riskLabel =
    riskScore < 60 ? 'HIGH RISK' : riskScore < 85 ? 'MEDIUM RISK' : 'LOW RISK';
  const riskBadgeClass =
    riskScore < 60 ? 'risk-high' : riskScore < 85 ? 'risk-medium' : 'risk-low';

  // Filter Findings
  const filteredFindings = findingsList.filter((f) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'DISCREPANCY') return f.type.toUpperCase().includes('DISCREPANCY');
    if (activeFilter === 'MISSING') return f.type.toUpperCase().includes('MISSING');
    if (activeFilter === 'FACT') return !f.isAiInterpretation;
    return true;
  });

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

  const handleDownloadReport = () => {
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
  };

  return (
    <div className="results-container">
      <div className="results-header">
        <div className="results-title-group">
          <h2 className="results-title">Analysis & Underwriting Results</h2>
          <span className="results-badge">ID: {analysis.id.slice(0, 8)}</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn-copy"
            onClick={handleDownloadReport}
          >
            📥 Download Credit Report
          </button>
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
