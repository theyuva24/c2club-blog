const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const publicDir = path.join(__dirname, 'public');

function copyDirSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  fs.readdirSync(src).forEach((childItemName) => {
    const srcPath = path.join(src, childItemName);
    const destPath = path.join(dest, childItemName);
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

// 1. Copy style.css
const styleSrc = path.join(rootDir, 'style.css');
const styleDest = path.join(publicDir, 'style.css');
if (fs.existsSync(styleSrc)) {
  fs.copyFileSync(styleSrc, styleDest);
  console.log('Copied style.css to public/style.css');
}

// 2. Copy images/ folder
const imagesSrc = path.join(rootDir, 'images');
const imagesDest = path.join(publicDir, 'images');
if (fs.existsSync(imagesSrc)) {
  copyDirSync(imagesSrc, imagesDest);
  console.log('Copied images/ directory to public/images/');
}

console.log('Static assets centralization complete!');
