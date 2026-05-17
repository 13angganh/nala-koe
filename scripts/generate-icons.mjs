#!/usr/bin/env node
/**
 * scripts/generate-icons.mjs
 * Generates all required PWA icon sizes for NalaKoe.
 *
 * Usage: node scripts/generate-icons.mjs
 * Requires: sharp  →  npm install -D sharp
 *
 * Output: public/icons/icon-{size}x{size}.png  (8 sizes)
 *         public/icons/shortcut-new.png
 *         public/icons/shortcut-home.png
 *         public/apple-touch-icon.png
 *         public/favicon.ico  (32x32 fallback)
 */

import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.resolve(__dirname, '../public/icons');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// ─── Brand config ─────────────────────────────────────────────────────────────

const BRAND = {
  bg: '#0f172a',       // slate-900
  accent: '#0ea5e9',   // sky-500
  text: '#f8fafc',     // slate-50
  letter: 'N',
};

// ─── Canvas renderer ──────────────────────────────────────────────────────────

/**
 * Draw the NalaKoe icon on a canvas of the given size.
 * Design: dark background, rounded square shape, "N" monogram with accent underline dot.
 */
function drawIcon(canvas, size) {
  const ctx = canvas.getContext('2d');
  const r = size * 0.2; // border radius ratio

  // Background
  ctx.fillStyle = BRAND.bg;
  roundRect(ctx, 0, 0, size, size, r);
  ctx.fill();

  // Accent underline bar
  const barH = size * 0.05;
  const barW = size * 0.4;
  const barX = (size - barW) / 2;
  const barY = size * 0.68;
  ctx.fillStyle = BRAND.accent;
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW, barH, barH / 2);
  ctx.fill();

  // Monogram "N"
  ctx.fillStyle = BRAND.text;
  ctx.font = `bold ${size * 0.45}px Inter, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(BRAND.letter, size / 2, size * 0.44);
}

/** Draw a rounded rectangle path */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// ─── Generate icons ───────────────────────────────────────────────────────────

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

try {
  // Try using canvas package
  for (const size of ICON_SIZES) {
    const canvas = createCanvas(size, size);
    drawIcon(canvas, size);
    const buffer = canvas.toBuffer('image/png');
    const filename = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
    fs.writeFileSync(filename, buffer);
    console.log(`  ✓ icon-${size}x${size}.png`);
  }

  // Shortcut icons (96x96)
  const shortcutNew = createCanvas(96, 96);
  const ctxNew = shortcutNew.getContext('2d');
  ctxNew.fillStyle = BRAND.bg;
  roundRect(ctxNew, 0, 0, 96, 96, 18);
  ctxNew.fill();
  ctxNew.fillStyle = BRAND.accent;
  ctxNew.font = 'bold 56px sans-serif';
  ctxNew.textAlign = 'center';
  ctxNew.textBaseline = 'middle';
  ctxNew.fillText('+', 48, 48);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'shortcut-new.png'), shortcutNew.toBuffer('image/png'));
  console.log('  ✓ shortcut-new.png');

  const shortcutHome = createCanvas(96, 96);
  const ctxHome = shortcutHome.getContext('2d');
  ctxHome.fillStyle = BRAND.bg;
  roundRect(ctxHome, 0, 0, 96, 96, 18);
  ctxHome.fill();
  ctxHome.fillStyle = BRAND.accent;
  ctxHome.font = 'bold 52px sans-serif';
  ctxHome.textAlign = 'center';
  ctxHome.textBaseline = 'middle';
  ctxHome.fillText('⌂', 48, 50);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'shortcut-home.png'), shortcutHome.toBuffer('image/png'));
  console.log('  ✓ shortcut-home.png');

  // apple-touch-icon (180x180, saved to public/)
  const appleCanvas = createCanvas(180, 180);
  drawIcon(appleCanvas, 180);
  fs.writeFileSync(
    path.resolve(__dirname, '../public/apple-touch-icon.png'),
    appleCanvas.toBuffer('image/png')
  );
  console.log('  ✓ apple-touch-icon.png');

  console.log('\nAll icons generated successfully.');
} catch (e) {
  console.error('\n[generate-icons] Error:', e.message);
  console.error('Install canvas: npm install -D canvas');
  console.error('Or run: npm install -D sharp  and use the sharp version instead.');
  process.exit(1);
}
