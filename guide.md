# Comprehensive Guide: Multi-Document Intelligence Workbench

Welcome to the complete guide for the **Multi-Document Intelligence Workbench**. This guide is designed for both non-technical business stakeholders (bank managers, loan officers, product leads) and software developers.

---

## 🎯 1. Why Was This Project Created?

In the banking, credit underwriting, and commercial lending industries, evaluating a corporate loan application requires reviewing **multiple complex documents** at the same time:
1. Loan Application Forms (stating requested loan amount and claimed revenue)
2. Audited Financial Statements (containing revenue, net profit, liabilities, and shareholder equity)
3. Government Registration Records (listing official addresses and registered directors)
4. Bank Account Transaction Statements (showing actual monthly cash deposits and balances)

### The Real-World Problem
Historically, credit risk analysts had to **manually cross-check** every single figure, name, address, and ratio across dozens of pages of documents. This manual process causes:
- **High Human Error**: Missing subtle mismatches between claimed revenue vs. audited statements or transaction logs.
- **Slow Processing Times**: Taking days or weeks to process a single commercial credit application.
- **Lack of Traceability**: Difficulty proving exactly *which page or row* a specific risk metric came from.

### The Solution: Multi-Document Intelligence Workbench
This application acts as an **AI-powered assistant for credit analysts**. It automatically ingests multiple documents, extracts factual data points, compares them across files, identifies hidden discrepancies and missing information, and provides exact source references—all within seconds.

---

## 🏗️ 2. High-Level Architecture (Explained Simply)

Instead of dumping all uploaded files into an AI model at once (which causes AI to hallucinate or miss details), our workbench uses a **Two-Pass Pipeline with Document Boundaries**:

```
[ Upload PDF / CSV / TXT Documents ]
                 ↓
[ 1. Modular Document Processors (PDF, CSV, TXT) ]
                 ↓
[ 2. SQLite Database (Stores Files & Extracted Text) ]
                 ↓
[ PASS 1: Document-Level Fact Extraction (Per Document) ]
  • Document 1 → Extracted Facts & Summary
  • Document 2 → Extracted Facts & Summary
  • Document 3 → Extracted Facts & Summary
                 ↓
[ PASS 2: Cross-Document Synthesis & AI Analysis ]
  • Compares facts across files
  • Detects numerical & address mismatches
  • Highlights missing regulatory data
                 ↓
[ Provenance-Aware Results Displayed in Dashboard ]
  • Fact vs. AI Interpretation Badges
  • Severity Colors (High, Medium, Low)
  • Exact Source References (Page / Row Numbers)
  • One-Click Copy Report
```

### Key Design Principles:
1. **Document Boundaries Preserved**: Each document is analyzed individually first. We never mix up document text into one giant prompt.
2. **Provenance & Source Attribution**: Every finding lists the exact document name, page number, or CSV row number. The system **never invents a source**.
3. **Fact vs. AI Deduction Distinction**:
   - 📌 **Extracted Fact**: Verbatim data directly read from the file.
   - 🤖 **AI Interpretation**: AI deductions, ratio checks, or cross-document comparisons.

---

## 💻 3. Technology Stack & Why It Was Chosen

| Technology Layer | Tool / Library | Why It Was Chosen |
| :--- | :--- | :--- |
| **Frontend UI** | **React 19 + TypeScript** | Enables a fast, interactive, type-safe dashboard with instant feedback. |
| **Styling** | **Vanilla CSS Design System** | Clean, dark slate aesthetic with clear badges for high readability. |
| **Backend API** | **Node.js + Express + TypeScript** | Fast, asynchronous, modular backend capable of handling multi-file uploads. |
| **Database** | **SQLite + Prisma ORM** | Reliable relational database with zero setup friction; stores documents and findings cleanly. |
| **Document Parsers** | `pdf-parse`, `csv-parse`, UTF-8 text parser | Native, lightweight extraction for PDF, CSV, and TXT files without external OCR overhead. |
| **AI Analysis Engine** | **OpenAI API (`gpt-4o-mini`) + Fallback Engine** | Provides advanced AI reasoning when online, and a fallback engine when offline or uncredited. |
| **Testing** | **Vitest + Supertest** | Fast, automated integration tests ensuring reliable API contracts. |

---

## 🚀 4. Features Included

1. **Multi-Document Upload**: Upload multiple PDF, TXT, and CSV files in one batch.
2. **Multi-Format Extraction**: Automatic text, page, and row parsing.
3. **Interactive Dashboard**: Drag & drop zone, selected document list, preset prompt chips.
4. **Two-Pass AI Analysis**: Individual document fact extraction followed by cross-document comparison.
5. **Discrepancy & Mismatch Detection**: Identifies revenue gaps, address mismatches, and covenant breaches.
6. **Missing Information Flags**: Highlights missing directors or unverified loan figures.
7. **Severity & Category Badges**: High (Orange/Red), Medium (Yellow), Low (Green) severity indicators.
8. **One-Click Export**: Copy clean, formatted markdown analysis report to clipboard.
9. **Banking Security Safeguards**: File size limits (10MB), UUID safe filenames, path traversal protection, prompt injection defenses.
10. **Automated Integration Tests**: 100% passing test suite for uploads and analysis.

---

## 🛠️ 5. Step-by-Step Setup Guide (For Any Local Machine)

Follow these exact steps to set up and run the application on any Mac, Windows, or Linux system:

### Prerequisites
Make sure you have installed:
- **Node.js** (v18 or higher) $\rightarrow$ Download from [nodejs.org](https://nodejs.org)
- **npm** (comes automatically with Node.js)
- **Git** $\rightarrow$ Download from [git-scm.com](https://git-scm.com)

---

### Step 1: Clone the Repository
Open your terminal or command prompt and run:

```bash
git clone https://github.com/vikasdevwork0/BOIT.git
cd BOIT/multi-document-intelligence-workbench
```

---

### Step 2: Install Dependencies
Install all required npm packages for the root project, backend server, and frontend client:

```bash
npm run install:all
```

---

### Step 3: Configure Environment Variables
Create a local `.env` configuration file from the provided template:

```bash
cp .env.example server/.env
```

The default `server/.env` file will look like this:
```env
PORT=5001
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY="your_openai_api_key_here"
```
*(Note: If you do not have an OpenAI API key, leave it as is; the system will automatically use the built-in fallback engine).*

---

### Step 4: Initialize the Local SQLite Database
Run the Prisma database migration and seed script to generate your local database:

```bash
cd server
npm run prisma:db-push
npm run prisma:seed
cd ..
```

---

### Step 5: Start the Backend & Frontend Applications

#### Terminal Window 1 (Backend Server):
```bash
npm run dev:server
```
*The Express backend will start on **`http://localhost:5001`**.*

#### Terminal Window 2 (Frontend Client):
Open a new terminal window in the same folder and run:
```bash
npm run dev:client
```
*The React frontend will start on **`http://localhost:5173`**.*

Open your browser and go to **`http://localhost:5173`**!

---

### Step 6: Run Automated Integration Tests
To verify that everything is working perfectly, run the automated test suite:

```bash
npm test
```
*All test suites will execute and pass in under 1 second.*

---

## 📁 6. Synthetic Benchmark Samples Walkthrough

The project includes 4 pre-packaged synthetic banking sample documents in the `samples/` folder to test discrepancy detection:

| File Name | Document Type | Intentional Discrepancy & Scenario Embedded |
| :--- | :--- | :--- |
| **`loan-application.pdf`** | PDF | Claims **INR 12.5 Cr** revenue, requests **INR 5.0 Cr** loan, address: *25 MG Road, Mumbai*, lists 3 directors (*Vikram, Rajesh, Meera*), proposed debt covenant: **Max 2.0x**. |
| **`financial-statement.pdf`** | PDF | Audited revenue is **INR 10.8 Cr** (**Discrepancy 1: INR 10.8 Cr vs claimed INR 12.5 Cr**). Debt is INR 8.5 Cr & Equity is INR 3.5 Cr (**Discrepancy 2: Calculated Debt Ratio is 2.43x, breaching 2.0x covenant!**). |
| **`company-registration.txt`** | TXT | Registered address is *52 MG Road, Mumbai* (**Discrepancy 3: Address mismatch**). MCA register lists only 2 directors (*Vikram, Rajesh*) (**Missing Info Scenario 1: Director Meera Patel listed on Loan App is MISSING on official MCA record!**). |
| **`bank-transactions.csv`** | CSV | Total annual credits: **INR 8.2 Cr** (**Discrepancy 4: Credits far below claimed INR 12.5 Cr revenue**). Avg monthly balance: **INR 15 Lakhs** (**Missing Info Scenario 2: INR 15 Lakhs balance is insufficient to service a INR 5.0 Cr loan**). |

---

## 🛡️ 7. Security, Privacy & Compliance

- **100% Synthetic Data**: No real customer or sensitive banking data is used.
- **Safe UUID Filenames**: Uploaded files are renamed using randomly generated UUIDs to prevent file overwrites.
- **Path Traversal Shield**: Uses `path.basename` to prevent malicious folder navigation (`../`).
- **Prompt Injection Defense**: Uploaded text is wrapped in `<untrusted_document_content>` tags, instructing the AI to ignore any embedded user instructions.
- **Git Secrets Protection**: `.env` files are ignored by git so API keys are never exposed publicly.

---

## 📄 Summary & Repository Information

- **GitHub Repository**: `https://github.com/vikasdevwork0/BOIT.git`
- **Main Branch**: `main`
- **Developer / Author**: `vikasdevwork0 <vikas.devwork0@gmail.com>`

The Multi-Document Intelligence Workbench is ready for local execution, demonstration, and evaluation!
