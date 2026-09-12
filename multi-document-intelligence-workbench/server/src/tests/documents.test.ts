import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Document Upload & Processing Integration Tests', () => {
  beforeEach(() => {
    process.env.OPENAI_API_KEY = '';
  });

  it('should accept and process multiple supported documents (TXT, CSV)', async () => {
    const res = await request(app)
      .post('/api/documents/upload')
      .attach('files', Buffer.from('Account_ID,Metric,Value\nACC-101,Revenue,500000'), 'doc_test_financials.csv')
      .attach('files', Buffer.from('Synthetic Audit Note: Liquidity ratio verified at 1.5.'), 'doc_test_notes.txt');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('documents');
    expect(Array.isArray(res.body.documents)).toBe(true);
    expect(res.body.documents.length).toBe(2);

    const docIds = res.body.documents.map((d: any) => d.id);

    res.body.documents.forEach((doc: any) => {
      expect(doc).toHaveProperty('id');
      expect(typeof doc.id).toBe('string');
      expect(doc.id.length).toBeGreaterThan(0);
      expect(doc.status).toBe('processed');
      expect(doc).toHaveProperty('originalName');
    });

    // Cleanup test docs
    for (const id of docIds) {
      await prisma.finding.deleteMany({ where: { sourceDocumentId: id } });
      await prisma.analysisDocument.deleteMany({ where: { documentId: id } });
      await prisma.document.delete({ where: { id } }).catch(() => {});
    }
  });

  it('should reject unsupported file types with structured error', async () => {
    const res = await request(app)
      .post('/api/documents/upload')
      .attach('files', Buffer.from('binary data'), 'malicious_executable.exe');

    expect(res.status).toBe(200);
    expect(res.body.documents.length).toBe(0);
    expect(res.body.errors.length).toBe(1);
    expect(res.body.errors[0].originalName).toBe('malicious_executable.exe');
    expect(res.body.errors[0].message).toContain('Unsupported file type');
  });

  it('should list uploaded documents via GET /api/documents', async () => {
    const res = await request(app).get('/api/documents');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
