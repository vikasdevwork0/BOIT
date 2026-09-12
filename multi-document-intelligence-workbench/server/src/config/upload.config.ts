import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

export const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const ALLOWED_MIME_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'text/plain': 'txt',
  'text/csv': 'csv',
  'application/vnd.ms-excel': 'csv',
  'text/x-csv': 'csv',
  'application/csv': 'csv',
};

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    // Generate safe unique filename using UUID and prevent path traversal
    const ext = path.extname(file.originalname).toLowerCase() || '.bin';
    const safeName = `${crypto.randomUUID()}${ext}`;
    cb(null, safeName);
  },
});

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
});
