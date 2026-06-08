import { PDFDocument } from 'pdf-lib';
import fs from 'fs';

async function testMerge() {
  try {
    const mergedPdf = await PDFDocument.create();
    const files = fs.readdirSync('public/downloads/pdfs').filter(f => f.endsWith('.pdf') && f !== 'complete-career-guide-2026.pdf');
    for (const file of files) {
      console.log('Merging', file);
      const buffer = fs.readFileSync('public/downloads/pdfs/' + file);
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }
    const masterBytes = await mergedPdf.save();
    fs.writeFileSync('public/downloads/pdfs/complete-career-guide-2026.pdf', masterBytes);
    console.log("Success! Master PDF created.");
  } catch (e) {
    console.error(e);
  }
}
testMerge();
testMerge();
