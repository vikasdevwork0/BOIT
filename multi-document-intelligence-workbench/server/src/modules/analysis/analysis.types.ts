import { z } from 'zod';

export const CreateAnalysisSchema = z.object({
  documentIds: z
    .array(z.string().min(1, 'Document ID cannot be empty'))
    .min(1, 'At least 1 document ID is required')
    .max(5, 'Maximum 5 documents allowed per analysis request'),
  prompt: z
    .string()
    .min(3, 'Prompt must be at least 3 characters long')
    .max(1000, 'Prompt exceeds maximum limit of 1000 characters'),
});

export type CreateAnalysisInput = z.infer<typeof CreateAnalysisSchema>;

export interface FindingSource {
  documentId: string;
  documentName: string;
  reference: string;
}

export interface AnalysisFindingInput {
  type: 'discrepancy' | 'fact' | 'missing_information' | 'comparison' | 'obligation';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  value?: string;
  sources: FindingSource[];
  confidence: number;
  isAiInterpretation: boolean;
}

export interface StructuredAnalysisResult {
  summary: string;
  findings: AnalysisFindingInput[];
}

export interface DocumentFacts {
  documentId: string;
  documentName: string;
  extractedFacts: string[];
  summary: string;
}
