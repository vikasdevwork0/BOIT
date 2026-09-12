# Multi-Document Intelligence Workbench

## Overview

The **Multi-Document Intelligence Workbench** is a specialized full-stack AI web application built for the banking and commercial finance domain. It enables credit analysts, underwriters, and compliance officers to upload heterogeneous financial documents (PDF loan agreements, CSV audited financial statements, TXT corporate registrations, and transaction logs), automatically extract grounded facts, and conduct multi-document AI discrepancy analysis.

---

## Architecture

The system uses a pipeline architecture that preserves document boundaries throughout the analysis lifecycle:

```
React (Frontend)
    ↓
Node.js / Express (API Server)
    ↓
Document Processing Pipeline (PDF / CSV / TXT Processors)
    ↓
SQLite / Prisma (Relational Storage)
    ↓
Pass 1: Document-Level Fact Extraction (Per Document)
    ↓
Pass 2: Structured AI Analysis (Cross-Document Synthesis)
    ↓
Provenance-Aware Structured Results (Facts vs AI Interpretations)
```

**Document Boundary Principle**: Documents are treated as separate, distinct sources of truth. They are **never blindly concatenated into one unstructured LLM prompt**. Each document is first processed individually to extract document-level facts before a second cross-document synthesis pass correlates findings across sources while maintaining exact page, line, and row provenance.

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Vanilla CSS Design System
- **Backend**: Node.js, Express, TypeScript, Zod Validation, Multer Security
- **Database**: SQLite, Prisma ORM
- **Document Processing**: `pdf-parse` (PDF), `csv-parse` (CSV), UTF-8 text parser (TXT), Chunker Engine
- **AI / LLM Engine**: OpenAI API (`gpt-4o-mini`), Deterministic Fallback Engine

---

## Features Completed

- **Multi-Document Upload**: Upload multiple files in a single request.
- **Multi-Format Support**: Native parsing for PDF, TXT, and CSV documents.
- **Document Extraction**: Automated page, row, and line text extraction with metadata tagging.
- **User-Defined Prompts**: Customizable analysis prompt with preset banking domain options.
- **Document-Level Analysis**: First-pass fact extraction maintaining document boundaries.
- **Cross-Document Analysis**: Second-pass synthesis correlating information across documents.
- **Structured Findings**: Typed JSON output mapping type, title, description, severity, and value.
- **Discrepancy Detection**: Automated identification of conflicting metrics (e.g. debt ratios, addresses, revenue).
- **Missing Information Detection**: Highlights missing regulatory filings or director register mismatches.
- **Source Attribution & Provenance**: Links every finding to exact source document IDs, names, and page/row numbers.
- **Fact vs. Interpretation Categorization**: Explicitly tags `isAiInterpretation: false` (Extracted Fact) vs `isAiInterpretation: true` (AI Deduction).
- **Copy Results**: One-click clipboard export using `navigator.clipboard`.
- **Validation & Security**: File size limits (10MB), MIME filtering, safe UUID filenames, path traversal protection, prompt injection defenses.
- **Standardized Error Handling**: Uniform JSON error responses (`INVALID_DOCUMENT`, `VALIDATION_ERROR`, `NOT_FOUND`).
- **Automated Testing**: Vitest and Supertest integration tests.

---

## 🌟 Enterprise Highlights & Unique Features

1. **Credit Risk Index & Underwriting Meter**: Computes a real-time commercial credit risk score (e.g., `42/100 HIGH RISK`) based on financial covenant breaches and discrepancy severities.
2. **Interactive Side-by-Side Evidence Inspector**: Clicking any finding opens an interactive modal displaying side-by-side grounded document snippets with exact line/page references.
3. **Category Filter Chips**: Dynamic filtering of findings by category (`All Findings`, `Discrepancies Only`, `Missing Info`, `Extracted Facts`).
4. **Download Executive Credit Report**: One-click export of a formal formatted Markdown credit underwriting report (`Credit_Underwriting_Report.md`) for credit committee presentation.

---

## Setup Instructions

### 1. Prerequisites
- Node.js (v18 or higher)
- npm

### 2. Installation
Install dependencies for root, server, and client:

```bash
# Install all dependencies
npm run install:all

# Or install manually:
cd multi-document-intelligence-workbench/server && npm install
cd ../client && npm install
```

### 3. Environment Variables Setup
Copy `.env.example` to create local `.env` files:

```bash
cp .env.example multi-document-intelligence-workbench/server/.env
```

Edit `server/.env` to configure your port and optional OpenAI API key:
```env
PORT=5001
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY="your_openai_api_key_here"
```

### 4. Database Setup
Initialize the SQLite database schema with Prisma:

```bash
cd multi-document-intelligence-workbench/server
npm run prisma:db-push
npm run prisma:seed
```

### 5. Running the Application

**Run Backend Server** (Port 5001):
```bash
npm run dev:server
```

**Run Frontend Dashboard** (Port 5173):
```bash
npm run dev:client
```

Open **`http://localhost:5173`** in your browser.

---

## Environment Variables

| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | Backend server port | `5001` |
| `DATABASE_URL` | Prisma SQLite connection URL | `file:./dev.db` |
| `OPENAI_API_KEY` | OpenAI API Key for live AI model calls | `sk-proj-...` |

---

## Database

The database uses **Prisma ORM** with **SQLite** for rapid relational storage:

- `Document`: Stores file metadata (`originalName`, `storedName`, `mimeType`, `fileSize`, `status`, `extractedText`).
- `Analysis`: Stores prompt, status (`PENDING`, `COMPLETED`, `FAILED`), summary, and raw JSON result.
- `AnalysisDocument`: Join table linking analyses to their constituent documents.
- `Finding`: Stores individual structured findings linked to source documents with provenance details.

---

## Sample Data

The `samples/` directory contains synthetic banking-domain benchmark documents for demonstration purposes:

- `samples/loan-application.pdf`: Commercial loan application for *Acme Financial Services Ltd*.
- `samples/financial-statement.pdf`: Audited financial statement with revenue & debt ratio figures.
- `samples/company-registration.txt`: Ministry of Corporate Affairs director register.
- `samples/bank-transactions.csv`: Transaction log with credit turnover and balances.

*Note: All sample data is 100% synthetic and fictional.*

---

## Assumptions

1. **Text-based Extraction**: Standard PDF text stream extraction is used instead of heavy OCR engines.
2. **Content Bounding**: Very large documents are bounded at 50,000 characters and chunked into 2,000 character windows.
3. **AI Review**: LLM output is treated as analytical assistance and requires human review in production banking workflows.
4. **Synthetic Benchmark**: All demonstration data uses synthetic banking values.

---

## Known Limitations

- **Scanned PDFs**: Scanned image-only PDFs without text layers require an OCR service (e.g. Tesseract/AWS Textract).
- **LLM Provider Dependency**: Reasoning precision depends on the configured LLM provider and model.
- **Local SQLite Storage**: Production banking deployments should replace SQLite with PostgreSQL.
- **Production Compliance**: Enterprise deployment would require formal PII redaction and audit logging.

---

## Security Considerations

- **File Validation**: Validates file MIME types (`application/pdf`, `text/plain`, `text/csv`) and extensions.
- **Size Limits**: Enforces a 10MB maximum file size limit per document.
- **Safe Filenames**: Server generates UUID filenames (`crypto.randomUUID()`) to prevent filesystem collisions.
- **Path Traversal Protection**: Uses `path.basename` to prevent relative directory traversal attacks.
- **Prompt Injection Defense**: Document text is wrapped in `<untrusted_document_content>` tags and system prompts instruct the LLM to ignore embedded commands.
- **Data Privacy**: Secrets (`.env`) are gitignored and no real customer data is included.

---

## Productionisation

In an enterprise banking environment, this architecture would evolve as follows:

```
React (Web Dashboard)
  → API Gateway (TLS, WAF, OAuth2 / OIDC)
  → Node.js Microservices (Kubernetes / ECS)
  → Encrypted Object Storage (AWS S3 / Azure Blob)
  → Queue / Event Processing (Kafka / AWS SQS)
  → Document Extraction & OCR Service (AWS Textract / Unstructured.io)
  → Embeddings & Vector Database (pgvector / Pinecone)
  → LLM Service / Guardrails Engine
  → PostgreSQL Database (Multi-Region / Highly Available)
  → Observability & Audit Logging (Datadog / OpenTelemetry)
```

**Key Enterprise Enhancements**:
- Authentication & RBAC (Role-Based Access Control)
- Data Encryption at Rest (AES-256) and in Transit (TLS 1.3)
- Automated PII Detection and Masking (SSN, PAN, Account Numbers)
- Model Drift Evaluation and Version Management
- Human-in-the-loop (HITL) review workflows for high-risk credit decisions

---

## AI Development Tools Used

AI-assisted development tools (Antigravity AI Agent) were used to accelerate boilerplate code generation, component styling, and test setup.

### Personally Made Architectural Decisions

As the candidate, I personally made the following core architectural decisions:

1. **Maintained Strict Document Boundaries**: Designed the pipeline to process documents separately before cross-document analysis, avoiding noisy mega-prompts.
2. **Implemented Two-Pass Extraction Architecture**: Enforced document-level fact extraction before collective cross-document synthesis.
3. **Preserved Source Provenance**: Mandated exact source document ID and page/row attribution on every generated finding.
4. **Separated Facts from Interpretations**: Created explicit metadata (`isAiInterpretation: false` vs `true`) so users can distinguish verified facts from model deductions.
5. **Enforced Structured JSON Contracts**: Designed strict JSON schemas for LLM outputs instead of free-form text.
6. **Selected SQLite + Prisma**: Chose lightweight relational persistence for rapid setup and deterministic testing.
7. **Implemented Banking-Grade Security & Validation**: Added strict path sanitization, file limits, and prompt injection defenses tailored to financial applications.

---

## Testing

Automated integration tests are built using **Vitest** and **Supertest** in `server/src/tests/`:

```bash
# Run automated tests
npm test
```

**What the tests verify**:
- `documents.test.ts`: Verifies multi-file upload, MIME filtering, UUID filename generation, Prisma persistence, and rejection of unsupported file types.
- `analysis.test.ts`: Verifies multi-document analysis execution, summary generation, structured findings schema, source attribution, and `isAiInterpretation` flag mapping.