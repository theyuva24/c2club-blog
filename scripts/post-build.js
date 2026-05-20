import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

console.log('Running post-build script...');

// Mirror dist/blog.html to dist/blog/index.html
const builtBlogHtml = path.join(distDir, 'blog.html');
const targetBlogIndexHtml = path.join(distDir, 'blog', 'index.html');

if (fs.existsSync(builtBlogHtml)) {
  console.log('Mirroring dist/blog.html to dist/blog/index.html...');
  const blogDir = path.dirname(targetBlogIndexHtml);
  if (!fs.existsSync(blogDir)) {
    fs.mkdirSync(blogDir, { recursive: true });
  }
  fs.copyFileSync(builtBlogHtml, targetBlogIndexHtml);
  console.log('Blog mirrored successfully inside dist!');
} else {
  console.warn('Warning: dist/blog.html not found, skipping mirror step.');
}
