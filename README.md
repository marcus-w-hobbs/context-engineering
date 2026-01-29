# Context Engineering

**Making AI coding agents reliable at scale.**

---

## The Core Insight

> A CLAUDE.md file is a **compressed history of agent failures**.

Every constraint in the file exists because an agent got something wrong, a human corrected it, and that correction was encoded as a persistent rule. Over time, the file becomes a behavioral specification that eliminates entire categories of errors.

This isn't prompt engineering. It's **context engineering**—the practice of shaping the persistent context that agents operate within, so they succeed without human intervention.

---

## Results

Four production SaaS applications shipped in six months. Each project completed faster than the last as learnings compounded:

| Project | Duration | Key Learning |
|---------|----------|--------------|
| 1 | 8 weeks | Component library constraints prevent agents from recreating existing UI |
| 2 | 6 weeks | State machines eliminate behavioral ambiguity |
| 3 | 4 weeks | Service layer patterns make mocks production-ready from day one |
| 4 | 3 weeks | Autonomous debugging loops remove human from verification cycle |

The acceleration came from encoding each project's corrections into reusable patterns.

---

## The Methodology

### 1. Friction-Driven Development

Don't write CLAUDE.md upfront. Let it emerge from friction:

```
Agent makes mistake → Human corrects → Encode correction as constraint
```

The file grows organically to contain exactly what your project needs. Every line earns its place by preventing a real failure.

### 2. Directory Hierarchy for Context Inheritance

```
project/
├── CLAUDE.md                 # Domain context (terminology, business rules)
├── functional-specs/         # What to build
├── frontend/
│   └── CLAUDE.md             # Frontend-specific patterns
└── backend/
    └── CLAUDE.md             # Backend-specific patterns
```

Agents working in `frontend/` inherit both the frontend patterns AND the parent domain context. No duplication.

### 3. Autonomous Debugging Loops

The highest-leverage pattern: give agents tools to verify their own work, then **forbid them from asking humans**.

```markdown
## Visual Debugging

When user reports visual issues:

1. Navigate to page with browser tools
2. Screenshot to identify problem
3. Inspect DOM to find broken element
4. Fix the code
5. Screenshot to verify fix
6. Repeat until resolved

❌ NEVER ask human for screenshots
❌ NEVER ask human to verify visually
✅ Use browser tools autonomously
```

The human says *what* to fix. The agent figures out *how* to see it, diagnose it, and verify the fix.

---

## What's in This Repo

### `/compound-learning`
A self-reinforcing loop for capturing and reusing solutions:
- **Commands** — Slash commands that force searching past learnings before planning
- **Examples** — Sanitized solutions demonstrating the pattern (CORS, auth, CSS, env vars)
- **The insight** — After one week, 30+ documented solutions; each new task benefits from past debugging

### `/patterns`
Reusable CLAUDE.md templates:
- **frontend-claude.md** — React/TypeScript projects with component library constraints
- **backend-claude.md** — Python/FastAPI with database and API patterns
- **autonomous-debugging.md** — The "never ask the human" loops

### `/implementation-prompts`
Production prompts (sanitized) showing the level of detail required for reliable agent execution:
- **config-flow-step-1.md** — 800-line wizard implementation with state machine, TypeScript interfaces, component inventory
- **config-flow-step-2.md** — Conditional fields, validation logic, success states
- **responsive-mobile-layout.md** — Mobile responsive workflow with section-by-section verification

### `/tools`
Browser automation CLI for autonomous visual debugging:
- CDP port management enables **parallel agents** on separate Chrome instances
- Zero protocol overhead compared to MCP
- Simple bash integration: `./screenshot.js --mobile`

### `/case-studies`
Documentation of production usage and measured outcomes.

---

## Key Patterns

### Component Inventory (Prevent Recreation)

```markdown
## USE from @acme/ui (do NOT recreate)
| Component | Usage |
|-----------|-------|
| Button | All clickable actions |
| Input | Form fields |
| Table | Data display |

## CREATE as new
| Component | Why |
|-----------|-----|
| ConfigWizard | Domain-specific orchestration |
```

Without this, agents install shadcn, recreate existing buttons, or use raw HTML.

### State Machine (Eliminate Ambiguity)

```
EMPTY → PRODUCT_SELECTED → LOCATIONS_SELECTED → READY → SUBMITTING → SUCCESS
  │           │                    │              │          │
  └───────────┴────────────────────┴──────────────┴──────────┘
                    [Cancel / X / ESC] → CLOSED
```

When the agent knows exactly which states exist and which transitions are valid, it doesn't invent behaviors.

### Service Layer (Production-Ready Mocks)

```typescript
// Interface
interface IConfigClient {
  getProducts(): Promise<Product[]>;
  createConfig(data: ConfigData): Promise<{ id: string }>;
}

// Mock (development)
class MockConfigClient implements IConfigClient { ... }

// API (production)
class ApiConfigClient implements IConfigClient { ... }
```

Agents write to the interface. Swapping mock for real API is a one-line change.

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
Agent: [starts server, opens browser, screenshots, identifies issue, 
        fixes, screenshots again, verifies, done]
```

The agent becomes an executor of well-specified intent, not a guesser requiring constant correction.

---

## Getting Started

1. **Start with friction**: Use an agent on real work. When it fails, note the correction.

2. **Encode corrections**: Add each correction to your CLAUDE.md as a constraint.

3. **Add autonomous loops**: Give agents tools to verify their own work. Forbid asking humans for verification.

4. **Reuse patterns**: Extract patterns that work across projects into templates.

The goal is compounding reliability—each project should complete faster than the last because the context keeps getting better.

---

## Philosophy

Context engineering treats AI agents as capable but amnesiac collaborators. They can do the work, but they forget everything between sessions. Your job is to externalize the knowledge they need into persistent context that survives across sessions.

The CLAUDE.md file isn't documentation for humans. It's **runtime context for agents**. Every line should change agent behavior in a measurable way.

---

## License

MIT
