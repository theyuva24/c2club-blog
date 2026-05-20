const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const srcDir = path.join(__dirname, 'src');

function migratePage(filePath, destRelPath, layoutPath) {
  const fullPath = path.join(rootDir, filePath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`File not found: ${fullPath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');

  // 1. Extract metadata
  const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : 'C2 Club';

  const descMatch = content.match(/<meta\s+name="description"\s+content="([^"]*)"/i) || 
                    content.match(/<meta\s+content="([^"]*)"\s+name="description"/i);
  const description = descMatch ? descMatch[1].trim() : 'Building the collaboration layer students always needed.';

  // 2. Extract styles
  const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  let styles = styleMatch ? styleMatch[1].trim() : '';

  // 3. Extract body content between header navbar and footer
  let bodyContent = '';
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
      bodyContent = content;
    }
  }

  const destPath = path.join(srcDir, destRelPath);
  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const astroTemplate = `---
import Layout from '${layoutPath}';

const pageTitle = "${title.replace(/"/g, '\\"')}";
---
<Layout
  title={pageTitle}
  description="${description.replace(/"/g, '\\"')}"
  isArticle={false}
>
  ${bodyContent}
</Layout>

${styles ? `<style is:global>\n  ${styles}\n</style>` : ''}
`;

  fs.writeFileSync(destPath, astroTemplate, 'utf8');
  console.log(`Migrated page: ${filePath} -> ${destRelPath}`);
}

// Execute core pages migration
migratePage('index.html', 'pages/index.astro', '../layouts/Layout.astro');
migratePage('challenges.html', 'pages/challenges.astro', '../layouts/Layout.astro');
migratePage('contact.html', 'pages/contact.astro', '../layouts/Layout.astro');
migratePage('download.html', 'pages/download.astro', '../layouts/Layout.astro');
migratePage('challenge-view.html', 'pages/challenge-view.astro', '../layouts/Layout.astro');
migratePage('blog/index.html', 'pages/blog/index.astro', '../../layouts/Layout.astro');

console.log('Core pages migration complete!');
