import { PrismaClient } from '@prisma/client';
import { LlmService } from './llm.service.js';
import { CreateAnalysisInput, DocumentFacts, StructuredAnalysisResult } from './analysis.types.js';

const prisma = new PrismaClient();

export class AnalysisService {
  static async runAnalysis(input: CreateAnalysisInput) {
    const { documentIds, prompt } = input;

    // Fetch matching documents
    const documents = await prisma.document.findMany({
      where: { id: { in: documentIds } },
    });

    if (documents.length === 0) {
      throw new Error('None of the specified document IDs were found.');
    }

    // Initial DB record: PENDING
    const analysisRecord = await prisma.analysis.create({
      data: {
        prompt,
        status: 'PENDING',
        documents: {
          create: documents.map((doc) => ({ documentId: doc.id })),
        },
      },
    });

    try {
      // Step 1: Document-level Fact Extraction Pass
      const docFactsList: DocumentFacts[] = [];
      for (const doc of documents) {
        const textToAnalyze = doc.extractedText || `${doc.originalName} (empty text)`;
        const facts = await LlmService.extractDocumentFacts(doc.id, doc.originalName, textToAnalyze);
        docFactsList.push(facts);
      }

      // Step 2: Cross-document Analysis Pass
      const analysisResult: StructuredAnalysisResult = await LlmService.analyzeCrossDocumentFacts(
        prompt,
        docFactsList
      );

      // Save Findings to DB
      for (const finding of analysisResult.findings) {
        const primarySource = finding.sources && finding.sources.length > 0 ? finding.sources[0] : null;

        // Ensure valid source document ID from requested docs
        const matchedDoc = documents.find((d) => d.id === primarySource?.documentId || d.originalName === primarySource?.documentName);
        const validSourceDocId = matchedDoc ? matchedDoc.id : (documents[0] ? documents[0].id : null);

        await prisma.finding.create({
          data: {
            analysisId: analysisRecord.id,
            type: finding.type.toUpperCase(),
            title: finding.title,
            description: finding.description,
            severity: finding.severity.toUpperCase(),
            value: finding.value || null,
            sourceDocumentId: validSourceDocId,
            sourceReference: primarySource ? primarySource.reference : 'Document Facts',
            confidence: finding.confidence ?? 0.95,
            isAiInterpretation: Boolean(finding.isAiInterpretation),
          },
        });
      }

      // Update Analysis: COMPLETED
      const updatedAnalysis = await prisma.analysis.update({
        where: { id: analysisRecord.id },
        data: {
          status: 'COMPLETED',
          summary: analysisResult.summary,
          rawResult: JSON.stringify(analysisResult),
        },
      });

      return {
        id: updatedAnalysis.id,
        prompt: updatedAnalysis.prompt,
        status: updatedAnalysis.status,
        summary: updatedAnalysis.summary,
        result: analysisResult,
        createdAt: updatedAnalysis.createdAt,
      };
    } catch (err: any) {
      await prisma.analysis.update({
        where: { id: analysisRecord.id },
        data: {
          status: 'FAILED',
          summary: `Analysis failed: ${err.message}`,
        },
      });
      throw err;
    }
  }

  static async getAnalysisById(id: string) {
    const analysis = await prisma.analysis.findUnique({
      where: { id },
      include: {
        documents: {
          include: {
            document: {
              select: {
                id: true,
                originalName: true,
                mimeType: true,
                fileSize: true,
                status: true,
              },
            },
          },
        },
        findings: {
          include: {
            sourceDocument: {
              select: {
                id: true,
                originalName: true,
              },
            },
          },
        },
      },
    });

    if (!analysis) {
      return null;
    }

    let parsedResult: StructuredAnalysisResult | null = null;
    if (analysis.rawResult) {
      try {
        parsedResult = JSON.parse(analysis.rawResult);
      } catch (e) {
        parsedResult = null;
      }
    }

    return {
      id: analysis.id,
      prompt: analysis.prompt,
      status: analysis.status,
      summary: analysis.summary,
      result: parsedResult,
      documents: analysis.documents.map((ad) => ad.document),
      findings: analysis.findings.map((f) => ({
        id: f.id,
        type: f.type,
        title: f.title,
        description: f.description,
        severity: f.severity,
        value: f.value,
        sourceDocumentId: f.sourceDocumentId,
        sourceDocumentName: f.sourceDocument ? f.sourceDocument.originalName : null,
        sourceReference: f.sourceReference,
        confidence: f.confidence,
        isAiInterpretation: f.isAiInterpretation,
        createdAt: f.createdAt,
      })),
      createdAt: analysis.createdAt,
    };
  }

  static async listAnalyses() {
    return prisma.analysis.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        prompt: true,
        status: true,
        summary: true,
        createdAt: true,
      },
    });
  }
}
