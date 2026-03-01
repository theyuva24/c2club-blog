# C2Club Blog

A student-first peer learning platform with blog content.

## Development

**CRITICAL: The development server MUST be run from the `public` directory for correct routing:**

```bash
cd public
npx serve .
```

**FAILURE NOTICE: If you run `npx serve .` from the root directory (where this README.md is located), you WILL get 404 errors for `/blog/` and other routes.**

The directory structure is:
- Root directory (where you are now): Contains project files like README.md, netlify.toml, etc.
- `public/` directory: Contains the actual website that gets deployed to Netlify

The development server must be started from the `public` directory to match how the site is deployed on Netlify.

Or alternatively, you can use Python's built-in server:

```bash
cd public
python -m http.server 8000
```

## Deployment

This site is configured for deployment to Netlify. The `public` directory is the build output directory.

## Structure

- `public/` - Static HTML files
  - `blog/` - Blog posts and index
  - `images/` - Image assets
  - `_redirects` - Netlify redirect configuration
- `netlify.toml` - Netlify configuration

## Features

- Clean, institutional black-white theme with neon accents
- Responsive design
- Blog section with multiple posts
- FAQ section with collapsible questions
- Student-focused content and navigation