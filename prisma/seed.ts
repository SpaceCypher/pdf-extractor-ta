import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      image: null,
      defaultModel: 'docling',
      defaultZoom: 100,
      enableAnnotations: true,
      theme: 'system',
      totalDocuments: 5,
      totalExtractions: 12,
      storageUsed: BigInt(25 * 1024 * 1024), // 25MB
    },
  });

  console.log('Created demo user:', demoUser);

  // Create demo documents
  const documents = await Promise.all([
    prisma.document.create({
      data: {
        userId: demoUser.id,
        filename: 'financial-report-2024.pdf',
        originalName: 'Financial Report 2024.pdf',
        fileSize: BigInt(2.5 * 1024 * 1024),
        pageCount: 48,
        mimeType: 'application/pdf',
        storageKey: 'demo-doc-1',
        status: 'COMPLETED',
      },
    }),
    prisma.document.create({
      data: {
        userId: demoUser.id,
        filename: 'research-paper.pdf',
        originalName: 'Research Paper - AI in Document Processing.pdf',
        fileSize: BigInt(5.7 * 1024 * 1024),
        pageCount: 24,
        mimeType: 'application/pdf',
        storageKey: 'demo-doc-2',
        status: 'COMPLETED',
      },
    }),
    prisma.document.create({
      data: {
        userId: demoUser.id,
        filename: 'user-manual.pdf',
        originalName: 'User Manual v2.0.pdf',
        fileSize: BigInt(1.8 * 1024 * 1024),
        pageCount: 32,
        mimeType: 'application/pdf',
        storageKey: 'demo-doc-3',
        status: 'COMPLETED',
      },
    }),
  ]);

  console.log('Created demo documents:', documents.length);

  // Create demo extractions
  for (const doc of documents) {
    const models = ['docling', 'surya', 'mineru'];
    const randomModel = models[Math.floor(Math.random() * models.length)];
    
    await prisma.extraction.create({
      data: {
        documentId: doc.id,
        modelId: randomModel,
        modelName: randomModel.charAt(0).toUpperCase() + randomModel.slice(1),
        status: 'COMPLETED',
        processingTime: Math.floor(Math.random() * 120) + 30, // 30-150 seconds
        markdownContent: `# Extracted Content from ${doc.originalName}\n\nThis is demo extracted content...`,
        elementCount: Math.floor(Math.random() * 200) + 50,
        confidence: 0.85 + Math.random() * 0.15, // 0.85-1.0
        completedAt: new Date(),
      },
    });
  }

  console.log('Created demo extractions');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });