const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const srcDir = path.join(__dirname, 'src');

function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function migrateFile(filePath, destRelPath, layoutPath, seriesBoxPath) {
  const fullPath = path.join(rootDir, filePath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`File not found: ${fullPath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');

  // 1. Extract metadata
  const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : 'C2 Club Blog';

  const descMatch = content.match(/<meta\s+name="description"\s+content="([^"]*)"/i) || 
                    content.match(/<meta\s+content="([^"]*)"\s+name="description"/i);
  const description = descMatch ? descMatch[1].trim() : 'Building the collaboration layer students always needed.';

  // 2. Extract styles
  const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  let styles = styleMatch ? styleMatch[1].trim() : '';

  // 3. Extract print cover variables
  let printCoverTitle = '';
  let printCoverSubtitle = '';
  let showPrintCover = false;

  const printCoverMatch = content.match(/<div class="print-only print-cover">([\s\S]*?)<\/div>\s*<\/div>/i) ||
                          content.match(/<div class="print-only print-cover">([\s\S]*?)<\/div>/i);
  if (printCoverMatch) {
    showPrintCover = true;
    const coverContent = printCoverMatch[1];
    const h1Match = coverContent.match(/<h1>What After PUC?<br\s*\/?>([\s\S]*?)<\/h1>/i) ||
                    coverContent.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    printCoverTitle = h1Match ? h1Match[1].replace(/What After PUC\?<br\s*\/?>/i, '').trim() : '';
    
    const pMatch = coverContent.match(/<p style="font-size: 1.5rem;[^>]*>([\s\S]*?)<\/p>/i) ||
                   coverContent.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    printCoverSubtitle = pMatch ? pMatch[1].trim() : 'Karnataka 2026 Edition · Career Roadmap';
  }

  // 4. Extract body content between navbar header and footer
  // Find where navbar ends and footer starts
  let bodyContent = '';
  
  // We can look for <main> or the container right after </header>
  const mainMatch = content.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (mainMatch) {
    bodyContent = mainMatch[0];
  } else {
    // Fallback: split from header to footer
    const navEndIdx = content.indexOf('</header>');
    const footerStartIdx = content.indexOf('<footer');
    if (navEndIdx !== -1 && footerStartIdx !== -1) {
      bodyContent = content.substring(navEndIdx + 9, footerStartIdx);
    } else {
      bodyContent = content; // Last resort
    }
  }

  // 5. Standardize Series Box in the bodyContent
  // Replace <div class="series-box">...</div></div> with <SeriesBox currentHref={Astro.url.pathname} />
  const seriesBoxRegex = /<div class="series-box"[\s\S]*?<\/div>\s*<\/div>/i;
  if (seriesBoxRegex.test(bodyContent)) {
    bodyContent = bodyContent.replace(seriesBoxRegex, '<SeriesBox currentHref={Astro.url.pathname} />');
  }

  // 6. Clean up download button to ensure standard text button
  const downloadBtnRegex = /<button\s+id="download-pdf-btn"[\s\S]*?<\/button>/gi;
  bodyContent = bodyContent.replace(downloadBtnRegex, '<button id="download-pdf-btn" onclick="window.print()">Download PDF</button>');

  // 7. Write the astro component
  const destPath = path.join(srcDir, destRelPath);
  ensureDirExists(path.dirname(destPath));

  const astroTemplate = `---
import Layout from '${layoutPath}';
import SeriesBox from '${seriesBoxPath}';

// Clean title of any HTML tags
const pageTitle = "${title.replace(/"/g, '\\"')}";
---
<Layout
  title={pageTitle}
  description="${description.replace(/"/g, '\\"')}"
  isArticle={true}
  showPrintCover={${showPrintCover}}
  printCoverTitle="${printCoverTitle.replace(/"/g, '\\"')}"
  printCoverSubtitle="${printCoverSubtitle.replace(/"/g, '\\"')}"
>
  ${bodyContent}
</Layout>

<style is:global>
  ${styles}
</style>
`;

  fs.writeFileSync(destPath, astroTemplate, 'utf8');
  console.log(`Migrated: ${filePath} -> ${destRelPath}`);
}

// Perform Migration
// 1. PUC guides
const puDir = path.join(rootDir, 'blog/what-after-pu');
if (fs.existsSync(puDir)) {
  const puFiles = fs.readdirSync(puDir).filter(f => f.endsWith('.html'));
  puFiles.forEach(file => {
    const srcPath = path.join('blog/what-after-pu', file);
    const destPath = path.join('pages/blog/what-after-pu', file.replace('.html', '.astro'));
    migrateFile(srcPath, destPath, '../../../layouts/Layout.astro', '../../../components/SeriesBox.astro');
  });
}

// 2. Extra Blogs
migrateFile(
  'blog/alumni-networks-india-career-outcomes.html',
  'pages/blog/alumni-networks-india-career-outcomes.astro',
  '../../layouts/Layout.astro',
  '../../components/SeriesBox.astro'
);

migrateFile(
  'blog/resume-guide-indian-engineering-students.html',
  'pages/blog/resume-guide-indian-engineering-students.astro',
  '../../layouts/Layout.astro',
  '../../components/SeriesBox.astro'
);

// 3. Blog Template
migrateFile(
  'blog-template.html',
  'pages/blog-template.astro',
  '../layouts/Layout.astro',
  '../components/SeriesBox.astro'
);

console.log('Blog migration complete!');
