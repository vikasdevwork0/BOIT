import React from 'react';

export interface StagedFile {
  id: string;
  file?: File;
  name: string;
  size: number;
  type: string;
  serverDocId?: string;
  status?: string;
}

interface DocumentListProps {
  files: StagedFile[];
  onRemoveFile: (id: string) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({ files, onRemoveFile }) => {
  if (files.length === 0) {
    return null;
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getBadgeClass = (name: string): string => {
    const ext = name.toLowerCase().slice(name.lastIndexOf('.'));
    if (ext === '.pdf') return 'badge-pdf';
    if (ext === '.csv') return 'badge-csv';
    return 'badge-txt';
  };

  return (
    <div className="document-list-container">
      <div className="document-list-header">
        <span>Selected Documents ({files.length})</span>
      </div>
      <div className="document-grid">
        {files.map((file) => {
          const ext = file.name.slice(file.name.lastIndexOf('.')).toUpperCase();
          return (
            <div key={file.id} className="document-card">
              <div className="document-info">
                <span className={`doc-badge ${getBadgeClass(file.name)}`}>{ext.replace('.', '')}</span>
                <div className="doc-details">
                  <div className="doc-name" title={file.name}>
                    {file.name}
                  </div>
                  <div className="doc-meta">
                    {formatFileSize(file.size)}
                    {file.status && (
                      <span className={`status-pill status-${file.status}`}>
                        • {file.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn-remove"
                onClick={() => onRemoveFile(file.id)}
                title="Remove file"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
