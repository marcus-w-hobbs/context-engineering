# Context Engineering Methodology

A comprehensive framework for making AI coding agents reliable at enterprise scale.

---

## Table of Contents

1. [The Problem](#the-problem)
2. [The Solution: Context Engineering](#the-solution-context-engineering)
3. [Principle 1: Friction-Driven Refinement](#principle-1-friction-driven-refinement)
4. [Principle 2: Directory Hierarchy](#principle-2-directory-hierarchy)
5. [Principle 3: Behavioral Constraints](#principle-3-behavioral-constraints)
6. [Principle 4: Tools Over Protocols](#principle-4-tools-over-protocols)
7. [Principle 5: Meta-Prompting](#principle-5-meta-prompting)
8. [Implementation Prompts](#implementation-prompts)
9. [The Compound Effect](#the-compound-effect)

---

## The Problem

When teams first adopt AI coding agents, they hit the same wall:

```
1. Prompt the agent
2. Wait for result
3. Notice something's wrong
4. Screenshot, paste, explain
5. Wait for fix
6. Still wrong
7. More corrections
8. REPEAT
```

**The human becomes the feedback loop.** Every iteration requires human coordination. You are the bottleneck.

The deeper problem: **The agent cannot see what you can see.** It doesn't know:
- Your project's architectural patterns
- Your design system's component API
- Your team's conventions and constraints
- What the UI actually looks like in a browser

Most people try to solve this by writing better prompts. This doesn't scale. The solution is better context.

---

## The Solution: Context Engineering

Context engineering is the practice of systematically building persistent context that makes AI agents reliable across sessions, projects, and team members.

The core artifact is the `CLAUDE.md` file—a behavioral specification that Claude Code reads automatically when entering a directory.

But `CLAUDE.md` isn't documentation. It's a **compressed history of agent failures**. Every constraint in the file exists because an agent made that mistake, and you don't want to correct it again.

---

## Principle 1: Friction-Driven Refinement

### The Anti-Pattern: Upfront Specification
Most people try to anticipate what an agent needs and write comprehensive prompts upfront. This fails because:
- You can't predict every failure mode
- You waste time documenting things that don't matter
- The prompts become stale as the project evolves

### The Pattern: Extract from Friction
Let the agent fail. Pay attention to your corrections. When you make the same correction twice, extract it into persistent context.

```
Naive prompt
    ↓
Agent makes mistake
    ↓
You correct it
    ↓
Agent makes same mistake again
    ↓
STOP — This is a pattern
    ↓
Add constraint to CLAUDE.md
    ↓
Never correct this again
```

### What to Extract

**Repeated corrections become constraints:**
```markdown
## Critical Rules
- NEVER install additional UI libraries — use @acme/ui exclusively
- NEVER put mock data in components — all data flows through service layer
- ALWAYS use the `onPress` prop for buttons, not `onClick`
```

**Repeated explanations become context:**
```markdown
## Service Layer Architecture
All data flows through the service layer:
- Components import from `*Client.ts` (the interface)
- Mock implementations live in `*Client.mock.ts`
- Real API implementations live in `*Client.api.ts`
- Toggle via environment variable, zero component changes
```

**Repeated tool usage becomes workflows:**
```markdown
## Autonomous Visual Debugging
When user reports visual issues:
1. Start dev server: `npm run dev`
2. Start Chrome: `./start.js`
3. Navigate: `./nav.js http://localhost:5173`
4. Screenshot: `./screenshot.js`
5. Fix and verify yourself — NEVER ask human for screenshots
```

---

## Principle 2: Directory Hierarchy

### The Pattern: Context Inheritance

Claude Code reads `CLAUDE.md` files up the directory tree. Use this for layered context:

```
project/
├── CLAUDE.md              ← Domain context (shared)
├── functional-specs/      ← Business requirements
├── frontend/
│   └── CLAUDE.md          ← Implementation context (React-specific)
└── backend/
    └── CLAUDE.md          ← Implementation context (API-specific)
```

### Domain Context (Parent)
The parent `CLAUDE.md` contains:
- Business domain knowledge
- Functional specifications index
- Shared terminology
- Cross-cutting concerns

```markdown
# Project Context

## Functional Specifications
All specs are in `functional-specs/`:

| File | Description |
|------|-------------|
| F-01-Auth.md | Authentication requirements |
| F-02-Dashboard.md | Dashboard requirements |
| F-03-Settings.md | Settings requirements |

## Domain Terms
- **Org Group**: A collection of locations under common management
- **Location**: A single physical site
```

### Implementation Context (Child)
Child `CLAUDE.md` files contain:
- Technology-specific patterns
- Tool configurations
- Framework conventions
- Testing approaches

```markdown
# Frontend Implementation

## Component Library
Use `@acme/ui` for all components:
- NEVER use raw HTML for buttons, inputs, modals
- ALWAYS check available props before implementing

## State Management
- Local state for UI concerns
- Service layer for data fetching
- No global state management library
```

### Why This Works
- **Single source of truth**: Business rules live in one place
- **No sync problem**: Both frontend and backend read the same specs
- **Clean separation**: Product decisions vs. technical decisions
- **Composable**: Agents get exactly the context they need

---

## Principle 3: Behavioral Constraints

### The Pattern: NEVER Rules

Negative constraints are more reliable than positive instructions. "Don't do X" is clearer than "Do Y" when Y has exceptions.

```markdown
## Critical Rules

❌ NEVER ask human for screenshots — use `./screenshot.js`
❌ NEVER ask which elements are broken — inspect DOM with `./eval.js`
❌ NEVER ask human to check visually — screenshot and compare yourself
❌ NEVER ask human to start the dev server — start it yourself
```

### Why NEVER Rules Work

1. **Agents fail in predictable ways** — They ask for help on things they can do themselves
2. **Positive instructions have gaps** — "Use browser tools" doesn't prevent asking for screenshots
3. **NEVER is unambiguous** — No room for interpretation

### The Format

Use strikethrough formatting (❌) for visual weight:
```markdown
❌ NEVER [specific action] — [reason or alternative]
✅ ALWAYS [specific action] — [when and why]
```

### Common NEVER Rules

**For visual debugging:**
```markdown
❌ NEVER ask human for screenshots — use ./screenshot.js
❌ NEVER ask human to describe the UI — inspect it yourself
```

**For data handling:**
```markdown
❌ NEVER put mock data in components — use service layer
❌ NEVER import from mockData.ts in components — only services import mock data
```

**For dependencies:**
```markdown
❌ NEVER install additional UI libraries — use the design system
❌ NEVER add packages without checking existing deps first
```

**For code generation:**
```markdown
❌ NEVER recreate components that exist in the library
❌ NEVER use raw HTML when a component exists
```

---

## Principle 4: Tools Over Protocols

### The Insight

> "MCP has a ton of overhead because you register everything upfront."

Local CLI tools outperform MCP for agent self-verification:

| Aspect | MCP | Local CLI |
|--------|-----|-----------|
| Setup | Register all tools upfront | Tools available on demand |
| Overhead | Protocol negotiation | Zero protocol overhead |
| Complexity | Configuration required | Simple bash/JS execution |
| Startup | Cost every session | Agent calls what it needs |

### The Pattern: Give Agents Eyes and Hands

Create simple CLI tools the agent can invoke directly:

```bash
~/agent-tools/
├── start.js      # Start Chrome with remote debugging
├── nav.js        # Navigate to URL
├── screenshot.js # Capture screenshot, return path
├── eval.js       # Evaluate JS in browser context
├── console.js    # Capture console output
└── pick.js       # Interactive element picker
```

### Example: screenshot.js

```javascript
#!/usr/bin/env node
const puppeteer = require('puppeteer');

const CDP_PORT = process.env.CDP_PORT || 9222;

async function screenshot() {
  const browser = await puppeteer.connect({
    browserURL: `http://localhost:${CDP_PORT}`
  });
  const pages = await browser.pages();
  const page = pages[0];
  
  const path = `/tmp/screenshot-${Date.now()}.png`;
  await page.screenshot({ path, fullPage: true });
  
  console.log(path);
  await browser.disconnect();
}

screenshot();
```

### Document the Workflow

In your `CLAUDE.md`:

```markdown
## Autonomous Visual Debugging

When user reports visual issues:

1. Check if dev server is running, start if needed
2. Start Chrome: `cd ~/agent-tools && ./start.js`
3. Navigate: `./nav.js http://localhost:5173/page`
4. Screenshot: `./screenshot.js`
5. Identify issue with `./eval.js` or `./pick.js`
6. Fix the code
7. Screenshot again to verify
8. Repeat until resolved

**The human should only say:** "Fix the layout on /dashboard"
**You do everything else autonomously.**
```

---

## Principle 5: Meta-Prompting

### The Pattern: Claude Writes Prompts for Claude

Use Claude to generate detailed implementation specifications, then execute those specifications with Claude Code.

```
Human provides: Figma URL + high-level goal
    ↓
Claude + MCP tools: Extract design structure, components, layout
    ↓
Claude generates: 1500+ line implementation prompt
    ↓
Human reviews: Adjust, add constraints, approve
    ↓
Claude Code executes: Implementation matches spec exactly
```

### The Workflow

**Step 1: Extract Design Context**
```
Use Figma MCP tools:
- get_code_connect_map → Which library components to use
- get_design_context → Props, layout, variants
- get_screenshot → Visual reference
```

**Step 2: Generate Implementation Prompt**
Claude produces a structured specification:
- Component inventory (USE vs CREATE)
- File structure
- State machine with transitions
- TypeScript interfaces
- Code templates
- Acceptance criteria

**Step 3: Execute with Claude Code**
The implementation prompt is so detailed that Claude Code becomes an executor, not a decision-maker. There's no ambiguity—every decision is pre-made.

### Why This Works

- **Front-loads cognitive work** into a reusable artifact
- **Removes decision paralysis** from the agent
- **Enables verification** via acceptance criteria
- **Compounds** — Similar flows reuse the same prompt structure

---

## Implementation Prompts

An implementation prompt is a complete specification for a feature or flow. It removes decision-making from the agent.

### Anatomy of an Implementation Prompt

```markdown
# Implementation Prompt: [Feature Name]

## Overview
What we're building and the expected outcome.

## Prerequisites
What must exist before starting.

## 1. Component Inventory

### USE FROM @acme/ui (do NOT recreate)
| Component | Usage | Props to Use |
|-----------|-------|--------------|
| Button | Actions | variant, size, onPress |
| Input | Forms | label, value, onChange |

### CREATE AS NEW COMPONENTS
| Component | Path | Description |
|-----------|------|-------------|
| FeaturePanel | src/components/FeaturePanel.tsx | Container for feature |

## 2. File Structure
```
src/
├── components/
│   └── feature/
│       ├── FeaturePanel.tsx
│       └── index.ts
├── services/
│   └── featureClient.ts
└── types/
    └── feature.ts
```

## 3. State Machine
[ASCII diagram of states and transitions]

## 4. TypeScript Types
[Interface definitions]

## 5. Code Templates
[Actual code with blanks to fill]

## 6. Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
```

### The Key Insight

> These prompts aren't instructions—they're deterministic specifications that remove decision-making from the agent. The agent becomes an executor, not an architect.

---

## The Compound Effect

Each project's `CLAUDE.md` inherits and extends the previous:

| Project | What Was Added |
|---------|----------------|
| **Project 1** | Service layer pattern, basic structure |
| **Project 2** | Browser automation tools, visual debugging workflow |
| **Project 3** | All NEVER rules, agent delegation triggers, meta-prompting |
| **Project 4** | Design system integration, Figma Code Connect |

### The Velocity Curve

```
Project 1: 6 weeks  — Learning what agents can't do
Project 2: 2 weeks  — Gave agents tools to self-verify
Project 3: 2 weeks  — CLAUDE.md made agents work on first prompt
Project 4: Ongoing  — Context engineering is now the platform
```

### The Mindset Shift

> "We are not prompting anymore. We are orchestrating."

Context engineering is greater than prompting. The `CLAUDE.md` is where the magic lives—it's the constitution that makes agents reliable.

Each project teaches you where humans are doing work agents could do:
1. **Find the bottleneck**
2. **Give the agent eyes and hands**
3. **Encode the learnings**
4. **Compound**

---

## Getting Started

1. Start with a minimal `CLAUDE.md` containing just your tech stack
2. Work with an agent on a real task
3. Notice your corrections
4. When you correct the same thing twice, add it to `CLAUDE.md`
5. Repeat for every project

The file will grow organically to contain exactly what your projects need.

---

## Further Reading

- [Frontend CLAUDE.md Template](./patterns/frontend-claude.md)
- [Implementation Prompt Template](./implementation-prompts/multi-step-flow.md)
- [Browser Automation Tools](./tools/)
- [Case Study: Four Apps in Six Months](./case-studies/four-apps-six-months.md)
