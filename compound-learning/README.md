# Compound Learning System

**A self-reinforcing loop that makes your AI agent smarter with every problem solved.**

---

## The Insight

Context engineering captures *constraints* in CLAUDE.md. But what about *solutions*?

Every time you debug a tricky issue, that knowledge evaporates after the session. The next time you (or the agent) hit the same problem, you start from scratch.

Compound learning fixes this by:
1. Documenting solutions in a searchable format
2. Forcing the agent to search past solutions before planning
3. Building a knowledge base that compounds over time

---

## The Loop

```
Problem solved → /compound-learnings → solution documented
       ↓
New task → /compound-plan → searches solutions → applies learnings
       ↓
Avoids repeating mistakes, builds on past wins
```

After one week on a production project, this system captured 30+ solutions across:
- DevOps/deployment issues
- Frontend component patterns
- Backend API gotchas
- Integration/auth problems

Each solution includes the *symptom*, *root cause*, *fix*, and *prevention strategy*.

---

## The Commands

### `/compound-plan <task>`

Before planning any work, the agent MUST search past solutions:

```bash
grep -r -l "<keywords>" docs/solutions/
```

If matches found → read them, incorporate learnings, reference in the plan.

This prevents the classic failure mode: confidently re-implementing something that broke last week.

### `/compound-work <plan-file>`

Executes a plan while keeping learnings in context. Reads the "Gotchas" section before making changes.

### `/compound-review`

Structured review of changes against project patterns. Catches issues before they become solutions.

### `/compound-learnings`

Prompts the agent to document what just got solved:
- What symptom did we observe?
- What was the root cause?
- How did we fix it?
- How do we prevent it next time?

---

## Solution Structure

Solutions live in `docs/solutions/<category>/`:

```
docs/solutions/
├── devops/           # Docker, CI/CD, cloud config
├── frontend/         # React, state, components
├── backend/          # API, database, auth
└── integration/      # Cross-boundary issues
```

Each solution follows a consistent template:

```markdown
---
title: Descriptive Title
category: devops|frontend|backend|integration
tags: [searchable, terms]
date: YYYY-MM-DD
---

# Title

## Symptom
What did we observe? Include error messages verbatim.

## Root Cause
Why did this happen? Technical explanation.

## Solution
Step-by-step fix with code examples.

## Prevention
How to avoid this in the future.

## Related
Links to docs, issues, other solutions.
```

---

## Why This Works

### 1. Forced Recall
The `/compound-plan` command requires searching before planning. The agent can't skip this step—it's built into the workflow.

### 2. Symptom-First Indexing
Starting solutions with "what did we observe" makes them findable when the same symptoms appear later. Error messages are grep-able.

### 3. Prevention > Fix
Every solution includes prevention strategies. This shifts from reactive debugging to proactive avoidance.

### 4. Compounding Returns
Day 1: 0 solutions, agent works from scratch
Day 7: 30 solutions, agent has institutional memory
Day 30: 100+ solutions, agent rarely hits unknown problems

---

## Getting Started

1. **Create the structure:**
   ```bash
   mkdir -p docs/solutions/{devops,frontend,backend,integration}
   ```

2. **Add the commands** to your Claude Code slash commands or CLAUDE.md

3. **Document your first solution** after solving any non-trivial bug

4. **Train the habit**: After any debugging session that took >15 minutes, run `/compound-learnings`

---

## Integration with CLAUDE.md

Compound learning complements friction-driven CLAUDE.md development:

| CLAUDE.md | Compound Solutions |
|-----------|-------------------|
| Constraints ("don't do X") | Knowledge ("when you see Y, it means Z") |
| Prevents mistakes | Explains fixes |
| Behavioral rules | Searchable knowledge base |
| Updated when patterns emerge | Updated when problems are solved |

Both are forms of externalized agent memory. Use them together.

---

## Example Solutions

See `/examples` for sanitized solutions demonstrating:
- Cloud platform CORS configuration overriding app-level middleware
- Storage key mismatches causing auth failures
- CSS positioning issues in nested modals
- Environment variable build-time vs runtime confusion
