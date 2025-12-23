# Case Study: Four Apps in Six Months

How context engineering methodology evolved across four production applications, with each project completing faster than the last.

---

## The Progression

| Project | Timeline | Key Innovation |
|---------|----------|----------------|
| **App 1** | 6 weeks | Discovered the bottleneck |
| **App 2** | 2 weeks | Gave agents eyes and hands |
| **App 3** | 2 weeks | CLAUDE.md as constitution |
| **App 4** | Ongoing | Design system bidirectional sync |

Total: 4 production applications in ~4 months of active development.

---

## App 1: The Waiting Game

### What We Built
Full-stack SaaS application (React frontend, FastAPI backend, PostgreSQL database).

### The Approach
- 100% of code written by prompting AI agents
- Minimal upfront context engineering
- Learn as we go

### What We Learned

The typical development loop looked like this:

```
1. Prompt the agent
   ↓
2. Wait for result...
   ↓
3. Notice something's wrong visually
   ↓
4. Take screenshot, paste, explain
   ↓
5. Wait for fix
   ↓
6. Still wrong—more corrections
   ↓
7. REPEAT
```

**The human was the feedback loop.** Every iteration required human coordination. We were the bottleneck.

### The Key Insight

> "The agent could not see what we could see."

The agent had no way to:
- View the running application
- Check console errors
- Verify its changes worked
- Compare actual vs. expected UI

We were constantly mediating between the agent and the browser. This doesn't scale.

### Timeline: 6 weeks
Acceptable for a first attempt, but most of that time was correction cycles, not implementation.

---

## App 2: Eyes and Hands

### What We Built
Rapid prototype of an enterprise platform. 2-week deadline.

### The Innovation
We gave the agent autonomous browser access via CLI tools:

```bash
~/agent-tools/
├── start.js      # Start Chrome with CDP
├── nav.js        # Navigate to URL
├── screenshot.js # Capture screenshot
├── eval.js       # Run JS in browser
└── console.js    # Capture console output
```

### The New Loop

```
Human: "Fix the layout on /dashboard"
   ↓
Agent: npm run dev (starts server)
   ↓
Agent: ./start.js (opens Chrome)
   ↓
Agent: ./nav.js http://localhost:5173/dashboard
   ↓
Agent: ./screenshot.js (sees the issue)
   ↓
Agent: ./eval.js 'getComputedStyle(...)' (diagnoses)
   ↓
Agent: [makes fix]
   ↓
Agent: ./screenshot.js (verifies fix)
   ↓
Done
```

No human in the loop for visual debugging. The agent could see what we could see.

### The MCP Discovery

We initially tried MCP (Model Context Protocol) for browser integration. It worked, but:

> "MCP has a ton of overhead because you register everything upfront."

Local CLI had far less friction:
- No protocol negotiation
- No configuration
- Agent just runs bash commands

**Give agents tools, not protocols.**

### What We Added to CLAUDE.md

```markdown
## Autonomous Visual Debugging — NEVER Ask the Human

❌ NEVER ask human for screenshots — use ./screenshot.js
❌ NEVER ask which elements are broken — inspect DOM yourself
❌ NEVER ask human to check visually — screenshot and compare
✅ Start dev server yourself
✅ Navigate and screenshot yourself
✅ Verify fixes yourself
```

### Timeline: 2 weeks
3x faster than App 1. Most of the time savings came from eliminating human-mediated debugging cycles.

---

## App 3: The Constitution

### What We Built
AI agent marketplace—a platform for discovering, configuring, and managing AI agents.

### The Innovation
The `CLAUDE.md` file became a proper "constitution"—a comprehensive behavioral specification distilling all learnings from previous projects.

### What the CLAUDE.md Contained

**From App 1:**
- Service layer architecture (no mock data in components)
- File structure conventions

**From App 2:**
- Browser automation workflow
- NEVER rules for autonomous debugging
- Tool documentation

**New in App 3:**
- Component library usage rules
- Figma Code Connect integration
- Agent delegation triggers
- Meta-prompting workflow

### The Structure

```
project/
├── CLAUDE.md              ← Domain specs (shared)
├── functional-specs/      ← Business requirements
├── frontend/
│   └── CLAUDE.md          ← Implementation context (all learnings)
└── backend/
    └── CLAUDE.md          ← Backend patterns
```

Parent context for domain knowledge. Child context for implementation patterns. Agents inherit both.

### The Compound Effect

The frontend `CLAUDE.md` was battle-tested. It contained:
- Every correction we'd ever made twice
- Every pattern that worked
- Every anti-pattern to avoid

When we spun up new agents, they just worked. First prompt, correct behavior.

### Implementation Prompts

We also developed the **implementation prompt** pattern—using Claude to generate detailed specifications (1500+ lines) that Claude Code could execute without decisions.

```
Figma URL → Claude + MCP → Implementation Prompt → Claude Code → Working feature
```

A complex multi-step wizard flow: 15 minutes from design to working code.

### Timeline: 2 weeks
Same as App 2, but with significantly more complex features. The context engineering absorbed the complexity.

---

## App 4: The Platform

### What We're Building
A design system with bidirectional Figma sync—changes in design propagate to code, and vice versa.

### The Innovation
- 84 components with Figma Code Connect mappings
- Agent can query Figma MCP for component → code mappings
- Design token changes flow through automatically

### The Current State

Context engineering is now infrastructure, not technique:

```markdown
## Figma Integration

When implementing from Figma:
1. get_code_connect_map → Which library components
2. get_design_context → Props, layout, variants
3. Generate code using library imports

NEVER recreate components that exist in @acme/ui
```

Agents don't have to learn the component library. They query it.

### Timeline: Ongoing
Velocity continues to increase as the design system matures.

---

## The Methodology That Emerged

### Friction-Driven Refinement

Don't anticipate what agents need. Let them fail, notice patterns, extract into persistent context.

Every constraint in `CLAUDE.md` exists because:
1. An agent made that mistake
2. We corrected it
3. The agent made it again
4. We added a constraint

### Directory Hierarchy

```
Parent CLAUDE.md  → Domain knowledge (what to build)
Child CLAUDE.md   → Implementation knowledge (how to build)
```

Agents inherit both automatically via filesystem traversal.

### NEVER Rules

Negative constraints prevent failure modes more reliably than positive instructions.

```markdown
❌ NEVER ask human for screenshots
❌ NEVER put mock data in components
❌ NEVER install additional UI libraries
```

### Tools Over Protocols

Simple CLI tools outperform protocol-based integrations for agent self-verification.

### Meta-Prompting

Use Claude to generate implementation prompts. Human curates; Claude compiles.

---

## The Numbers

| Metric | App 1 | App 3 |
|--------|-------|-------|
| Time to ship | 6 weeks | 2 weeks |
| Correction cycles per feature | Many | Few |
| Agent prompts per feature | 10-20 | 1-3 |
| Human debugging time | High | Minimal |
| Code quality consistency | Variable | High |

---

## Key Takeaways

### 1. Find the Human Bottleneck
Each project teaches you where humans are doing work agents could do. In App 1, it was visual verification. We fixed it in App 2.

### 2. Context Engineering > Prompting
A good `CLAUDE.md` eliminates categories of errors. You stop correcting the same mistakes because the constraints prevent them.

### 3. Learnings Compound
App 3's `CLAUDE.md` contained everything from Apps 1 and 2. New projects start with a proven foundation.

### 4. The Constitution Matters
> "We are not prompting anymore. We are orchestrating."

The `CLAUDE.md` is the constitution. Invest in it.

---

## Start Here

If you're beginning this journey:

1. **Start small** — Add a `CLAUDE.md` with just your tech stack
2. **Notice corrections** — When you correct an agent twice, add it
3. **Add tools** — Give agents browser access for self-verification
4. **Build the library** — Each project's learnings become the next project's foundation

The first project will be slow. The fourth will be fast. That's the compound effect of context engineering.
