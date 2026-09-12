import React from 'react';

interface AnalysisPromptProps {
  prompt: string;
  onChangePrompt: (value: string) => void;
  onRunAnalysis: () => void;
  isLoading: boolean;
  canAnalyze: boolean;
  loadingStepText?: string;
}

export const AnalysisPrompt: React.FC<AnalysisPromptProps> = ({
  prompt,
  onChangePrompt,
  onRunAnalysis,
  isLoading,
  canAnalyze,
  loadingStepText,
}) => {
  const DEFAULT_PLACEHOLDER =
    'Compare the uploaded documents and identify inconsistencies in names, addresses, financial values, dates, obligations, and missing information.';

  const presets = [
    'Compare financial covenants and identify debt ratio discrepancies.',
    'Verify borrower names, account IDs, and transaction consistency across reports.',
    'Check for missing compliance disclosures or unverified obligations.',
  ];

  return (
    <div className="prompt-section">
      <label htmlFor="analysis-prompt" className="prompt-label">
        Analysis Prompt / Instructions
      </label>
      <textarea
        id="analysis-prompt"
        className="prompt-textarea"
        rows={4}
        value={prompt}
        onChange={(e) => onChangePrompt(e.target.value)}
        placeholder={DEFAULT_PLACEHOLDER}
        disabled={isLoading}
      />

      <div className="preset-container">
        <span className="preset-label">Quick Presets:</span>
        {presets.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            className="preset-chip"
            onClick={() => onChangePrompt(preset)}
            disabled={isLoading}
          >
            {preset}
          </button>
        ))}
      </div>

      <div className="action-bar">
        <button
          type="button"
          className="btn-analyze"
          onClick={onRunAnalysis}
          disabled={!canAnalyze || isLoading}
        >
          {isLoading ? (
            <span className="spinner-text">
              <span className="spinner"></span>
              {loadingStepText || 'Processing Analysis...'}
            </span>
          ) : (
            '🔍 Analyze Documents'
          )}
        </button>
      </div>
    </div>
  );
};
