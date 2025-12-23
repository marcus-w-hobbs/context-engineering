#!/usr/bin/env node

/**
 * Capture Browser Screenshots
 * 
 * Takes screenshots at specified viewport sizes. Dimensions kept under
 * 2000px for compatibility with vision APIs.
 * 
 * Usage:
 *   ./screenshot.js              # Desktop viewport (1920×1080) [default]
 *   ./screenshot.js --desktop    # Desktop viewport (1920×1080)
 *   ./screenshot.js --mobile     # Mobile viewport (400×900)
 * 
 * Returns the path to the saved screenshot (temp file).
 */

import { tmpdir } from "node:os";
import { join } from "node:path";
import puppeteer from "puppeteer-core";
import { getCDPUrl } from "./cdp-port.js";

const flag = process.argv[2];

// Define viewport sizes (under 2000px limit for vision APIs)
const VIEWPORTS = {
    desktop: { width: 1920, height: 1080 },
    mobile: { width: 400, height: 900 },
};

if (flag === "--help" || flag === "-h") {
    console.log("Usage: screenshot.js [--mobile|--desktop]");
    console.log("\nOptions:");
    console.log("  (none)     Desktop viewport (1920×1080) [default]");
    console.log("  --desktop  Desktop viewport (1920×1080)");
    console.log("  --mobile   Mobile viewport (400×900)");
    console.log("\nExamples:");
    console.log("  ./screenshot.js           # Desktop screenshot");
    console.log("  ./screenshot.js --mobile  # Mobile screenshot");
    process.exit(0);
}

const viewport = flag === "--mobile" ? VIEWPORTS.mobile : VIEWPORTS.desktop;

const b = await puppeteer.connect({
    browserURL: getCDPUrl(),
    defaultViewport: null,
});

const p = (await b.pages()).at(-1);

if (!p) {
    console.error("✗ No active tab found");
    process.exit(1);
}

// Set viewport size
await p.setViewport(viewport);

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const filename = `screenshot-${timestamp}.png`;
const filepath = join(tmpdir(), filename);

await p.screenshot({ path: filepath });

console.log(filepath);

await b.disconnect();
