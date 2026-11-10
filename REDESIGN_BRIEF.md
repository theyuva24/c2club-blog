# c2club.in redesign brief

Written 10 Nov 2026. Nothing in the site has been changed yet. This is the audit, the plan and the decisions needed before the build starts.

## 1. What the website is for

The app is the product. The website is how students find it. Every page has one job: someone lands from Google, a QR card or a shared link, understands in five seconds what C2 Club is and who it is for, and taps through to the Play Store with their referral or card still attached.

So the site is judged on one number: visits that end in a Play Store tap. Everything else (blog, guides, legal) exists to bring the right student in or to satisfy Play Store rules.

## 2. What must not break (the deep link layer)

These work today and stay exactly as they are. The redesign only restyles the screens around them.

| Piece | File | What it does |
|---|---|---|
| Android App Links verification | `public/.well-known/assetlinks.json` | Lets `c2club.in/...` links open the app directly |
| iOS association | `public/.well-known/apple-app-site-association` | Ready for an iOS app later |
| Link router | `public/redirect.html` | `/challenge/*`, `/entry/*`, `/post/*`, `/user/*`, `/hub/*`, `/ref/*`, `/app` open the app via intent, or send to Play Store with `ref=` and `hub=` in the install referrer |
| Route rules | `public/_redirects` (Cloudflare) | Sends those paths to `redirect.html`; also the legal and old blog 301s |
| Referral banner | `public/deeplink-fallback.js` | Smart banner on Android carrying `?ref=` to Play Store (the file exists but no page loads it today; check before relying on it) |
| Card scan flow | `src/pages/cards/[slug].astro` | QR on the C2 Deck card lands here, passes `card_<slug>` to Play Store referrer |
| Download page referral | `src/pages/download.astro` | Reads `?ref=`, rewrites the Play button, auto-redirects after 1.5 s |
| Legal pages | `public/legal/*` | Privacy, terms, account deletion, safety standards. Play Store requires these URLs to stay live |

Rule for the build: the logic in those files is copied, never rewritten. Only markup and CSS change. After the build, every route above is tested on an Android phone with and without the app installed.

Note: `netlify.toml` repeats the redirect rules, but the site is deployed on Cloudflare (`wrangler.jsonc`). It is probably unused. Leave it until hosting is confirmed.

## 3. What is wrong today

### Communication
- **It sells features the app no longer has.** The home page, header and a whole section push Challenges and "the Arena". Challenges were removed from the app in October 2026. A student who installs for that finds nothing.
- **It talks like a chat app.** "Find your people", "meet the whole network", "beyond the campus bubble" are the exact phrases the Play Store plan (7 Nov) says to drop because they group C2 Club with chat and dating apps.
- **No single message.** The hero, four pain cards, three feature cards, three steps, an arena strip, six blog cards and an FAQ all compete. The vision document has one sharp idea and the site never says it.
- **Made-up signals.** "Campus signal live", "No ads", a stock hero image of "students connecting". Nothing on the page is real (no real app screen, no real hub, no real student).
- **Target is vague.** "Karnataka students" everywhere. The audience is the ambitious tier 2 and tier 3 student on their own (Dharwad, Hubballi, Belagavi, Mysuru, Davangere).

### Design
- Two stylesheets stacked (`style.css` + `site-refresh.css`) on top of each other: a refresh painted over the old site.
- Four different greens: `#39FF14` neon (banner, redirect page), `#63f28c` (header), `#22c55e` (favicon), emerald in the app. The app's real identity is black and white with one emerald accent.
- Serif display font (DM Serif Display) that feels like a magazine, not like the app.
- Download page has emoji feature cards, a literal "QR Code Here" placeholder box and "iOS coming soon".
- Redirect screen is a black page with a neon spinner: the first thing a student sees from a shared link.

### Icon (what shows in Google results and browser tabs)
- `favicon.svg` is a green circle with "C2" typed as text in a web font. Fonts do not load inside favicons, so it renders in a fallback font and looks different from the real logo.
- The real app icon (`public/app-icon.png`) is a bold black C2 on white. The site icon should be that mark, drawn as paths, in every size Google uses: `favicon.ico` (48x48 multiple), `favicon.svg`, 32, 180 (Apple), 192 and 512 (manifest). Google needs the icon at a stable URL and square at 48px or larger.
- `theme-color` is a pale green (`#f5f7f2`); it should match the new background.
- The Android referral banner uses `/favicon.ico` and the line "Get the full student experience". Both change.

## 4. The message (from the marketing folder)

The vision document states it in one line: other places are a stream, C2 Club is memory. Everything a student needs (answers from seniors, notes, teammates, opportunities) already exists around them; C2 Club makes it findable and keeps it for the next batch.

Copy rules that apply to the site (from `marketing/README.md` and memory):
- Never name any other platform. Say "group chats", not the brand.
- No em dashes.
- Calm, clear, practical. Student words, not marketing words: "which college", "seniors", "PYQs", "hackathon team", "placements", not "holistic", "ecosystem", "unlock".
- Never promise what the app does not have yet (team finding and competition details are an open product question).
- All download links go to the Play Store listing.

**Decision needed (see section 8):** which promise leads the hero.

| Option | Hero line (draft) | Fits | Risk |
|---|---|---|---|
| A. Memory | "Your seniors already know the answer. Now you can find it." | Vision document, Memory-first launch order | Hubs need real answers in them before this is true |
| B. Teams | "Find a team for your next hackathon." | Play Store plan of 7 Nov, weak competition for "hackathon" | App may not have team finding built yet |
| C. Both, layered | Hero on Memory, second section on hackathons and teams | Matches vision and ASO | Slightly longer page |

My recommendation is C: lead with the bigger idea the founder actually believes, and let the Play-Store keyword promise live one scroll down.

## 5. New site map

| Page | Keep / change / drop | Why |
|---|---|---|
| `/` Home | Rebuild | One message, real app screens, one CTA repeated |
| `/download` | Rebuild | The conversion page: Android detects and goes straight to Play; desktop shows a real QR to the listing |
| Link router screen (`redirect.html`) | Restyle only | Branded "Opening C2 Club" with the real logo, not a neon spinner |
| `/cards/[slug]` | Keep as is | Its own playful card world, already works, linked from printed cards |
| `/blog` and the 16 "What after PUC" guides | Keep content, new template | These are the discovery engine for Google; restyle and add an app CTA that matches each guide |
| `/guides/[slug]` | Keep, new template | Same reason |
| `/challenges`, `/challenge-view`, Arena | Hide from nav, keep the URLs working | Feature is removed from the app; old shared links still need to land somewhere honest |
| `/search` | Drop from nav | Not a reason to install; footer link at most |
| `/contact` | Move to footer | Same |
| `/influencer`, `campus-leader-guide.html` | Noindex, footer only | Programs are stopped |
| `/legal/*` | Restyle to match | Required by Play Store |

Nav becomes: logo, Guides, Get the app. That is all.

## 6. Home page structure (draft)

1. **Hero.** One line, one sentence under it, one button "Get it on Google Play", the real app on a phone. Small line under the button: "Free. Made for students in Karnataka's colleges."
2. **The problem in one picture.** A group chat scroll where the useful message sinks, next to the same question answered and pinned in a C2 Club hub.
3. **What you get** as three real app screens, each with a plain caption: your college hub, ask seniors, hackathons and teams (only what is live).
4. **Who it is for.** Named towns and colleges (Dharwad, Hubballi, Belagavi, Mysuru, Davangere), so a tier 2 student sees themselves.
5. **Guides.** Three guides for the season (results and career now, college choice from April).
6. **Final CTA** with the QR for desktop visitors.

No FAQ wall, no fake stats, no stock photos.

## 7. Design direction (updated 10 Nov 2026 after founder feedback)

**Decided:** hero promise is option C (Memory first, hackathons and teams one scroll down).

**Founder direction:** the site should feel fully animated and quirky, bright and colourful, because the audience is students. Colour stays inside the brand.

- **Colour:** emerald stays the anchor colour. Brightness comes from within the brand: emerald tints and shades, black and white, plus (to confirm) the card archetype palette as playful accents, since those colours are already part of C2 Club's printed identity.
- **Type:** one geometric sans close to the app (the app UI looks like Poppins). Big, chunky headlines with personality; plain body. No serif.
- **Imagery:** real app screens in phone frames, the mascot as a recurring character, card art as stickers.
- **Motion:** animated throughout. Hero entrance, sticker-like elements that react to scroll and touch, playful hovers and presses. Built with the installed motion skills (emil-design-eng, animate, choreograph) so it stays smooth.
- **Guardrails:** motion uses only cheap properties (transform, opacity) so budget Android phones stay smooth; respects reduced-motion settings; the Play Store button is never delayed or hidden by an animation.
- **Mobile first:** most visitors are on Android in an in-app browser. Design at 360px wide first.

## 8. Decisions for you

1. ~~Which hero promise~~ Decided: C.
2. Is team finding live in the app today? If not, the hackathon section waits.
3. Confirm the old challenge links should land on a short "Challenges are paused, here is what is in the app now" page.
4. Plugins to install for the build (shown as a card in chat): Anthropic `frontend-design`, the `Design` plugin (UX copy, critique, accessibility), and optionally `VectorLab UI/UX` (anti-slop checks) and `SearchFit SEO` (Google result appearance). Add any you want to recommend.

## 9. Build order once decided

1. New design tokens and one stylesheet; retire `style.css` + `site-refresh.css` page by page.
2. Icon set from the real logo, manifest, theme colour, OG image.
3. Home and download pages.
4. Restyle redirect screen and the Android banner (logic untouched).
5. Blog and guide template.
6. Nav, footer, hide stale pages.
7. Test every deep link route on Android (app installed and not installed), check Lighthouse on mobile, deploy.
