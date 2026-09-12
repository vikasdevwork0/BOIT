export interface DocumentItem {
  id: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  status: string;
  extractedText?: string | null;
  createdAt?: string;
}

export interface UploadErrorItem {
  originalName: string;
  message: string;
}

export interface UploadApiResponse {
  documents: DocumentItem[];
  errors: UploadErrorItem[];
}

export interface FindingSourceItem {
  documentId: string;
  documentName: string;
  reference: string;
}

export interface FindingItem {
  id?: string;
  type: 'discrepancy' | 'fact' | 'missing_information' | 'comparison' | 'obligation' | string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | string;
  value?: string | null;
  sources?: FindingSourceItem[];
  sourceDocumentId?: string | null;
  sourceDocumentName?: string | null;
  sourceReference?: string | null;
  confidence: number;
  isAiInterpretation: boolean;
}

export interface StructuredAnalysisData {
  summary: string;
  findings: FindingItem[];
}

export interface AnalysisResponse {
  id: string;
  prompt: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | string;
  summary: string;
  result: StructuredAnalysisData | null;
  documents?: DocumentItem[];
  findings?: FindingItem[];
  createdAt: string;
}
