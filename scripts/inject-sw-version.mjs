#!/usr/bin/env node
// scripts/inject-sw-version.mjs
//
// Stamps public/sw.js's CACHE_VERSION with the current package.json
// version before every build. This is what makes a new deploy actually
// reach users who already have the PWA installed: the service worker file
// previously had a hardcoded CACHE_VERSION = 'v1' that never changed
// between releases, so browsers never detected sw.js as "new" (byte-for-
// byte identical file = no update event fires), kept serving the OLD
// cached JS bundles via the script/style/font CacheFirst strategy, and the
// app silently kept running old code even though Vercel had successfully
// deployed the new version.
//
// Run automatically via the "prebuild" npm script — never edit
// CACHE_VERSION in public/sw.js by hand.

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf-8'));
const swPath = join(root, 'public', 'sw.js');
const swSource = readFileSync(swPath, 'utf-8');

const versionLinePattern = /const CACHE_VERSION = '[^']*';/;

if (!versionLinePattern.test(swSource)) {
  console.error('[inject-sw-version] Could not find CACHE_VERSION line in public/sw.js — aborting.');
  process.exit(1);
}

const stamped = swSource.replace(versionLinePattern, `const CACHE_VERSION = '${pkg.version}';`);

writeFileSync(swPath, stamped, 'utf-8');
console.log(`[inject-sw-version] public/sw.js CACHE_VERSION -> ${pkg.version}`);
