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
    } else if (file.endsWith('.astro')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src/pages');
let count = 0;
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  const oldLen = content.length;
  // Match space + data-astro-cid-XXXXXX="" or just data-astro-cid-XXXXXX
  content = content.replace(/\s?data-astro-cid-[a-zA-Z0-9]+(="")?/g, '');
  if (content.length !== oldLen) {
    fs.writeFileSync(f, content, 'utf8');
    count++;
  }
});
console.log(`Cleaned ${count} files.`);
