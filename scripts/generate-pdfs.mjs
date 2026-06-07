import puppeteer from 'puppeteer';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:4321/blog/what-after-pu';
const CONTENT_DIR = 'src/pages/blog/what-after-pu';
const OUTPUT_DIR = 'public/downloads/pdfs';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function generatePdfs() {
  console.log('Starting PDF generation...');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.astro'));

  const pdfBuffers = [];
  const page = await browser.newPage();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const slug = file.replace('.astro', '');

    // FIXED: Astro requires trailing slash
    const url = `${BASE_URL}/${slug}/`;

    const outputPath = path.join(OUTPUT_DIR, `${slug}.pdf`);

    console.log(`\nProcessing [${i + 1}/${files.length}]`);
    console.log(`URL: ${url}`);

    try {
      const response = await page.goto(url, {
        waitUntil: 'networkidle0'
      });

      if (!response) {
        throw new Error(`No response received for ${url}`);
      }

      if (!response.ok()) {
        throw new Error(
          `HTTP ${response.status()} returned for ${url}`
        );
      }

      const pageText = await page.evaluate(
        () => document.body.innerText
      );

      if (
        pageText.includes('404: Not found') ||
        pageText.includes('Page Not Found')
      ) {
        throw new Error(
          `404 page detected for URL: ${url}`
        );
      }

      await page.addStyleTag({
        content: `
          @page {
            margin: 15mm 15mm 20mm 15mm !important;
          }

          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        `
      });

      // ------------------------
      // INDIVIDUAL PDF
      // ------------------------

      const pdfBytes = await page.pdf({
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: '<div></div>',
        footerTemplate: `
          <div style="
            width:100%;
            text-align:center;
            font-size:10px;
            color:#64748b;
            font-family:sans-serif;
            padding-top:5px;
          ">
            <strong style="color:#0f172a;">C2 Club</strong>
            &mdash;
            Page <span class="pageNumber"></span>
            of
            <span class="totalPages"></span>
          </div>
        `,
        margin: {
          top: '15mm',
          bottom: '25mm',
          left: '15mm',
          right: '15mm'
        }
      });

      fs.writeFileSync(outputPath, pdfBytes);

      console.log(`✓ Saved: ${outputPath}`);

      // ------------------------
      // MASTER PDF SEGMENT
      // ------------------------

      await page.reload({
        waitUntil: 'networkidle0'
      });

      await page.addStyleTag({
        content: `
          @page {
            margin: 15mm 15mm 20mm 15mm !important;
          }

          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        `
      });

      if (i === 0) {
        await page.evaluate(() => {
          const h1 = document.querySelector('.print-cover h1');

          if (h1) {
            h1.innerHTML =
              'What After PUC?<br />The Complete Career Guide 2026';
          }

          const cta = document.querySelector('.print-end-page');

          if (cta) {
            cta.style.setProperty(
              'display',
              'none',
              'important'
            );
          }
        });
      } else if (i === files.length - 1) {
        await page.evaluate(() => {
          const cover =
            document.querySelector('.print-cover');

          if (cover) {
            cover.style.setProperty(
              'display',
              'none',
              'important'
            );
          }
        });
      } else {
        await page.evaluate(() => {
          const cover =
            document.querySelector('.print-cover');

          if (cover) {
            cover.style.setProperty(
              'display',
              'none',
              'important'
            );
          }

          const cta =
            document.querySelector('.print-end-page');

          if (cta) {
            cta.style.setProperty(
              'display',
              'none',
              'important'
            );
          }
        });
      }

      const segmentBytes = await page.pdf({
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: '<div></div>',
        footerTemplate: `
          <div style="
            width:100%;
            text-align:center;
            font-size:10px;
            color:#64748b;
            font-family:sans-serif;
            padding-top:5px;
          ">
            <strong style="color:#0f172a;">C2 Club</strong>
            &mdash;
            The Complete Career Guide 2026
          </div>
        `,
        margin: {
          top: '15mm',
          bottom: '25mm',
          left: '15mm',
          right: '15mm'
        }
      });

      pdfBuffers.push(segmentBytes);

      console.log(`✓ Added to master PDF`);
    } catch (error) {
      console.error(
        `✗ Failed for ${slug}:`,
        error.message
      );
    }
  }

  await browser.close();

  if (pdfBuffers.length === 0) {
    throw new Error(
      'No valid PDFs generated. Master PDF creation aborted.'
    );
  }

  console.log('\nMerging segments into Master PDF...');

  const mergedPdf = await PDFDocument.create();

  for (const buffer of pdfBuffers) {
    const pdf = await PDFDocument.load(buffer);

    const copiedPages = await mergedPdf.copyPages(
      pdf,
      pdf.getPageIndices()
    );

    copiedPages.forEach((page) =>
      mergedPdf.addPage(page)
    );
  }

  const masterOutputPath = path.join(
    OUTPUT_DIR,
    'complete-career-guide-2026.pdf'
  );

  const masterBytes = await mergedPdf.save();

  fs.writeFileSync(masterOutputPath, masterBytes);

  console.log(`✓ Saved Master PDF: ${masterOutputPath}`);
  console.log('Done!');
}

generatePdfs().catch(console.error);