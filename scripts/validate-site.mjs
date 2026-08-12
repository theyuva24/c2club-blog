import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const failures = [];

function read(relativePath) {
  return readFileSync(join(root, relativePath), 'utf8');
}

function filesUnder(relativeDir) {
  const absoluteDir = join(root, relativeDir);
  const files = [];
  function walk(directory) {
    for (const entry of readdirSync(directory)) {
      const absolutePath = join(directory, entry);
      if (statSync(absolutePath).isDirectory()) {
        walk(absolutePath);
      } else {
        files.push(absolutePath);
      }
    }
  }
  walk(absoluteDir);
  return files;
}

for (const file of [...filesUnder('src'), ...filesUnder('public')]) {
  if (!/\.(astro|html)$/i.test(file)) continue;
  const source = readFileSync(file, 'utf8');
  for (const match of source.matchAll(/<a\b[^>]*target=["']_blank["'][^>]*>/gi)) {
    const tag = match[0];
    if (!/rel=["'][^"']*\bnoopener\b[^"']*\bnoreferrer\b[^"']*["']/i.test(tag)) {
      failures.push(`${relative(root, file)} has an unsafe target=_blank link`);
    }
  }
}

const influencer = read('src/pages/influencer.astro');
if (influencer.includes('influencer_passcode')) {
  failures.push('Influencer passcode persistence was reintroduced');
}

const deletionPortal = read('public/legal/data-deletion.html');
for (const field of ['userEmail:', 'userPhone:', 'userCollege:', 'userCourse:']) {
  if (deletionPortal.includes(field)) {
    failures.push(`Deletion request contains unnecessary PII field ${field}`);
  }
}
if (!deletionPortal.includes("status === 'completed'")) {
  failures.push('Deletion success is not tied to an explicit completed status');
}

if (!existsSync(join(root, 'public', '_headers'))) {
  failures.push('Cloudflare security headers file is missing');
}

const layout = read('src/layouts/Layout.astro');
if (layout.includes('is:inline>{JSON.stringify(')) {
  failures.push('Structured data would be emitted as literal template text instead of JSON');
}
if (/['"]@type['"]\s*:\s*['"]SearchAction['"]/.test(layout)) {
  if (!existsSync(join(root, 'src/pages/search.astro'))) {
    failures.push('Structured data advertises a search route that does not exist');
  }
  if (!layout.includes('https://c2club.in/search/?q={search_term_string}')) {
    failures.push('SearchAction does not target the canonical search route');
  }
}

for (const requiredAsset of [
  'public/favicon.svg',
  'public/favicon-32.png',
  'public/apple-touch-icon.png',
  'public/icon-192.png',
  'public/icon-512.png',
  'public/manifest.json',
  'public/opensearch.xml',
  'public/llms.txt'
]) {
  if (!existsSync(join(root, requiredAsset))) {
    failures.push(`Required discovery asset is missing: ${requiredAsset}`);
  }
}

if (!layout.includes('rel="manifest"') || !layout.includes('rel="search"')) {
  failures.push('Manifest or OpenSearch discovery link is missing from the shared layout');
}

try {
  const manifest = JSON.parse(read('public/manifest.json'));
  const sizes = new Set((manifest.icons || []).map((icon) => icon.sizes));
  if (!sizes.has('192x192') || !sizes.has('512x512')) {
    failures.push('Web app manifest is missing required 192px or 512px icons');
  }
} catch {
  failures.push('Web app manifest is not valid JSON');
}

if (failures.length) {
  console.error(`Website validation failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log('Website security and link checks passed.');
