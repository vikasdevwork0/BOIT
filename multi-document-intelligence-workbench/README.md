# Multi-Document Intelligence Workbench

A full-stack intelligence workbench built for multi-document processing (PDF, TXT, CSV) in the banking domain.

## Project Structure

- `client/`: React + TypeScript + Vite frontend application
- `server/`: Node.js + Express + TypeScript + Prisma (SQLite) backend service
- `samples/`: Sample PDF, TXT, and CSV documents

## Prerequisites

- Node.js (v18 or higher)
- npm

## Getting Started

### Installation

Install dependencies for both client and server:

```bash
# Install root dependencies
npm install

# Or install manually in client and server directories:
cd client && npm install
cd ../server && npm install
```

### Environment Setup

Copy `.env.example` to `server/.env`:

```bash
cp .env.example server/.env
```

### Database Setup

Initialize SQLite database with Prisma:

```bash
cd server
npm run prisma:db-push
```

### Running the Applications

#### Development Mode

Run backend (Server running on port 5001):
```bash
cd server
npm run dev
```

Run frontend (Vite dev server running on port 5173):
```bash
cd client
npm run dev
```

Alternatively, from the root directory:
```bash
npm run dev:server
npm run dev:client
```

### Build for Production

Build server:
```bash
cd server
npm run build
```

Build client:
```bash
cd client
npm run build
```

### Health Check

Verify backend status:
```bash
curl http://localhost:5001/api/health
# Response: { "status": "ok" }
```
