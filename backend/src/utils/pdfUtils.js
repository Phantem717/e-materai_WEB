// app/api/process-pdfs/route.js
import { NextResponse } from 'next/server';
import { writeFile, readFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { PDFDocument } from 'pdf-lib';
import pdf from 'pdf-parse';

// Helper to save uploaded files
async function saveUploadedFile(file, filename) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  const uploadDir = join(process.cwd(), 'uploads');
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }
  
  const filepath = join(uploadDir, filename);
  await writeFile(filepath, buffer);
  return filepath;
}

// Extract details from PDF text
function extractDetailsFromText(text) {
  // Customize this based on your PDF template
  // Example: Extract name, date, invoice number, etc.
  const details = {
    fullText: text,
    // Add your extraction logic here
    // Example patterns:
    name: text.match(/Name:\s*(.+)/)?.[1]?.trim() || 'N/A',
    date: text.match(/Date:\s*(.+)/)?.[1]?.trim() || 'N/A',
    invoice: text.match(/Invoice:\s*(.+)/)?.[1]?.trim() || 'N/A',
  };
  
  return details;
}

// Process single PDF
async function processPDF(pdfPath) {
  try {
    // 1. Extract text details
    const dataBuffer = await readFile(pdfPath);
    const data = await pdf(dataBuffer);
    const details = extractDetailsFromText(data.text);
    
    // 2. Load PDF and stamp image
    const pdfDoc = await PDFDocument.load(dataBuffer);

    // 4. Save modified PDF
    const pdfBytes = await pdfDoc.save();
    const outputPath = pdfPath.replace('.pdf', '_stamped.pdf');
    await writeFile(outputPath, pdfBytes);
    
    return {
      success: true,
      original: pdfPath,
      output: outputPath,
      details,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      original: pdfPath,
      output: null,
      details: null,
      error: error.message,
    };
  }
}

// Batch process with concurrency control
async function batchProcess(pdfPaths, concurrency = 3) {
  const results = [];
  
  // Process in batches to control concurrency
  for (let i = 0; i < pdfPaths.length; i += concurrency) {
    const batch = pdfPaths.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(path => processPDF(path))
    );
    results.push(...batchResults);
  }
  
  return results;
}

// Cleanup temporary files
async function cleanupFiles(filePaths) {
  for (const path of filePaths) {
    try {
      await unlink(path);
    } catch (error) {
      console.error(`Failed to delete ${path}:`, error);
    }
  }
}



// export async function POST(request) {
//   try {
//     const formData = await request.formData();
    
//     // Get uploaded PDFs
//     const pdfFiles = formData.getAll('pdfs');
//     if (!pdfFiles || pdfFiles.length === 0) {
//       return NextResponse.json(
//         { error: 'No PDF files uploaded' },
//         { status: 400 }
//       );
//     }
    
//     // Get stamp image
//     const stampFile = formData.get('stamp');
//     if (!stampFile) {
//       return NextResponse.json(
//         { error: 'No stamp image uploaded' },
//         { status: 400 }
//       );
//     }
    
//     // Get stamp configuration
//     const stampConfig = {
//       x: parseFloat(formData.get('x')) || 100,
//       y: parseFloat(formData.get('y')) || 100,
//       width: parseFloat(formData.get('width')) || 100,
//       height: parseFloat(formData.get('height')) || 100,
//       pageIndex: parseInt(formData.get('pageIndex')) || 0,
//       scale: parseFloat(formData.get('scale')) || 1,
//       opacity: parseFloat(formData.get('opacity')) || 1,
//     };
    
//     // Save uploaded files
//     const stampPath = await saveUploadedFile(stampFile, `stamp_${Date.now()}.${stampFile.name.split('.').pop()}`);
    
//     const pdfPaths = [];
//     for (let i = 0; i < pdfFiles.length; i++) {
//       const file = pdfFiles[i];
//       const path = await saveUploadedFile(file, `pdf_${Date.now()}_${i}.pdf`);
//       pdfPaths.push(path);
//     }
    
//     // Process all PDFs
//     const results = await batchProcess(pdfPaths, stampPath, stampConfig);
    
//     // Read processed PDFs and convert to base64 for download
//     const processedFiles = [];
//     for (const result of results) {
//       if (result.success) {
//         const fileBuffer = await readFile(result.output);
//         processedFiles.push({
//           filename: result.output.split('/').pop(),
//           data: fileBuffer.toString('base64'),
//           details: result.details,
//         });
//       }
//     }
    
//     // Cleanup temporary files
//     await cleanupFiles([stampPath, ...pdfPaths, ...results.filter(r => r.output).map(r => r.output)]);
    
//     return NextResponse.json({
//       success: true,
//       totalProcessed: results.length,
//       successCount: results.filter(r => r.success).length,
//       failureCount: results.filter(r => !r.success).length,
//       results,
//       files: processedFiles,
//     });
    
//   } catch (error) {
//     console.error('Error processing PDFs:', error);
//     return NextResponse.json(
//       { error: 'Failed to process PDFs', details: error.message },
//       { status: 500 }
//     );
//   }
// }

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };
module.exports={batchProcess,cleanupFiles,saveUploadedFile}