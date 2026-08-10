# C2 Club Blog & Web Portal Release Notes

## [v1.2.0] - 2026-08-10

### 🛡️ Security & Influencer Dashboard Hardening
- **Credential Hygiene**: Removed secret passcode persistence from `sessionStorage` in `influencer.astro` (only non-sensitive referral code retained for UX convenience).
- **CSV Injection Prevention**: Sanitized CSV exports against formula injection (`=`, `+`, `-`, `@`, `\t`, `\r`) by prefixing formula characters with single quotes.
- **XSS & DOM Hardening**: Replaced `innerHTML` rendering with safe DOM APIs (`replaceChildren`, text nodes) and enforced strict HTTPS image URL validation for avatars with fallback initials.

### 🌐 Portal Navigation & Data Deletion Compliance
- **Data Deletion Self-Service**: Upgraded `public/legal/data-deletion.html` with interactive Firebase Phone Authentication and self-serve Firestore deletion request submission.
- **Challenge View & Search**: Enhanced `challenge-view.astro` and `challenges.astro` with responsive metadata layout and instant category filtering.
- **Brand & Metadata Alignment**: Updated OpenGraph metadata tags in `Layout.astro` and navigation links in `MobileMenu.astro`.
