import React, { useState } from 'react';
import type { AnalysisResponse, FindingItem } from '../types/api.types.js';
import { FindingTable } from './FindingTable.js';

interface AnalysisResultsProps {
  analysis: AnalysisResponse;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analysis }) => {
  const [copied, setCopied] = useState(false);

  const findingsList: FindingItem[] =
    analysis.result?.findings || analysis.findings || [];

  const handleCopyResults = async () => {
    try {
      const formattedText = `=== MULTI-DOCUMENT INTELLIGENCE ANALYSIS REPORT ===
ID: ${analysis.id}
Date: ${new Date(analysis.createdAt).toLocaleString()}
Prompt: "${analysis.prompt}"

--- EXECUTIVE SYNTHESIS ---
${analysis.summary || analysis.result?.summary || 'No summary provided.'}

--- STRUCTURED FINDINGS (${findingsList.length}) ---
${findingsList
  .map(
    (f, idx) =>
      `[${idx + 1}] ${f.type.toUpperCase()} (${f.severity.toUpperCase()})
Title: ${f.title}
Description: ${f.description}
Value: ${f.value || 'N/A'}
Category: ${f.isAiInterpretation ? 'AI Interpretation' : 'Extracted Fact'}
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

      await navigator.clipboard.writeText(formattedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div className="results-container">
      <div className="results-header">
        <div className="results-title-group">
          <h2 className="results-title">Analysis Results</h2>
          <span className="results-badge">ID: {analysis.id.slice(0, 8)}</span>
        </div>
        <button
          type="button"
          className={`btn-copy ${copied ? 'btn-copied' : ''}`}
          onClick={handleCopyResults}
        >
          {copied ? '✓ Copied to Clipboard!' : '📋 Copy Results'}
        </button>
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
            Structured Findings & Discrepancies ({findingsList.length})
          </h3>
        </div>
        <FindingTable findings={findingsList} />
      </div>
    </div>
  );
};
