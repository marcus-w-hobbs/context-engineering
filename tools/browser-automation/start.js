#!/usr/bin/env node

/**
 * Start Chrome with Remote Debugging
 * 
 * Launches a Chrome instance with CDP (Chrome DevTools Protocol) enabled,
 * allowing programmatic control for autonomous visual debugging.
 * 
 * Usage:
 *   ./start.js              # Fresh profile (clean slate)
 *   ./start.js --profile    # Copy your profile (keeps cookies, logins)
 * 
 * For parallel agents, set CDP_PORT:
 *   CDP_PORT=9223 ./start.js
 */

import { spawn, execSync } from "node:child_process";
import puppeteer from "puppeteer-core";
import { getCDPPort } from "./cdp-port.js";

const useProfile = process.argv[2] === "--profile";
const port = getCDPPort();

if (process.argv[2] && process.argv[2] !== "--profile") {
    console.log("Usage: start.js [--profile]");
    console.log("\nOptions:");
    console.log("  --profile  Copy your default Chrome profile (cookies, logins)");
    console.log("\nExamples:");
    console.log("  ./start.js            # Start with fresh profile");
    console.log("  ./start.js --profile  # Start with your Chrome profile");
    process.exit(1);
}

// Kill existing Chrome (adjust for your OS)
try {
    execSync("killall 'Google Chrome'", { stdio: "ignore" });
} catch {}

// Wait for processes to fully terminate
await new Promise((r) => setTimeout(r, 1000));

// Setup profile directory
const homeDir = process.env["HOME"];
execSync("mkdir -p ~/.cache/scraping", { stdio: "ignore" });

if (useProfile) {
    // Sync profile with rsync (much faster on subsequent runs)
    // Adjust the source path for your OS
    execSync(
        `rsync -a --delete "${homeDir}/Library/Application Support/Google/Chrome/" ~/.cache/scraping/`,
        { stdio: "pipe" },
    );
}

// Start Chrome in background (detached so Node can exit)
// Adjust the Chrome path for your OS:
//   macOS: /Applications/Google Chrome.app/Contents/MacOS/Google Chrome
//   Linux: google-chrome or chromium-browser
//   Windows: C:\Program Files\Google\Chrome\Application\chrome.exe
spawn(
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    [`--remote-debugging-port=${port}`, `--user-data-dir=${homeDir}/.cache/scraping`],
    { detached: true, stdio: "ignore" },
).unref();

// Wait for Chrome to be ready by attempting to connect
let connected = false;
for (let i = 0; i < 30; i++) {
    try {
        const browser = await puppeteer.connect({
            browserURL: `http://localhost:${port}`,
            defaultViewport: null,
        });
        await browser.disconnect();
        connected = true;
        break;
    } catch {
        await new Promise((r) => setTimeout(r, 500));
    }
}

if (!connected) {
    console.error("✗ Failed to connect to Chrome");
    process.exit(1);
}

console.log(`✓ Chrome started on :${port}${useProfile ? " with your profile" : ""}`);
