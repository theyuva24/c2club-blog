const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

async function fixDates() {
  const { blogPosts } = await import(pathToFileURL(path.resolve('src/data/blogPosts.js')).href);

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
  let count = 0;
  
  files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    
    // Find the pageTitle in the file
    const titleMatch = content.match(/const pageTitle\s*=\s*['"](.*?)['"]/);
    if (titleMatch) {
      const pageTitle = titleMatch[1];
      
      // Find matching post in blogPosts.js
      // The pageTitle might have " | C2 Club" appended
      const baseTitle = pageTitle.replace(' | C2 Club', '');
      const post = blogPosts.find(p => p.title === baseTitle || pageTitle.includes(p.title) || p.title.includes(baseTitle.substring(0, 20)));
      
      if (post) {
        // Replace date="Date" with date="post.date"
        content = content.replace(/date="Date"/, `date="${post.date}"`);
        content = content.replace(/date=".*?"/, `date="${post.date}"`);
        
        content = content.replace(/readTime="5 min read"/, `readTime="${post.readTime}"`);
        content = content.replace(/readTime=".*?"/, `readTime="${post.readTime}"`);
        
        fs.writeFileSync(f, content, 'utf8');
        count++;
      } else {
        console.log(`Could not find matching post in data for title: ${pageTitle}`);
      }
    }
  });
  console.log(`Fixed dates in ${count} files.`);
}

fixDates().catch(console.error);
