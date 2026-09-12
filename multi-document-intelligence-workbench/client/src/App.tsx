import React, { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload.js';
import { DocumentList } from './components/DocumentList.js';
import type { StagedFile } from './components/DocumentList.js';
import { AnalysisPrompt } from './components/AnalysisPrompt.js';
import { AnalysisResults } from './components/AnalysisResults.js';
import {
  uploadDocumentsApi,
  createAnalysisApi,
  getDocumentsApi,
  deleteDocumentApi,
} from './services/api.js';
import type { AnalysisResponse } from './types/api.types.js';

export const App: React.FC = () => {
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStepText, setLoadingStepText] = useState<string>('');
  const [errorAlert, setErrorAlert] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);

  useEffect(() => {
    loadExistingDocuments();
  }, []);

  const loadExistingDocuments = async () => {
    try {
      const docs = await getDocumentsApi();
      if (docs && docs.length > 0) {
        const existingStaged: StagedFile[] = docs.map((doc) => ({
          id: doc.id,
          name: doc.originalName,
          size: doc.fileSize,
          type: doc.mimeType,
          serverDocId: doc.id,
          status: doc.status,
        }));
        setStagedFiles(existingStaged);
      }
    } catch {
      // Ignore initial load error if backend server is coming up
    }
  };

  const handleFilesSelected = (newFiles: File[]) => {
    setErrorAlert(null);
    const addedStaged: StagedFile[] = newFiles.map((file) => ({
      id: `local-${Math.random().toString(36).slice(2, 9)}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending',
    }));
    setStagedFiles((prev) => [...prev, ...addedStaged]);
  };

  const handleRemoveFile = (id: string) => {
    const target = stagedFiles.find((f) => f.id === id);
    if (target && target.serverDocId) {
      deleteDocumentApi(target.serverDocId).catch(() => {});
    }
    setStagedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleRunAnalysis = async () => {
    setErrorAlert(null);

    // Validation 1: No documents selected
    if (stagedFiles.length === 0) {
      setErrorAlert('No documents selected. Please upload at least 1 PDF, TXT, or CSV document before analyzing.');
      return;
    }

    const effectivePrompt =
      prompt.trim() ||
      'Compare the uploaded documents and identify inconsistencies in names, addresses, financial values, dates, obligations, and missing information.';

    setIsLoading(true);
    setAnalysisResult(null);

    try {
      // Step A: Upload any unuploaded local files to server
      const unuploaded = stagedFiles.filter((sf) => !sf.serverDocId && sf.file);
      let readyServerDocIds: string[] = stagedFiles
        .filter((sf) => sf.serverDocId)
        .map((sf) => sf.serverDocId!);

      if (unuploaded.length > 0) {
        setLoadingStepText('Uploading documents to secure server...');
        const rawFiles = unuploaded.map((sf) => sf.file!);
        const uploadRes = await uploadDocumentsApi(rawFiles);

        if (uploadRes.errors && uploadRes.errors.length > 0) {
          const firstErr = uploadRes.errors[0];
          throw new Error(`Upload error for '${firstErr.originalName}': ${firstErr.message}`);
        }

        const newDocIds = uploadRes.documents.map((d) => d.id);
        readyServerDocIds = [...readyServerDocIds, ...newDocIds];

        setStagedFiles((prev) =>
          prev.map((sf) => {
            const uploadedMatch = uploadRes.documents.find((ud) => ud.originalName === sf.name);
            if (uploadedMatch) {
              return {
                ...sf,
                serverDocId: uploadedMatch.id,
                status: uploadedMatch.status,
              };
            }
            return sf;
          })
        );
      }

      if (readyServerDocIds.length === 0) {
        throw new Error('No valid uploaded document IDs available for analysis.');
      }

      // Step B: Trigger AI Multi-Document Analysis
      setLoadingStepText('Running AI multi-document intelligence analysis...');
      const analysisRes = await createAnalysisApi(readyServerDocIds, effectivePrompt);

      setAnalysisResult(analysisRes);
    } catch (err: any) {
      setErrorAlert(err.message || 'An error occurred during multi-document analysis.');
    } finally {
      setIsLoading(false);
      setLoadingStepText('');
    }
  };

  const canAnalyze = stagedFiles.length > 0;

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-logo">🏛️</div>
          <div>
            <h1 className="header-title">Multi-Document Intelligence Workbench</h1>
            <p className="header-subtitle">
              Banking & Commercial Intelligence • Discrepancy & Covenant Analysis Pipeline
            </p>
          </div>
        </div>
        <div className="header-actions">
          <span className="badge-banking">BANKING DOMAIN MVP</span>
        </div>
      </header>

      <main className="main-content">
        {errorAlert && (
          <div className="alert alert-danger" role="alert">
            <span className="alert-icon">⚠️</span>
            <div className="alert-body">
              <strong>Error:</strong> {errorAlert}
            </div>
            <button
              type="button"
              className="alert-close"
              onClick={() => setErrorAlert(null)}
            >
              ✕
            </button>
          </div>
        )}

        <section className="workbench-grid">
          <div className="card upload-card">
            <h2 className="card-title">1. Upload Documents</h2>
            <FileUpload
              onFilesSelected={handleFilesSelected}
              onError={(msg) => setErrorAlert(msg)}
            />
            <DocumentList files={stagedFiles} onRemoveFile={handleRemoveFile} />
          </div>

          <div className="card prompt-card">
            <h2 className="card-title">2. Analysis Instructions</h2>
            <AnalysisPrompt
              prompt={prompt}
              onChangePrompt={setPrompt}
              onRunAnalysis={handleRunAnalysis}
              isLoading={isLoading}
              canAnalyze={canAnalyze}
              loadingStepText={loadingStepText}
            />
          </div>
        </section>

        {analysisResult && (
          <section className="results-section">
            <AnalysisResults analysis={analysisResult} />
          </section>
        )}
      </main>

      <footer className="app-footer">
        Multi-Document Intelligence Workbench • Powered by React, Express, Prisma & OpenAI
      </footer>
    </div>
  );
};

export default App;
