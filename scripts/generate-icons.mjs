/**
 * @file generate-icons.mjs
 * @description public/icons/icon-source.svg → PNG 아이콘 세트 자동 생성
 *              + public/splash/ iPhone 해상도별 스플래시 생성
 * @usage node scripts/generate-icons.mjs
 */

import sharp from "sharp";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const ICONS_DIR = resolve(ROOT, "public/icons");
const SPLASH_DIR = resolve(ROOT, "public/splash");

if (!existsSync(ICONS_DIR)) mkdirSync(ICONS_DIR, { recursive: true });
if (!existsSync(SPLASH_DIR)) mkdirSync(SPLASH_DIR, { recursive: true });

const iconSvg = readFileSync(resolve(ICONS_DIR, "icon-source.svg"));
const maskableSvg = readFileSync(resolve(ICONS_DIR, "icon-maskable-source.svg"));

/** 표준 아이콘 사이즈 */
const iconTargets = [
  { name: "icon-192.png", size: 192, src: iconSvg },
  { name: "icon-512.png", size: 512, src: iconSvg },
  { name: "icon-maskable-192.png", size: 192, src: maskableSvg },
  { name: "icon-maskable-512.png", size: 512, src: maskableSvg },
  { name: "apple-touch-icon-180.png", size: 180, src: iconSvg },
  { name: "favicon-32.png", size: 32, src: iconSvg },
];

/** iPhone 스플래시 해상도 — CLAUDE.md 5.1 참고 */
const splashTargets = [
  { name: "splash-1290x2796.png", width: 1290, height: 2796 }, // iPhone 15 Pro Max / 16 Plus
  { name: "splash-1179x2556.png", width: 1179, height: 2556 }, // iPhone 15 / 16
  { name: "splash-750x1334.png", width: 750, height: 1334 }, // iPhone SE
];

async function generateIcons() {
  for (const t of iconTargets) {
    await sharp(t.src).resize(t.size, t.size).png().toFile(resolve(ICONS_DIR, t.name));
    console.log(`[icons] ${t.name} (${t.size}x${t.size})`);
  }
}

async function generateSplash() {
  // 스플래시 = 배경색 + 중앙에 icon(512) 배치
  const iconPng = await sharp(iconSvg).resize(512, 512).png().toBuffer();
  for (const t of splashTargets) {
    await sharp({
      create: {
        width: t.width,
        height: t.height,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .composite([
        {
          input: iconPng,
          gravity: "center",
        },
      ])
      .png()
      .toFile(resolve(SPLASH_DIR, t.name));
    console.log(`[splash] ${t.name} (${t.width}x${t.height})`);
  }
}

(async () => {
  await generateIcons();
  await generateSplash();
  console.log("✓ 아이콘/스플래시 생성 완료");
})();
