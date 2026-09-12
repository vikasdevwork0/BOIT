import fs from 'fs';
import path from 'path';

const samplesDir = path.join(process.cwd(), 'samples');
if (!fs.existsSync(samplesDir)) {
  fs.mkdirSync(samplesDir, { recursive: true });
}

function createPdf(filePath, title, lines) {
  const streamLines = [
    'BT',
    '/F1 14 Tf',
    '50 740 Td',
    `(${title}) Tj`,
    '/F1 10 Tf',
    '0 -24 Td',
  ];

  lines.forEach((line) => {
    const escaped = line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    streamLines.push(`(${escaped}) Tj`);
    streamLines.push('0 -16 Td');
  });

  streamLines.push('ET');

  const streamContent = streamLines.join('\n');
  const streamLength = Buffer.byteLength(streamContent);

  const pdfBody = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamLength} >>
stream
${streamContent}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000350 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
424
%%EOF`;

  fs.writeFileSync(filePath, pdfBody);
  console.log(`Created PDF: ${filePath}`);
}

// 1. loan-application.pdf
createPdf(
  path.join(samplesDir, 'loan-application.pdf'),
  'SYNTHETIC / DEMO DATA - COMMERCIAL LOAN APPLICATION',
  [
    '=== APPLICANT DETAILS ===',
    'Company Name: Acme Financial Services Ltd',
    'Registration Number: CIN-U65990MH2018PLC312450',
    'Registered Address: 25 MG Road, Fort, Mumbai 400001',
    'Annual Revenue: INR 12.5 Crore (125,000,000 INR)',
    'Requested Loan Amount: INR 5.0 Crore (50,000,000 INR)',
    'Loan Purpose: Working Capital Expansion',
    'Proposed Debt-to-Equity Covenant: Maximum 2.0x',
    '=== LIST OF DIRECTORS ===',
    '1. Vikram Sharma (Managing Director - DIN 08912450)',
    '2. Rajesh Gupta (Director - DIN 07641209)',
    '3. Meera Patel (Executive Director - DIN 09214588)',
    'Notice: SYNTHETIC DATA FOR BENCHMARK DEMO ONLY. NOT A REAL DOCUMENT.',
  ]
);

// 2. financial-statement.pdf
createPdf(
  path.join(samplesDir, 'financial-statement.pdf'),
  'SYNTHETIC / DEMO DATA - AUDITED FINANCIAL STATEMENT FY2024-25',
  [
    '=== ENTITY AUDIT REPORT ===',
    'Company Name: Acme Financial Services Limited',
    'Reporting Period: FY 2024-2025 (Audited)',
    'Annual Revenue: INR 10.8 Crore (108,000,000 INR)',
    'Operating Profit (EBITDA): INR 2.1 Crore',
    'Net Profit After Tax: INR 1.2 Crore (12,000,000 INR)',
    'Total Assets: INR 12.0 Crore',
    'Outstanding Liabilities / Debt: INR 8.5 Crore (85,000,000 INR)',
    'Shareholder Equity: INR 3.5 Crore (35,000,000 INR)',
    'Calculated Debt-to-Equity Ratio: 2.43x',
    'Notice: SYNTHETIC DATA FOR DEMO ONLY.',
  ]
);

// 3. company-registration.txt
const regText = `=== SYNTHETIC / DEMO DATA - MINISTRY OF CORPORATE AFFAIRS REGISTRATION ===
Document Type: Certificate of Incorporation & Director Register (Synthetic Demo)
Company Name: Acme Financial Services Ltd
CIN: CIN-U65990MH2018PLC312450
Date of Incorporation: 14/05/2018
Registered Office Address: 52 MG Road, Nariman Point, Mumbai 400021

=== AUTHORIZED DIRECTORS ON MCA RECORD ===
1. Vikram Sharma (Director - DIN 08912450)
2. Rajesh Gupta (Director - DIN 07641209)

Note: No other active directors registered on MCA master data as of 2026.
Notice: SYNTHETIC DEMO DATA ONLY.
`;
fs.writeFileSync(path.join(samplesDir, 'company-registration.txt'), regText);
console.log('Created TXT: company-registration.txt');

// 4. bank-transactions.csv
const csvLines = [
  'Transaction_ID,Date,Description,Debit_INR,Credit_INR,Balance_INR',
  'TXN-9001,2025-01-05,Client Payment Recd - Customer A,0,750000,1850000',
  'TXN-9002,2025-01-12,Vendor Payout - IT Services,250000,0,1600000',
  'TXN-9003,2025-01-20,Office Rent & Maintenance,150000,0,1450000',
  'TXN-9004,2025-02-02,Client Payment Recd - Customer B,0,680000,2130000',
  'TXN-9005,2025-02-15,Payroll Account Transfer,850000,0,1280000',
  'TXN-9006,2025-02-28,Loan Interest Payment,180000,0,1100000',
  'TXN-9007,2025-03-10,Client Payment Recd - Customer C,0,920000,2020000',
  'TXN-9008,2025-03-25,Operational Expenses,420000,0,1600000',
  'SUMMARY_NOTE,2025-03-31,Total Annual Credit Turnover: INR 8.2 Crore (82000000 INR) | Avg Monthly Balance: INR 15 Lakhs,0,82000000,1600000',
];
fs.writeFileSync(path.join(samplesDir, 'bank-transactions.csv'), csvLines.join('\n'));
console.log('Created CSV: bank-transactions.csv');

console.log('All synthetic sample documents created successfully!');
