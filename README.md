# C2 Club Blog (Astro Edition)

A student-first peer learning platform with blog content, built using [Astro](https://astro.build/).

## 🚀 Project Structure

This project has been reorganized into a standard Astro structure at the root level:

```text
/
├── public/          # Static assets (images, fonts, deep link verification files, etc.)
│   ├── .well-known/ # Android App verification files
│   ├── images/      # Blog images
│   ├── style.css    # Global stylesheet
│   └── _redirects   # Hosting redirect configurations
├── src/
│   ├── components/  # Reusable Astro components (Header, Footer, SeriesBox, etc.)
│   ├── layouts/     # Page layout templates
│   └── pages/       # Astro page files (index, blog pages, challenges, etc.)
├── dist/            # Compiled static site (generated during build)
├── scripts/         # Utility and build orchestration scripts
├── package.json     # Node.json scripts and dependencies
└── wrangler.jsonc   # Cloudflare Pages deployment configuration
```

## 🧞 Commands

All commands should be run from the root of the project:

| Command | Action |
| :--- | :--- |
| `npm install` | Installs dependencies |
| `npm run dev` | Starts local dev server at `localhost:4321` |
| `npm run build` | Builds the production site to `./dist/` |
| `npm run preview` | Previews the build locally |

## 🔗 Deep Links & Android Integration

The project includes deep link configuration files in `public/` that are served at the root:
- `public/.well-known/assetlinks.json` - Used by the Android app for App Links verification.
- `public/.well-known/apple-app-site-association` - Used for iOS Universal Links.
- `public/redirect.html` - Handles client-side intent routing for Android App deep linking.
- `public/deeplink-fallback.js` - Dynamic Smart App Banner fallback logic.

These files are copied verbatim into the production bundle root (`dist/`) during build, ensuring the deep linking integration remains active and uninterrupted.