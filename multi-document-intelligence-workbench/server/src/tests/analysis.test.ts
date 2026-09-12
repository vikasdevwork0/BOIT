import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

describe('AI Analysis Engine & Contract Tests', () => {
  beforeEach(() => {
    // Ensure deterministic mock engine is used for tests without live OpenAI network calls
    process.env.OPENAI_API_KEY = '';
  });

  it('should run multi-document analysis and return structured result with source attribution', async () => {
    // 1. Upload 2 synthetic documents to obtain IDs
    const uploadRes = await request(app)
      .post('/api/documents/upload')
      .attach('files', Buffer.from('Account_ID,Metric,Debt_Ratio\nACC-4091,Ratio,0.48'), 'test_report.csv')
      .attach('files', Buffer.from('Loan Covenant Agreement: Borrower ACC-4091 max Debt Ratio limit is 0.40.'), 'test_covenant.txt');

    expect(uploadRes.status).toBe(200);
    expect(uploadRes.body.documents.length).toBe(2);

    const docIds = uploadRes.body.documents.map((d: any) => d.id);

    // 2. Trigger analysis POST /api/analysis
    const analysisRes = await request(app)
      .post('/api/analysis')
      .send({
        documentIds: docIds,
        prompt: 'Compare financial covenant ratios and identify discrepancies across documents.',
      });

    expect([200, 201]).toContain(analysisRes.status);
    expect(analysisRes.body).toHaveProperty('id');
    expect(analysisRes.body.status).toBe('COMPLETED');
    expect(analysisRes.body).toHaveProperty('summary');
    expect(typeof analysisRes.body.summary).toBe('string');

    // 3. Verify structured findings
    expect(analysisRes.body).toHaveProperty('result');
    const result = analysisRes.body.result;
    expect(result).toHaveProperty('findings');
    expect(Array.isArray(result.findings)).toBe(true);
    expect(result.findings.length).toBeGreaterThan(0);

    // 4. Verify distinction between extracted facts vs AI interpretation
    const factFinding = result.findings.find((f: any) => f.isAiInterpretation === false);
    const aiFinding = result.findings.find((f: any) => f.isAiInterpretation === true);

    expect(factFinding).toBeDefined();
    expect(aiFinding).toBeDefined();

    // 5. Verify source document IDs attribution
    result.findings.forEach((finding: any) => {
      expect(finding).toHaveProperty('sources');
      expect(Array.isArray(finding.sources)).toBe(true);
      if (finding.sources.length > 0) {
        expect(docIds).toContain(finding.sources[0].documentId);
      }
    });

    // 6. Verify GET /api/analysis/:id
    const getRes = await request(app).get(`/api/analysis/${analysisRes.body.id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.id).toBe(analysisRes.body.id);
    expect(getRes.body.findings.length).toBeGreaterThan(0);
  });
});
