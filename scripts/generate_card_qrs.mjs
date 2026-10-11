import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

// 12 Archetypes from cards/index.html
const ARCHETYPES = [
  { slug: "social-butterfly", name: "Social Butterfly", cardColor: "#D3C2FF", inkColor: "#052E22" },
  { slug: "topper", name: "Topper", cardColor: "#FFC83D", inkColor: "#052E22" },
  { slug: "canteen-commander", name: "Canteen Commander", cardColor: "#FF8A2B", inkColor: "#052E22" },
  { slug: "3am-debugger", name: "3AM Debugger", cardColor: "#052E22", inkColor: "#052E22", dark: true },
  { slug: "professors-favorite", name: "Professor's Favorite", cardColor: "#BFF5DC", inkColor: "#052E22" },
  { slug: "last-bench-strategist", name: "Last Bench Strategist", cardColor: "#12A39A", inkColor: "#052E22" },
  { slug: "campus-politician", name: "Campus Politician", cardColor: "#C6F432", inkColor: "#052E22" },
  { slug: "attendance-calculator", name: "Attendance Calculator", cardColor: "#FFEE8C", inkColor: "#052E22" },
  { slug: "silent-genius", name: "Silent Genius", cardColor: "#06303A", inkColor: "#06303A", dark: true },
  { slug: "assignment-survivor", name: "Assignment Survivor", cardColor: "#E23D35", inkColor: "#052E22" },
  { slug: "campus-influencer", name: "Campus Influencer", cardColor: "#FF7EB6", inkColor: "#052E22" },
  { slug: "all-rounder", name: "All Rounder", cardColor: "#2F6BFF", inkColor: "#052E22" }
];

const BASE_URL = "https://c2club.in/cards";

async function generateAll() {
  const transparentDir = path.resolve('public/cards/qrs_transparent');
  const customColorDir = path.resolve('public/cards/qrs_colored');

  fs.mkdirSync(transparentDir, { recursive: true });
  fs.mkdirSync(customColorDir, { recursive: true });

  for (const a of ARCHETYPES) {
    const url = `${BASE_URL}/${a.slug}?s=qr`;

    // 1. High-Contrast Pure Black with Transparent Background (Universal compatibility)
    await QRCode.toFile(path.join(transparentDir, `${a.slug}.png`), url, {
      errorCorrectionLevel: 'H',
      type: 'png',
      quality: 1.0,
      margin: 2,
      width: 2048,
      color: {
        dark: '#000000FF',
        light: '#00000000' // 100% Transparent
      }
    });

    const svgPure = await QRCode.toString(url, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: 2,
      color: {
        dark: '#000000',
        light: '#00000000' // 100% Transparent
      }
    });
    fs.writeFileSync(path.join(transparentDir, `${a.slug}.svg`), svgPure);

    // 2. Custom Branded Color with Transparent Background
    await QRCode.toFile(path.join(customColorDir, `${a.slug}.png`), url, {
      errorCorrectionLevel: 'H',
      type: 'png',
      quality: 1.0,
      margin: 2,
      width: 2048,
      color: {
        dark: a.inkColor,
        light: '#00000000' // 100% Transparent
      }
    });

    const svgCustom = await QRCode.toString(url, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: 2,
      color: {
        dark: a.inkColor,
        light: '#00000000'
      }
    });
    fs.writeFileSync(path.join(customColorDir, `${a.slug}.svg`), svgCustom);

    console.log(`Generated QR for ${a.name} (${a.slug})`);
  }
  console.log('All QRs generated successfully!');
}

generateAll().catch(console.error);
