import { DocumentFacts } from './analysis.types.js';

export class PromptBuilder {
  static getDocumentFactExtractionSystemPrompt(): string {
    return `You are a specialized Banking & Commercial Financial Document Analyzer.
Your task is to analyze a SINGLE financial/banking document and extract factual key data points, figures, terms, covenants, and dates.

RULES:
1. Extract ONLY facts explicitly stated in the provided text.
2. Never extrapolate, guess, or invent details not present in the document.
3. Keep facts grounded with page or row references where present.
4. Output JSON with fields "summary" (string) and "facts" (array of strings).`;
  }

  static buildDocumentFactPrompt(docName: string, text: string): string {
    const safeText = text.slice(0, 8000);
    return `Document Name: "${docName}"
Document Content:
"""
${safeText}
"""

Extract document-level summary and factual data points as JSON:
{
  "summary": "Short 1-2 sentence summary of this document",
  "facts": ["Fact 1 (with reference if present)", "Fact 2..."]
}`;
  }

  static getCrossDocumentAnalysisSystemPrompt(): string {
    return `You are an expert AI Banking Risk & Compliance Analyst.
Your task is to conduct a multi-document intelligence analysis across provided document-level facts to answer the user's prompt, identify discrepancies, compare metrics, highlight obligations, and discover missing information.

CRITICAL CONSTRAINTS:
1. FACTUAL GROUNDING: Rely strictly on the provided document facts. Do NOT invent sources or details.
2. SOURCE ATTRIBUTION: Every finding MUST include a valid "sources" array referencing the documentId, documentName, and reference.
3. FACT vs INTERPRETATION DISTINCTION:
   - Mark "isAiInterpretation": false for direct factual extractions.
   - Mark "isAiInterpretation": true for AI comparisons, risk evaluations, or discrepancy deductions.
4. DISCREPANCY DETECTION: Actively check for conflicting figures, dates, ratios, or names between documents.
5. REQUIRED JSON FORMAT: You MUST return a JSON object exactly matching this schema:

{
  "summary": "Overall synthesis answering the prompt",
  "findings": [
    {
      "type": "discrepancy" | "fact" | "missing_information" | "comparison" | "obligation",
      "title": "Short descriptive title",
      "description": "Detailed explanation of the finding",
      "severity": "low" | "medium" | "high",
      "value": "Optional quantitative figure or state e.g. '$500,000' or '0.48 ratio'",
      "sources": [
        {
          "documentId": "ID",
          "documentName": "Name",
          "reference": "Page/Row/Section reference"
        }
      ],
      "confidence": 0.95,
      "isAiInterpretation": true
    }
  ]
}`;
  }

  static buildCrossDocumentAnalysisPrompt(
    userPrompt: string,
    docFacts: DocumentFacts[]
  ): string {
    const formattedDocFacts = docFacts
      .map(
        (df) => `=== DOCUMENT ID: ${df.documentId} | NAME: "${df.documentName}" ===
Summary: ${df.summary}
Extracted Facts:
${df.extractedFacts.map((f, i) => `  ${i + 1}. ${f}`).join('\n')}`
      )
      .join('\n\n');

    return `USER ANALYSIS REQUEST: "${userPrompt}"

PROVIDED DOCUMENT-LEVEL FACTS:
${formattedDocFacts}

Analyze the above document facts and generate structured JSON findings with source attributions and discrepancy checks.`;
  }
}
