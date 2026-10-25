const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.astro') && !file.includes('index.astro') && !file.includes('blog-template')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src/pages/blog');
let processed = 0;
let errors = [];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  
  // Skip if already refactored (imports BlogLayout)
  if (content.includes('BlogLayout.astro')) return;

  try {
    // 1. Frontmatter
    const frontmatterMatch = content.match(/---([\s\S]*?)---/);
    if (!frontmatterMatch) throw new Error("No frontmatter found");
    let frontmatter = frontmatterMatch[1];

    // Replace Layout import with BlogLayout import
    frontmatter = frontmatter.replace(/import\s+Layout\s+from\s+['"]\.\.\/\.\.\/\.\.\/layouts\/Layout\.astro['"];/, "import BlogLayout from '../../../layouts/BlogLayout.astro';");
    frontmatter = frontmatter.replace(/import\s+Layout\s+from\s+['"]\.\.\/\.\.\/layouts\/Layout\.astro['"];/, "import BlogLayout from '../../layouts/BlogLayout.astro';");

    // 2. Layout props
    const layoutMatch = content.match(/<Layout\s+([\s\S]*?)>/);
    if (!layoutMatch) throw new Error("No <Layout> found");
    let layoutProps = layoutMatch[1];
    
    // Clean up layoutProps - remove isArticle, they are handled by BlogLayout
    layoutProps = layoutProps.replace(/\bisArticle=\{true\}\s*/g, '');

    // 3. Breadcrumb
    const breadcrumbMatch = content.match(/<li aria-current="page">(.*?)<\/li>/);
    const breadcrumbCurrent = breadcrumbMatch ? breadcrumbMatch[1].trim() : "Blog Post";

    // 4. Hero Tag
    const heroTagMatch = content.match(/<(?:div|span) class="hero-tag">(.*?)<\/(?:div|span)>/);
    const heroTagStr = heroTagMatch ? `heroTag="${heroTagMatch[1].trim()}"` : ``;

    // 5. Hero Title
    const heroTitleMatch = content.match(/<h1>([\s\S]*?)<\/h1>/);
    const heroTitle = heroTitleMatch ? heroTitleMatch[1].trim() : "";

    // 6. Hero Lead
    const heroLeadMatch = content.match(/<p class="hero-lead">([\s\S]*?)<\/p>/);
    const heroLead = heroLeadMatch ? heroLeadMatch[1].trim() : "";

    // 7. Hero Meta (Date & Read Time)
    const heroMetaMatch = content.match(/<div class="hero-meta">([\s\S]*?)<\/div>/);
    let date = "Date", readTime = "5 min read";
    if (heroMetaMatch) {
      const spans = [...heroMetaMatch[1].matchAll(/<span.*?>(.*?)<\/span>/g)];
      if (spans.length >= 2) {
        date = spans[0][1].trim();
        readTime = spans[spans.length - 1][1].trim();
      }
    }

    // 8. Stats Strip
    const statsMatch = content.match(/<div class="stats-strip">([\s\S]*?)<\/div>\s*<!-- Body -->|<div class="stats-strip">([\s\S]*?)<div class="article-featured-image"/);
    let statsArr = [];
    if (statsMatch) {
      const stripContent = statsMatch[1] || statsMatch[2];
      const statBlocks = [...stripContent.matchAll(/<div class="stat-num">(.*?)<\/div>\s*<div class="stat-label">(.*?)<\/div>/g)];
      statBlocks.forEach(b => {
        statsArr.push(`{ num: "${b[1].trim().replace(/"/g, '\\"')}", label: "${b[2].trim().replace(/"/g, '\\"')}" }`);
      });
    }
    const statsStr = statsArr.length > 0 ? `stats={[${statsArr.join(", ")}]}` : ``;

    // 9. Featured Image
    const imgMatch = content.match(/<div class="article-featured-image"[^>]*>[\s\S]*?<img\s+src=['"](.*?)['"]\s+alt=['"](.*?)['"]/);
    const imgStr = imgMatch ? `featuredImageSrc="${imgMatch[1]}" featuredImageAlt="${imgMatch[2].replace(/"/g, '&quot;')}"` : ``;

    // 10. Article Body (the actual unique content)
    // Find <div class="article-body"> ... up to the last </div></div></main></Layout>
    // We can just find <div class="article-body"> and get everything after it, then strip the closing tags
    const bodyIndex = content.indexOf('<div class="article-body">');
    if (bodyIndex === -1) throw new Error("No article-body found");
    
    let bodyContent = content.substring(bodyIndex + '<div class="article-body">'.length);
    // Remove trailing wrappers
    bodyContent = bodyContent.replace(/<\/div>\s*<\/div>\s*<\/main>\s*<\/Layout>\s*$/, '');
    // Also might just have </div></div></main></Layout>
    bodyContent = bodyContent.trim();
    if (bodyContent.endsWith('</Layout>')) {
        bodyContent = bodyContent.replace(/<\/div>[\s]*<\/div>[\s]*<\/main>[\s]*<\/Layout>$/, '');
    }
    bodyContent = bodyContent.trim();
    if (bodyContent.endsWith('</div>')) {
        bodyContent = bodyContent.slice(0, -6).trim();
    }


    // Build new file content
    const newContent = `---${frontmatter}---
<BlogLayout
  ${layoutProps}
  breadcrumbCurrent="${breadcrumbCurrent}"
  ${heroTagStr}
  heroTitle={\`${heroTitle.replace(/`/g, "\\`")}\`}
  heroLead={\`${heroLead.replace(/`/g, "\\`")}\`}
  date="${date}"
  readTime="${readTime}"
  ${statsStr}
  ${imgStr}
>
${bodyContent}
</BlogLayout>
`;

    fs.writeFileSync(f, newContent, 'utf8');
    processed++;
  } catch (err) {
    errors.push(`${f}: ${err.message}`);
  }
});

console.log(`Successfully refactored ${processed} files.`);
if (errors.length > 0) {
  console.log(`Failed on ${errors.length} files:`);
  console.log(errors.join('\n'));
}
