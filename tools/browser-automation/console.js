#!/usr/bin/env node

/**
 * Capture Browser Console Logs
 * 
 * Streams console logs in real-time with color-coded output:
 * - Errors in red
 * - Warnings in yellow
 * - Info in cyan
 * 
 * Usage:
 *   ./console.js
 * 
 * Press Ctrl+C to stop.
 */

import puppeteer from "puppeteer-core";
import { getCDPUrl, getCDPPort } from "./cdp-port.js";

async function getConsoleLogs() {
    try {
        // Connect to existing Chrome instance
        const browser = await puppeteer.connect({
            browserURL: getCDPUrl(),
            defaultViewport: null,
        });

        // Get the active page
        const pages = await browser.pages();
        if (pages.length === 0) {
            console.error("No pages found");
            process.exit(1);
        }

        // Use the most recently focused page
        const page = pages[pages.length - 1];
        const url = page.url();

        console.log(`📋 Capturing console logs from: ${url}\n`);
        console.log("Listening for console messages (press Ctrl+C to stop)...\n");
        console.log("─".repeat(60));

        // Set up console event listener
        page.on("console", (msg) => {
            const type = msg.type();
            const text = msg.text();
            const location = msg.location();

            // Format the output with colors and symbols
            let symbol = "•";
            let prefix = "";

            switch(type) {
                case "error":
                    symbol = "❌";
                    prefix = "\x1b[31m"; // red
                    break;
                case "warning":
                    symbol = "⚠️";
                    prefix = "\x1b[33m"; // yellow
                    break;
                case "info":
                    symbol = "ℹ️";
                    prefix = "\x1b[36m"; // cyan
                    break;
                case "debug":
                    symbol = "🐛";
                    prefix = "\x1b[35m"; // magenta
                    break;
                case "log":
                default:
                    symbol = "📝";
                    prefix = "\x1b[0m"; // default
                    break;
            }

            const reset = "\x1b[0m";
            const time = new Date().toLocaleTimeString();

            console.log(`${prefix}[${time}] ${symbol} ${type.toUpperCase()}:${reset} ${text}`);

            // Show source location if available
            if (location.url) {
                const locationStr = `   └─ ${location.url}:${location.lineNumber}:${location.columnNumber}`;
                console.log(`\x1b[90m${locationStr}${reset}`);
            }

            // Try to get full arguments for complex objects
            msg.args().forEach(async (arg, i) => {
                try {
                    const value = await arg.jsonValue();
                    if (typeof value === "object" && value !== null && Object.keys(value).length > 0) {
                        console.log(`   └─ arg[${i}]:`, JSON.stringify(value, null, 2));
                    }
                } catch (e) {
                    // Some objects can't be serialized, that's ok
                }
            });

            console.log("─".repeat(60));
        });

        // Also listen for page errors
        page.on("pageerror", (error) => {
            console.log("\x1b[31m[PAGE ERROR]:\x1b[0m", error.message);
            console.log("─".repeat(60));
        });

        // Listen for request failures
        page.on("requestfailed", (request) => {
            console.log(`\x1b[31m[REQUEST FAILED]:\x1b[0m ${request.failure().errorText} - ${request.url()}`);
            console.log("─".repeat(60));
        });

        // Keep the script running
        await new Promise(() => {});

    } catch (error) {
        const port = getCDPPort();
        console.error("Failed to connect to Chrome:", error.message);
        console.error(`\nMake sure Chrome is running with remote debugging on port ${port}`);
        console.error("You can start it with: ./start.js");
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
    console.log("\n\n👋 Stopped capturing console logs");
    process.exit(0);
});

// Run the function
getConsoleLogs();
