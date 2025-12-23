# Browser Automation Tools

**Give agents eyes and hands—via CLI, not protocols.**

## The Problem

MCP (Model Context Protocol) has overhead. Each tool call requires:
- Protocol negotiation
- JSON-RPC framing
- Connection management

For rapid visual debugging (screenshot → inspect → fix → screenshot), this overhead compounds.

## The Solution

Local CLI tools with **zero protocol overhead**:
- Direct Puppeteer connection to Chrome DevTools Protocol (CDP)
- Simple stdin/stdout interface
- **CDP_PORT environment variable enables parallel agents**

## The Key Innovation: Parallel Agent Support

```bash
# Agent 1 (default port 9222)
./start.js

# Agent 2 (port 9223)  
CDP_PORT=9223 ./start.js

# Agent 3 (port 9224)
CDP_PORT=9224 ./start.js
```

All tools respect `CDP_PORT`, so multiple AI agents can run separate Chrome instances simultaneously without collision.

See [browser-automation/cdp-port.js](./browser-automation/cdp-port.js) for the implementation.

---

## Tools Reference

| Tool | Purpose | Usage |
|------|---------|-------|
| `start.js` | Start Chrome with remote debugging | `./start.js` |
| `nav.js` | Navigate to URL | `./nav.js http://localhost:5173` |
| `screenshot.js` | Capture screenshot | `./screenshot.js --mobile` |
| `eval.js` | Run JavaScript in browser | `./eval.js 'document.title'` |
| `pick.js` | Interactive element picker | `./pick.js "Click the broken element"` |
| `console.js` | Capture console output | `./console.js` |

### start.js - Launch Chrome

```bash
./start.js              # Fresh profile (clean slate)
./start.js --profile    # Copy your profile (keeps cookies, logins)
```

### nav.js - Navigate

```bash
./nav.js http://localhost:5173/dashboard      # Navigate current tab
./nav.js http://localhost:5173/forms --new    # Open new tab
```

### screenshot.js - Capture Screenshots

```bash
./screenshot.js              # Desktop viewport (1920×1080) - default
./screenshot.js --desktop    # Desktop viewport (1920×1080)
./screenshot.js --mobile     # Mobile viewport (400×900)
```

Returns filepath to saved screenshot. Dimensions kept under 2000px for vision API compatibility.

### eval.js - Execute JavaScript

```bash
./eval.js 'document.title'
./eval.js 'document.querySelectorAll("button").length'
./eval.js 'getComputedStyle(document.querySelector(".card")).backgroundColor'
./eval.js 'window.scrollTo(0, 1000)'
```

### pick.js - Interactive Element Picker

```bash
./pick.js "Click the submit button"
./pick.js "Select the element with incorrect styling"
```

Opens an interactive overlay:
- Hover to highlight elements
- Click to select
- Cmd/Ctrl+Click for multi-select
- Enter to confirm, ESC to cancel

Returns element info: tag, id, class, text, html, parents.

### console.js - Capture Console Logs

```bash
./console.js
```

Streams console logs in real-time with color-coded output. Press Ctrl+C to stop.

---

## Installation

```bash
cd tools/browser-automation
npm install
chmod +x *.js
```

---

## Example Workflow: Autonomous Visual Debugging

```bash
# 1. Start Chrome
./start.js

# 2. Navigate to page with issue
./nav.js http://localhost:5173/forms

# 3. Screenshot to see current state
./screenshot.js
# Agent views screenshot, identifies visual issues

# 4. Find specific elements
./eval.js 'Array.from(document.querySelectorAll("*")).find(el => 
  getComputedStyle(el).color === "rgb(255, 105, 180)")?.className'

# 5. Agent fixes source code

# 6. Screenshot to verify fix
./screenshot.js
# Agent compares before/after

# 7. Repeat until all issues resolved
```

---

## Responsive Testing

```bash
# Desktop verification
./screenshot.js --desktop

# Mobile verification  
./screenshot.js --mobile

# Scroll and capture tall pages
./eval.js 'window.scrollTo(0, 0)'
./screenshot.js --mobile     # Top section

./eval.js 'window.scrollTo(0, 900)'
./screenshot.js --mobile     # Second section

./eval.js 'window.scrollTo(0, 1800)'
./screenshot.js --mobile     # Third section
```

---

## Why CLI Over MCP?

| Aspect | MCP | Local CLI |
|--------|-----|-----------|
| Setup | Register all tools upfront | Tools available on demand |
| Overhead | Protocol negotiation (~100-200ms) | Zero overhead (~10-20ms) |
| Parallel | Complex configuration | Simple (CDP_PORT) |
| Portability | Protocol-dependent | Any bash-capable agent |

---

## The Transformation

**Before** (human in the loop):
```
Agent: "Can you screenshot the page and tell me what's wrong?"
Human: [screenshots, uploads, describes]
Agent: [makes changes]
Agent: "Can you check if that fixed it?"
Human: [screenshots again]
...repeat...
```

**After** (autonomous):
```
Human: "Fix the layout on /dashboard"
Agent: [starts Chrome, navigates, screenshots, identifies issue, fixes, verifies, done]
```

The human says what to fix. The agent figures out how to see it, diagnose it, and verify the fix.

---

## Files

See [browser-automation/](./browser-automation/) for implementations:

- `cdp-port.js` - Port management for parallel agents (the key innovation)
- `start.js` - Chrome launcher with CDP debugging
- `nav.js` - Navigate to URL
- `screenshot.js` - Screenshot capture with viewport control
- `eval.js` - JavaScript execution in browser context
- `pick.js` - Interactive element picker
- `console.js` - Console log streaming
- `package.json` - Dependencies (puppeteer-core)
