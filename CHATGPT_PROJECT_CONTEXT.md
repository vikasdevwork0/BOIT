# 🤖 CHATGPT PROJECT CONTEXT FILE
**Project**: Multi-Document Intelligence Workbench  
**Assessment**: BOIT AI Engineer Technical Assessment  
**Role Target**: AI Engineer / Senior Full-Stack AI Engineer  

---

## 🎯 INSTRUCTIONS FOR CHATGPT / CO-PILOT
> **System Instruction**: You are acting as an expert AI Engineer helping a candidate in a live technical interview for the BOIT AI Engineer position.
> Whenever the candidate asks a question or pastes an interviewer's question, answer directly in the **first person ("I built...", "I designed...", "My architectural decision was...")**. 
> Always base your answers strictly on the technical architecture, code implementation, and banking domain logic detailed in this document. Keep answers structured, confident, concise, and ready to speak aloud.

---

## 🚀 1. 60-SECOND ELEVATOR PITCH
> *"For this 60-minute technical assessment, I built the **Multi-Document Intelligence Workbench**, a specialized full-stack AI web application designed for commercial credit underwriting in the banking domain.
>
> In commercial lending, credit officers must evaluate multiple heterogeneous documents simultaneously—such as loan application forms, audited financial statements, government corporate registrations, and bank transaction CSVs. Cross-checking these manually is slow, error-prone, and lacks auditability.
>
> My application automates this using a **Two-Pass Pipeline with Document Boundaries**. It parses PDF, CSV, and TXT files, stores metadata in a Prisma SQLite database, extracts document-level facts individually, and then executes a cross-document AI synthesis pass.
>
> The result is a **Structured Credit Risk Dashboard** featuring a real-time Commercial Credit Risk Meter (e.g. 42/100 High Risk), line-level source provenance, a side-by-side evidence inspector modal, and multi-format report exports (PDF, CSV, Markdown). The entire application is built with React 19, Node.js, Express, TypeScript, Zod, Prisma, and Vitest, adhering to strict OWASP security guidelines."*

---

## 🏗️ 2. CORE ARCHITECTURE & DESIGN PHILOSOPHY

### The Golden Rule: Document Boundary Principle
> **"Documents are treated as separate, distinct sources of truth. They are NEVER blindly concatenated into one giant unstructured prompt."**

Merging multiple files into a single prompt causes context dilution, source attribution confusion, and AI hallucinations. 

### Two-Pass Execution Pipeline:
```
React 19 Dashboard (TypeScript + Vite)
       │  (HTTP / REST API)
       ▼
Express API Server (Node.js + TypeScript + Zod Validation)
       │
       ▼
Modular Document Processing Pipeline
  ├─ PdfProcessor (pdf-parse text streams + page markers)
  ├─ CsvProcessor (csv-parse key-value row lines)
  └─ TxtProcessor (UTF-8 line reader)
       │
       ▼
Prisma ORM + SQLite Relational Database (Persists Docs & Findings)
       │
       ▼
PASS 1: Document-Level Fact Extraction (Per Document Isolation)
  Extracts grounded facts per document inside <untrusted_document_content> XML tags
       │
       ▼
PASS 2: Cross-Document Synthesis & AI Analysis
  Correlates extracted facts across documents to detect discrepancies & breaches
       │
       ▼
Structured Results with Provenance & Risk Index
  • Credit Risk Score Gauge (e.g., 42/100 HIGH RISK)
  • Extracted Facts (📌) vs. AI Deductions (🤖)
  • Interactive Side-by-Side Evidence Inspector Modal
  • Multi-Format Export (PDF, CSV, Markdown)
```

---

## 💻 3. COMPLETE TECHNOLOGY STACK

- **Frontend**: React 19, TypeScript, Vite, Vanilla CSS Design System (Dark Slate Aesthetic).
- **Backend**: Node.js, Express, TypeScript, Zod Validation, Multer Security.
- **Database**: SQLite, Prisma ORM (`schema.prisma`).
- **Parsers**: `pdf-parse` (PDF text streams), `csv-parse` (CSV row key-values), UTF-8 text parser (TXT), `chunker.util.ts` (50k character bounding).
- **AI Engine**: OpenAI API (`gpt-4o-mini`) + Deterministic Rule-Based Offline Fallback Engine.
- **Testing**: Vitest + Supertest integration test suite (4/4 passing in ~400ms).

---

## 🛠️ 4. DETAILED IMPLEMENTATION BREAKDOWN

### Frontend Components (`client/src/components/`):
1. **`App.tsx`**: Main state coordinator. Manages `stagedFiles`, `prompt`, `isLoading`, and `analysisResult`. Calls `GET /api/documents` on load. Provides single file removal (`✕`) and bulk workspace reset (`🗑️ Clear All`).
2. **`FileUpload.tsx`**: Drag-and-drop dropzone supporting PDF, TXT, CSV up to 10MB per file.
3. **`DocumentList.tsx`**: Displays file format badges (`PDF` red, `CSV` green, `TXT` blue), file sizes, status pills, and `🗑️ Clear All` button.
4. **`AnalysisPrompt.tsx`**: Textarea input with preset banking chips (*"Financial Discrepancies"*, *"Borrower Identity Check"*, *"Missing Disclosures"*).
5. **`AnalysisResults.tsx`**: Renders executive summary, **Commercial Credit Risk Meter** (score out of 100), **Category Filter Chips** (`All`, `Discrepancies`, `Missing Info`, `Facts`), **Multi-Format Export Selector** (PDF, CSV, MD), and `Copy Results` button.
6. **`FindingTable.tsx`**: Renders structured findings with severity badges, numerical variance chips, and category tags (**`📌 Extracted Fact`** vs **`🤖 AI Interpretation`**).
7. **`EvidenceInspectorModal.tsx`**: Side-by-side visual pop-up modal displaying grounded document snippets and line references when a finding row is clicked.

### Backend Routes & Services (`server/src/`):
1. **`document.routes.ts`**: Handles `POST /upload`, `GET /documents`, `GET /documents/:id`, and `DELETE /documents/:id`.
2. **`analysis.routes.ts`**: Handles `POST /analysis` and `GET /analysis/:id`.
3. **`upload.config.ts`**: Uses `multer.diskStorage` to generate safe UUID server filenames (`crypto.randomUUID()`) and `path.basename()` to block path traversal attacks.
4. **`processor.registry.ts`**: Factory pattern selecting `PdfProcessor`, `TxtProcessor`, or `CsvProcessor` based on MIME type and extension (Open-Closed Principle).
5. **`LlmService.ts` & `PromptBuilder.ts`**: Constructs two-pass XML prompts using `<untrusted_document_content>`, enforces JSON output schemas, and falls back to offline rule-based analysis if `OPENAI_API_KEY` is missing.

---

## 🔒 5. SECURITY, VALIDATION & SAFEGUARDS

* **Path Traversal Shield**: User filenames are sanitized using `path.basename()`. Storage paths use random UUIDs (`crypto.randomUUID()`).
* **File Security**: Enforces 10MB max file size limits and double-checks MIME type and file extension. Executables (`.exe`, `.sh`) are rejected instantly with HTTP 400.
* **Prompt Injection Defense**: All document content is wrapped inside `<untrusted_document_content id="..." name="...">` XML tags, explicitly instructing the model to treat document content strictly as unverified data evidence, never as system instructions.
* **Database Security**: Prisma ORM executes parameterized queries, eliminating SQL injection risks.
* **Error Masking**: Centralized error middleware (`error.middleware.ts`) hides raw stack traces and server file paths from API responses.

---

## 📁 6. SYNTHETIC BANKING BENCHMARK DATASET

The repository includes 4 synthetic sample files in `samples/` for fictional company **Acme Financial Services Ltd**:

1. **`loan-application.pdf`**: Commercial loan application claiming **INR 12.5 Cr** revenue, requesting **INR 5.0 Cr** loan, address: *25 MG Road, Mumbai*, listing 3 directors (*Vikram, Rajesh, Meera*), proposed debt covenant: **Max 2.0x**.
2. **`financial-statement.pdf`**: Audited financial statement showing audited revenue **INR 10.8 Cr** (*Discrepancy 1: ₹10.8 Cr vs ₹12.5 Cr*). Debt ₹8.5 Cr & Equity ₹3.5 Cr (*Discrepancy 2: Debt ratio is 2.43x, breaching 2.0x covenant!*).
3. **`company-registration.txt`**: Corporate register listing address *52 MG Road, Mumbai* (*Discrepancy 3: Address Mismatch*) and 2 directors (*Vikram, Rajesh*) (*Missing Info: Director Meera Patel missing from MCA record*).
4. **`bank-transactions.csv`**: Annual transaction log showing credit turnover **INR 8.2 Cr** (*Discrepancy 4: Credits far below claimed ₹12.5 Cr revenue*).

---

## ❓ 7. READY-TO-SPEAK INTERVIEW ANSWERS (FAQ)

### Q1: "Why did you build a Two-Pass Pipeline instead of passing all documents in one prompt?"
> *"Passing all documents into one single prompt causes context dilution, source confusion, and hallucinations. By using a two-pass pipeline, Pass 1 extracts grounded facts per document inside isolated XML tags (`<untrusted_document_content>`). Pass 2 then compares these structured facts across documents. This maintains strict document boundaries and guarantees exact line-level provenance."*

### Q2: "How do you protect against Prompt Injection if an uploaded file contains 'Ignore previous instructions'?"
> *"I encapsulated all extracted text within strict `<untrusted_document_content>` XML tags and instructed the system prompt to treat content within these tags purely as untrusted document data, never as system commands. This decouples user data from system execution."*

### Q3: "How do you distinguish raw extracted facts from AI deductions?"
> *"My database schema includes an `isAiInterpretation` boolean flag. In the UI, verbatim data extracted directly from documents is rendered with a green **`📌 Extracted Fact`** badge, whereas model-synthesized deductions or covenant checks are rendered with a purple **`🤖 AI Interpretation`** badge."*

### Q4: "How does large document handling work?"
> *"I implemented a content bounding utility (`chunker.util.ts`) that caps total extracted text at **50,000 characters** and chunks text into 2,000-character windows. This ensures that prompt sizes fit comfortably within LLM context limits without triggering memory or token overflow errors."*

### Q5: "How does the system behave if the OpenAI API key is missing or fails?"
> *"I implemented a deterministic rule-based offline fallback engine inside `LlmService`. If `OPENAI_API_KEY` is missing or the network drops, the backend automatically executes the fallback engine, returning structured JSON findings so local testing and demonstrations work 100% offline."*

### Q6: "How would you productionize this for an enterprise bank?"
> *"For production, I would migrate SQLite to **Amazon Aurora PostgreSQL (Multi-AZ)**, store raw files in KMS-encrypted **AWS S3 buckets**, offload heavy PDF extractions to background queue workers (**BullMQ / Kafka**), integrate **AWS Textract** for scanned PDF OCR, and implement **Microsoft Presidio** for PII redaction (SSN, account numbers) before invoking LLM APIs."*

---

## 📄 SUMMARY OF REPOSITORY FILES
- `README.md`: Complete overview, architecture, stack, setup, security, productionisation roadmap, AI disclosures, testing.
- `guide.md`: Business stakeholder walkthrough and setup guide.
- `server/prisma/schema.prisma`: Relational database models (`Document`, `Analysis`, `AnalysisDocument`, `Finding`).
- `server/src/tests/`: Integration tests using Vitest + Supertest with self-cleaning database hooks.
- `CHATGPT_PROJECT_CONTEXT.md`: This master context document for live interview assistance.
