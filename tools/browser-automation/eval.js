#!/usr/bin/env node

/**
 * Evaluate JavaScript in Browser
 * 
 * Execute any JavaScript in the active tab. Runs in async context.
 * 
 * Usage:
 *   ./eval.js 'document.title'
 *   ./eval.js 'document.querySelectorAll("a").length'
 *   ./eval.js 'getComputedStyle(document.querySelector(".btn")).backgroundColor'
 */

import puppeteer from "puppeteer-core";
import { getCDPUrl } from "./cdp-port.js";

const code = process.argv.slice(2).join(" ");
if (!code) {
    console.log("Usage: eval.js 'code'");
    console.log("\nExamples:");
    console.log('  ./eval.js "document.title"');
    console.log('  ./eval.js "document.querySelectorAll(\'a\').length"');
    console.log('  ./eval.js "window.scrollTo(0, 1000)"');
    process.exit(1);
}

const b = await puppeteer.connect({
    browserURL: getCDPUrl(),
    defaultViewport: null,
});

const p = (await b.pages()).at(-1);

if (!p) {
    console.error("✗ No active tab found");
    process.exit(1);
}

const result = await p.evaluate((c) => {
    const AsyncFunction = (async () => {}).constructor;
    return new AsyncFunction(`return (${c})`)();
}, code);

if (Array.isArray(result)) {
    for (let i = 0; i < result.length; i++) {
        if (i > 0) console.log("");
        for (const [key, value] of Object.entries(result[i])) {
            console.log(`${key}: ${value}`);
        }
    }
} else if (typeof result === "object" && result !== null) {
    for (const [key, value] of Object.entries(result)) {
        console.log(`${key}: ${value}`);
    }
} else {
    console.log(result);
}

await b.disconnect();
