import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import documentRoutes from './modules/documents/document.routes.js';
import analysisRoutes from './modules/analysis/analysis.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Health endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Database connectivity check endpoint
app.get('/api/db-health', async (_req: Request, res: Response) => {
  try {
    const documentCount = await prisma.document.count();
    const analysisCount = await prisma.analysis.count();
    const findingCount = await prisma.finding.count();

    res.json({
      status: 'ok',
      database: 'connected',
      counts: {
        documents: documentCount,
        analyses: analysisCount,
        findings: findingCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: (error as Error).message,
      },
    });
  }
});

// Mount module routes
app.use('/api/documents', documentRoutes);
app.use('/api/analysis', analysisRoutes);

// Global Error Handler Middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
