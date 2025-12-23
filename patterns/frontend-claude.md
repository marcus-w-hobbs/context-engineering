# Frontend CLAUDE.md Template

A battle-tested template for React/TypeScript frontend projects using AI coding agents.

---

## How to Use This Template

1. Copy this file to your project root as `CLAUDE.md`
2. Replace `@acme/ui` with your actual component library
3. Update the tool paths if different from `~/agent-tools`
4. Add project-specific patterns as you discover them through friction

---

```markdown
# Project-Specific Instructions for [Project Name]

## Project Context

[Brief description of what this project does and its key functional areas]

---

## Component Library

This project uses `@acme/ui` for all UI components.

### Installation

```bash
npm install @acme/ui
```

### Usage

```typescript
// Import styles in main.tsx
import '@acme/ui/styles.css';

// Import components
import { Button, Input, Modal } from '@acme/ui';
```

### Critical Rules

1. **LIBRARY IMPORTS**: Always use `import { X } from '@acme/ui'`, **never raw HTML**
2. **CHECK PROPS**: Use prop names from the library (e.g., `variant`, not `color`; `onPress`, not `onClick`)
3. **TOKEN STYLING**: Components are pre-styled with design tokens — don't add hardcoded colors
4. **STYLES REQUIRED**: Must import `@acme/ui/styles.css` for components to render correctly

---

## Service Layer Architecture — CRITICAL

**UI components must NEVER contain mock data.** All data flows through the service layer.

### Architecture Pattern

```
React Components → Services (interface) → Mock Implementation (now)
                                       → Real API (later)
```

### Rules

1. **NO mock data in components** — Components consume services via hooks/context
2. **Mock at the service layer** — All mocking happens in `*Client.mock.ts` files
3. **Single interface** — Components import from `*Client.ts`, never from mock or API directly
4. **Zero-change swap** — Switching from mock to real API requires only env var change
5. **Centralized mock data** — All fake data lives in `/src/constants/mockData.ts`

### File Structure

```
/src/services
├── someClient.ts           # Interface + factory (USE_MOCK toggle)
├── someClient.mock.ts      # Mock implementation
├── someClient.api.ts       # Real API implementation
└── /core
    └── http.ts             # HTTP client with auth interceptors
```

### Example

```typescript
// ✅ CORRECT — Component uses service interface
import { dataClient } from '@/services/dataClient';
const items = await dataClient.getItems();

// ❌ WRONG — Component imports mock data
import { MOCK_ITEMS } from '@/constants/mockData';

// ❌ WRONG — Component has inline mock data
const items = [{ id: 1, name: 'Test' }];
```

---

## Autonomous Visual Debugging — NEVER Ask the Human

**You have browser automation tools. Use them autonomously.**

### Tools Available (`~/agent-tools`)

| Tool | Purpose | Usage |
|------|---------|-------|
| `./start.js` | Start Chrome with remote debugging | `CDP_PORT=${CDP_PORT:-9222} ./start.js` |
| `./nav.js <url>` | Navigate to URL | `./nav.js http://localhost:5173` |
| `./screenshot.js` | Take screenshot, returns temp file path | `./screenshot.js` |
| `./eval.js 'code'` | Evaluate JavaScript in active tab | `./eval.js 'document.title'` |
| `./console.js` | Capture real-time console logs | `./console.js` |

### The Autonomous Debugging Loop

When user reports visual issues:

```bash
# 1. Start dev server if needed
npm run dev

# 2. Start Chrome with remote debugging
cd ~/agent-tools && CDP_PORT=${CDP_PORT:-9222} ./start.js

# 3. Navigate to the page
./nav.js http://localhost:5173/some-page

# 4. Screenshot to see the issue
./screenshot.js

# 5. Identify the problematic element
./eval.js 'getComputedStyle(document.querySelector(".btn")).backgroundColor'

# 6. Fix the code

# 7. Verify fix visually
./screenshot.js

# 8. Repeat until resolved
```

### CRITICAL RULES

- ❌ **NEVER ask human for screenshots** — Use `./screenshot.js`
- ❌ **NEVER ask which elements are broken** — Inspect DOM with `./eval.js`
- ❌ **NEVER ask human to check visually** — Screenshot and compare yourself
- ❌ **NEVER ask human to start the dev server** — Start it yourself
- ✅ **Start dev server yourself** — `npm run dev`
- ✅ **Start browser yourself** — Use `./start.js`
- ✅ **Navigate and screenshot yourself** — Use `./nav.js` and `./screenshot.js`
- ✅ **Verify fixes yourself** — Before/after screenshots

**The human should only say:** "Fix the layout on /dashboard"

**You do everything else autonomously.**

---

## Figma Integration (If Using MCP)

When implementing UI from Figma designs, use MCP tools to get component mappings.

### MCP Tools

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `get_code_connect_map` | Get library component mappings | **Always first** when implementing from Figma |
| `get_design_context` | Get node details, props, layout | After getting mappings |
| `get_screenshot` | Visual reference image | For implementation comparison |

### Workflow: Implementing from Figma URL

```
1. PARSE URL:
   https://www.figma.com/design/{fileKey}/{fileName}?node-id={nodeId}
   Extract: fileKey, nodeId (convert - to :)

2. GET CODE CONNECT MAP (always first):
   → Returns: { Button: { path: "@acme/ui", props: [...] } }

3. GET DESIGN CONTEXT:
   → Returns: variant="primary", size="md", children, layout

4. GENERATE LIBRARY CODE:
   import { Button } from '@acme/ui';
   <Button variant="primary" size="md">Click me</Button>
```

---

## Agent Delegation Rules

When working on tasks, **proactively delegate to specialized agents** if available.

### Automatic Delegation Triggers

1. **After writing significant code** → Use code review agent
   - Trigger: Any time you create or modify 10+ lines of code
   - Trigger: When implementing auth, security, or data handling

2. **When implementing new features** → Use code writer agent
   - Trigger: User asks to "implement", "create", "add", or "build"
   - Trigger: When fixing bugs that require code changes

3. **After any code changes** → Use test runner agent
   - Trigger: After code writer completes
   - Trigger: When user asks to "verify", "test", or "check"

---

## Development Server Management

- **Autonomously start the dev server** when using browser tools
- Check if server is already running before starting
- Start with `npm run dev` in the workspace root
- Wait for server to be ready before navigating
- Changes will hot-reload automatically

---

## CDP Port Management

For parallel agent sessions (e.g., git worktrees), respect the `CDP_PORT` environment variable:

```bash
# Always use this pattern when starting Chrome:
cd ~/agent-tools && CDP_PORT=${CDP_PORT:-9222} ./start.js
```

| Scenario | What Happens |
|----------|--------------|
| `CDP_PORT` is set | Use that port (for isolated sessions) |
| `CDP_PORT` not set | Default to `9222` |

---

## Testing Requirements

- Always run relevant tests after code changes
- Ensure no regression in existing functionality
- Use `npm test` or framework-specific test runner
```

---

## Customization Notes

### Add As You Discover

This template covers common patterns, but your project will have specific needs. Add sections for:

- **API patterns** specific to your backend
- **State management** conventions (if using Redux, Zustand, etc.)
- **Form handling** patterns
- **Error handling** standards
- **Routing** conventions

### The Rule

**When you correct the agent twice for the same thing, add it to this file.**

That's how the template evolved—through friction, not anticipation.
