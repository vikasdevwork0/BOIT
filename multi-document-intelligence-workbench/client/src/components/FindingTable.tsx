import React from 'react';
import type { FindingItem } from '../types/api.types.js';

interface FindingTableProps {
  findings: FindingItem[];
}

export const FindingTable: React.FC<FindingTableProps> = ({ findings }) => {
  if (!findings || findings.length === 0) {
    return (
      <div className="no-findings">
        No findings or discrepancies recorded for this analysis.
      </div>
    );
  }

  const getSeverityBadgeClass = (severity: string): string => {
    const s = severity.toLowerCase();
    if (s === 'high' || s === 'critical') return 'severity-high';
    if (s === 'medium') return 'severity-medium';
    return 'severity-low';
  };

  const getTypeBadgeClass = (type: string): string => {
    const t = type.toLowerCase();
    if (t.includes('discrepancy')) return 'type-discrepancy';
    if (t.includes('fact')) return 'type-fact';
    if (t.includes('missing')) return 'type-missing';
    if (t.includes('obligation')) return 'type-obligation';
    return 'type-comparison';
  };

  return (
    <div className="table-responsive">
      <table className="findings-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Title & Description</th>
            <th>Severity</th>
            <th>Value / Metric</th>
            <th>Provenance & Sources</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          {findings.map((finding, idx) => {
            const sources = finding.sources && finding.sources.length > 0
              ? finding.sources
              : finding.sourceDocumentName
              ? [
                  {
                    documentId: finding.sourceDocumentId || '',
                    documentName: finding.sourceDocumentName,
                    reference: finding.sourceReference || 'Document Facts',
                  },
                ]
              : [];

            return (
              <tr key={finding.id || idx} className={`row-type-${finding.type.toLowerCase()}`}>
                <td className="cell-type">
                  <span className={`type-badge ${getTypeBadgeClass(finding.type)}`}>
                    {finding.type.toUpperCase()}
                  </span>
                </td>
                <td className="cell-description">
                  <div className="finding-title">{finding.title}</div>
                  <div className="finding-desc">{finding.description}</div>
                </td>
                <td className="cell-severity">
                  <span className={`severity-badge ${getSeverityBadgeClass(finding.severity)}`}>
                    {finding.severity.toUpperCase()}
                  </span>
                </td>
                <td className="cell-value font-mono">
                  {finding.value ? <span className="value-chip">{finding.value}</span> : <span className="text-muted">—</span>}
                </td>
                <td className="cell-sources">
                  {sources.length > 0 ? (
                    <div className="sources-list">
                      {sources.map((src, sIdx) => (
                        <div key={sIdx} className="source-item">
                          <span className="source-doc">📄 {src.documentName}</span>
                          <span className="source-ref">({src.reference})</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted">Multi-document synthesis</span>
                  )}
                </td>
                <td className="cell-kind">
                  {finding.isAiInterpretation ? (
                    <span className="kind-badge kind-ai" title="AI-Generated Interpretation">
                      🤖 AI Interpretation
                    </span>
                  ) : (
                    <span className="kind-badge kind-fact" title="Extracted Fact">
                      📌 Extracted Fact
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
