import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding synthetic database records...');

  // Clean existing data
  await prisma.finding.deleteMany();
  await prisma.analysisDocument.deleteMany();
  await prisma.analysis.deleteMany();
  await prisma.document.deleteMany();

  // Create synthetic documents
  const doc1 = await prisma.document.create({
    data: {
      originalName: 'Q3_Financial_Statement_Synthetic.csv',
      storedName: 'doc_101_q3_financials.csv',
      mimeType: 'text/csv',
      fileSize: 24580,
      status: 'PROCESSED',
      extractedText: 'Account_ID,Metric,Q3_2025_USD\nACC-4091,Operating_Revenue,12500000\nACC-4091,Net_Profit,1850000\nACC-4091,Debt_Ratio,0.42',
    },
  });

  const doc2 = await prisma.document.create({
    data: {
      originalName: 'Commercial_Loan_Agreement_Synthetic.pdf',
      storedName: 'doc_102_loan_agreement.pdf',
      mimeType: 'application/pdf',
      fileSize: 154200,
      status: 'PROCESSED',
      extractedText: 'SYNTHETIC LOAN AGREEMENT: Borrower agrees to maintain a maximum Debt-to-Equity Ratio of 0.50 and minimum Debt Service Coverage Ratio (DSCR) of 1.25.',
    },
  });

  const doc3 = await prisma.document.create({
    data: {
      originalName: 'Credit_Risk_Notes_Synthetic.txt',
      storedName: 'doc_103_risk_notes.txt',
      mimeType: 'text/plain',
      fileSize: 4120,
      status: 'PROCESSED',
      extractedText: 'Credit Committee Assessment: Borrower demonstrates stable liquidity. No major credit default history recorded in public registry.',
    },
  });

  // Create synthetic analysis
  const analysis = await prisma.analysis.create({
    data: {
      prompt: 'Assess loan covenant compliance and debt ratio for ACC-4091',
      status: 'COMPLETED',
      summary: 'Borrower complies with the max debt ratio covenant (0.42 actual vs 0.50 requirement). Credit risk remains low.',
      rawResult: JSON.stringify({
        complianceStatus: 'PASSED',
        covenantsAnalyzed: 2,
        findingsCount: 3,
      }),
      documents: {
        create: [
          { documentId: doc1.id },
          { documentId: doc2.id },
          { documentId: doc3.id },
        ],
      },
    },
  });

  // Create synthetic findings (Distinguishing extracted facts vs AI interpretation)
  await prisma.finding.createMany({
    data: [
      {
        analysisId: analysis.id,
        type: 'FACT',
        title: 'Q3 Operating Revenue Extracted',
        description: 'Extracted operating revenue from Q3 Financial Statement.',
        severity: 'LOW',
        value: '$12,500,000 USD',
        sourceDocumentId: doc1.id,
        sourceReference: 'CSV Row 2 (ACC-4091)',
        confidence: 0.99,
        isAiInterpretation: false, // Extracted Fact
      },
      {
        analysisId: analysis.id,
        type: 'FACT',
        title: 'Max Debt Ratio Covenant Limit',
        description: 'Maximum allowable Debt-to-Equity ratio stipulated in loan agreement.',
        severity: 'MEDIUM',
        value: '0.50 Ratio Limit',
        sourceDocumentId: doc2.id,
        sourceReference: 'PDF Section 4.2',
        confidence: 0.95,
        isAiInterpretation: false, // Extracted Fact
      },
      {
        analysisId: analysis.id,
        type: 'INTERPRETATION',
        title: 'Covenant Compliance & Risk Outlook',
        description: 'AI model infers low credit risk as current ratio (0.42) operates safely under the 0.50 covenant threshold with strong liquidity cushion.',
        severity: 'LOW',
        value: 'Low Risk / Passed',
        sourceDocumentId: doc1.id,
        sourceReference: 'Cross-document analysis (Doc 1 & Doc 2)',
        confidence: 0.91,
        isAiInterpretation: true, // AI-generated interpretation
      },
    ],
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
