import React from 'react';
import type { Finding } from '../types/api.types.js';

interface EvidenceInspectorModalProps {
  finding: Finding | null;
  onClose: () => void;
}

export const EvidenceInspectorModal: React.FC<EvidenceInspectorModalProps> = ({
  finding,
  onClose,
}) => {
  if (!finding) return null;

  const isHigh = finding.severity === 'HIGH';
  const isMedium = finding.severity === 'MEDIUM';

  const severityBadgeClass = isHigh
    ? 'badge-severity-high'
    : isMedium
    ? 'badge-severity-medium'
    : 'badge-severity-low';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className={`badge ${severityBadgeClass}`}>
              {finding.severity || 'LOW'} SEVERITY
            </span>
            <h3 className="modal-title">{finding.title}</h3>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="inspector-section">
            <h4 className="inspector-label">Finding Description & Metrics</h4>
            <p className="inspector-description">{finding.description}</p>

            {finding.value && (
              <div className="inspector-metric-box">
                <span className="metric-box-label">EXTRACTED METRIC / VARIANCE:</span>
                <code className="metric-box-code">{finding.value}</code>
              </div>
            )}
          </div>

          <div className="inspector-section">
            <h4 className="inspector-label">Side-by-Side Provenance & Source Evidence</h4>
            <div className="provenance-grid">
              <div className="provenance-card">
                <div className="provenance-card-header">
                  <span className="card-header-icon">📄</span>
                  <div>
                    <div className="card-header-name">
                      {finding.sourceDocument?.originalName || 'Primary Document'}
                    </div>
                    <div className="card-header-ref">
                      {finding.pageReference || 'Header Reference'}
                    </div>
                  </div>
                </div>
                <div className="provenance-card-body">
                  <span className="evidence-badge">GROUNDED EVIDENCE</span>
                  <p className="evidence-snippet">
                    {finding.description}
                  </p>
                </div>
              </div>

              <div className="provenance-card">
                <div className="provenance-card-header">
                  <span className="card-header-icon">⚖️</span>
                  <div>
                    <div className="card-header-name">Verification Method</div>
                    <div className="card-header-ref">
                      {finding.isAiInterpretation ? 'AI Cross-Document Synthesis' : 'Direct Line Extraction'}
                    </div>
                  </div>
                </div>
                <div className="provenance-card-body">
                  <span className="evidence-badge secondary">CLASSIFICATION</span>
                  <p className="evidence-snippet">
                    {finding.isAiInterpretation
                      ? 'Deducted via cross-referencing extracted facts across multiple uploaded financial documents.'
                      : 'Extracted directly from source document stream without modification.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close Evidence Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
