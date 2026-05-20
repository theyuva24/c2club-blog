const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'dist');
const destDir = path.join(__dirname, '..');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    // Skip map files if you don't want them in production, but copying is fine
    fs.copyFileSync(src, dest);
  }
}

if (fs.existsSync(srcDir)) {
  console.log('Copying build output from astro-src/dist to repository root...');
  copyRecursiveSync(srcDir, destDir);
  
  // Mirror blog.html to blog/index.html
  const builtBlogHtml = path.join(srcDir, 'blog.html');
  const targetBlogIndexHtml = path.join(destDir, 'blog', 'index.html');
  if (fs.existsSync(builtBlogHtml)) {
    console.log('Mirroring blog.html to blog/index.html...');
    const blogDir = path.dirname(targetBlogIndexHtml);
    if (!fs.existsSync(blogDir)) {
      fs.mkdirSync(blogDir, { recursive: true });
    }
    fs.copyFileSync(builtBlogHtml, targetBlogIndexHtml);
  }
  
  console.log('Build output copied successfully!');
} else {
  console.error('Error: Build directory "dist" does not exist. Run astro build first.');
}
