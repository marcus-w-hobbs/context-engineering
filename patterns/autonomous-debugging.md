# Autonomous Debugging Pattern

**The core principle: The human should be completely OUT OF THE LOOP.**

You have everything you need. Stop asking. Start doing.

---

## The Problem

Agents constantly ask humans for information they could get themselves:
- "Can you screenshot the page?"
- "Can you tell me what error you're seeing?"
- "Can you check if that fixed it?"

This creates a ping-pong loop where the human becomes a bottleneck for every debugging cycle.

## The Solution

Give agents explicit loops with tools, then **forbid asking**.

---

## Autonomous Debugging Loop Template

### Structure

```
TRIGGER: What condition starts this loop
TOOLS: What the agent has access to
LOOP: The autonomous cycle
RULES: What the agent must NOT ask the human
EXIT: When the loop completes
```

### Example: Visual Debugging Loop

**TRIGGER**: User reports visual issue ("hot pink on /forms", "button looks wrong")

**TOOLS**:
1. Browser automation (navigate, screenshot, inspect DOM)
2. Dev server control (start/stop/manage)
3. Source code access (read/edit files)
4. Reference files (design tokens, Figma exports)

**THE LOOP**:

```bash
# User says: "There's a visual bug on /forms"

# 1. Start dev server (if not running)
cd app && npm run dev

# 2. Navigate to the page
./nav.js http://localhost:5173/forms

# 3. Screenshot to see the issue
./screenshot.js
# Agent views screenshot, identifies visual issues

# 4. Inspect DOM to find the broken element
./eval.js 'document.querySelector(".broken-element").className'

# 5. Trace back to source code
# Find the component file, identify the incorrect style

# 6. Search reference files for correct value
grep -r "color" design-tokens.css

# 7. Fix the code
# Edit component to use correct value

# 8. Screenshot to verify
./screenshot.js
# Compare before/after

# 9. Repeat until ALL issues resolved
```

**CRITICAL RULES** (what NOT to ask):

- ❌ **NEVER ask human for screenshots** — take them yourself
- ❌ **NEVER ask which elements are broken** — inspect DOM yourself
- ❌ **NEVER ask human to check visually** — screenshot and compare yourself
- ❌ **NEVER ask if dev server is running** — start it yourself
- ❌ **NEVER ask for the error message** — capture console yourself
- ✅ **Start dev server yourself**
- ✅ **Navigate and screenshot yourself**
- ✅ **Find correct values yourself**
- ✅ **Verify fixes yourself**

**EXIT**: When the visual issue is resolved (verified via screenshot)

---

### Example: CI/CD Pipeline Loop

**TRIGGER**: Pipeline fails or shows non-green status

**TOOLS**:
1. CLI access to CI system (e.g., `az pipelines`, `gh run`)
2. Log fetching scripts
3. Local build/test commands
4. Git for commits and pushes

**THE LOOP**:

```bash
# 1. Check current pipeline status
az pipelines runs list --top 3

# 2. If failing, get logs autonomously
./scripts/get-pipeline-logs.sh

# 3. Make fixes locally and test
npm ci && npm run build

# 4. Commit and push
git add . && git commit -m "Fix: ..." && git push

# 5. Trigger new build
az pipelines run --name "my-pipeline" --branch main

# 6. Monitor autonomously until green
./scripts/monitor-pipeline.sh

# 7. If not green, go to step 2
```

**CRITICAL RULES**:

- ❌ **NEVER ask** "Can you check if the pipeline passed?"
- ❌ **NEVER ask** "Can you look at the CI UI?"
- ❌ **NEVER ask** "Can you run the build and tell me the error?"
- ❌ **NEVER ask** "Can you trigger another run?"
- ✅ **Check status yourself** via CLI
- ✅ **Fetch logs yourself**
- ✅ **Test locally yourself**
- ✅ **Monitor yourself**

**EXIT**: When `"result": "succeeded"` ✅

---

## Writing Your Own Loops

### Step 1: Identify the Trigger

What user statement or condition starts this debugging task?

Examples:
- "Fix the hot pink on /dashboard"
- "The API is returning 500 errors"
- "Tests are failing in CI"
- "The mobile layout is broken"

### Step 2: List Available Tools

What can the agent use WITHOUT human help?

Categories:
- **Observation**: Screenshot, console capture, network monitoring
- **Inspection**: DOM queries, computed styles, API responses
- **Modification**: File editing, git commits, config changes
- **Verification**: Re-run tests, re-screenshot, compare before/after

### Step 3: Define the Loop

Write the explicit steps. Number them. Make them concrete.

Bad:
```
1. Find the issue
2. Fix it
3. Verify
```

Good:
```
1. Navigate to localhost:5173/dashboard
2. Screenshot the page
3. Search DOM for elements with computed color rgb(255, 105, 180)
4. Identify the CSS variable causing fallback
5. Search design-tokens.css for correct variable name
6. Edit component file to use correct variable
7. Screenshot again
8. Compare: is hot pink gone?
9. If no, repeat from step 3 for remaining elements
```

### Step 4: Write the "NEVER Ask" Rules

Be explicit about what questions are forbidden.

Pattern:
```
❌ NEVER ask [question the human would answer]
✅ Instead [what the agent should do autonomously]
```

### Step 5: Define the Exit Condition

How does the agent know it's done?

Examples:
- "No hot pink visible in any screenshot"
- "Pipeline shows succeeded status"
- "All tests pass locally and in CI"
- "Mobile screenshot matches Figma design"

---

## Multi-Environment Management

When agents work across multiple branches/environments simultaneously:

### Dev Server Management

```bash
# Start dev server for current branch
cd app && npm run dev
# Note the port (usually 5173)

# Track: branch name, port, PID

# Kill when done
pkill -f "vite.*5173"
```

### CDP Port Management (for browser tools)

```bash
# Agent 1 (default)
CDP_PORT=9222 ./start.js

# Agent 2 (different port)
CDP_PORT=9223 ./start.js

# Agent 3
CDP_PORT=9224 ./start.js
```

All tools respect `CDP_PORT` environment variable.

---

## Fallback Indicators

Use obvious visual indicators for debugging states:

**Hot Pink Fallback Example**:
- When a CSS variable is undefined, fall back to hot pink (`#FF69B4`)
- This makes missing mappings immediately visible
- Agent's job: eliminate ALL hot pink from the application

**Console Error Markers**:
- Prefix errors with unique identifiers
- Makes grep/search trivial

**Build Output Codes**:
- Exit 0 = success
- Exit 1 = failure
- No ambiguity

---

## When TO Ask the Human

Some things legitimately require human input:

- **Credentials**: If auth fails and re-login is needed
- **Business decisions**: "Should we support this edge case?"
- **Architecture choices**: "Should we use library A or B?"
- **Design decisions**: "Which color should this be?"
- **Approval**: "Ready to deploy to production?"

The key distinction:
- **Don't ask for information you can get** → Use tools
- **Do ask for decisions you can't make** → Get human input

---

## CLAUDE.md Integration

Add this to your project's CLAUDE.md:

```markdown
## Autonomous Debugging

When user reports issues:

1. **DO NOT ASK** for screenshots, error messages, or verification
2. **USE TOOLS** to observe, diagnose, fix, and verify
3. **LOOP** until the issue is resolved
4. **ONLY ASK** for business/design decisions you can't make yourself

### Visual Issues
[Your visual debugging loop here]

### Build/CI Issues  
[Your pipeline debugging loop here]

### API Issues
[Your API debugging loop here]
```

---

## The Transformation

**Before** (human in the loop):
```
Agent: "Can you screenshot the page and tell me what's wrong?"
Human: [screenshots, uploads, describes]
Agent: [makes changes]
Agent: "Can you check if that fixed it?"
Human: [screenshots again, describes]
...repeat 5-10 times...
```

**After** (autonomous):
```
Human: "Fix the layout on /dashboard"
Agent: [
  starts server,
  opens browser,
  screenshots,
  identifies issue,
  fixes,
  screenshots again,
  verifies,
  done
]
Human: [reviews final result]
```

The human says **what** to fix. The agent figures out **how** to see it, diagnose it, and verify the fix.

---

## Real-World Example

From a design system project:

```markdown
## Autonomous Debugging Loop: Visual Issues

**When**: User reports visual issues like "hot pink on /forms"

**Tools Available**:
1. Browser automation CLI (./nav.js, ./screenshot.js, ./eval.js)
2. Dev server control
3. Source code access
4. figma-variables.css (reference for correct values)

**The Loop**:

# User says: "There's hot pink on localhost:5173/forms"

# 1. Start dev server (if not running)
cd apps/test-app && npm run dev

# 2. Navigate to the page
./nav.js http://localhost:5173/forms

# 3. Screenshot to confirm issue
./screenshot.js

# 4. Find hot pink elements
./eval.js 'Array.from(document.querySelectorAll("*")).filter(el => 
  getComputedStyle(el).color === "rgb(255, 105, 180)").map(el => el.className)'

# 5. Trace to component, find the undefined variable

# 6. Search reference for correct variable
grep -i "text-primary" packages/css/figma-variables.css

# 7. Fix component

# 8. Screenshot to verify
./screenshot.js

# 9. Repeat until NO hot pink visible

**The human should only say**: "Fix hot pink on /forms"
**You do everything else autonomously.**
```

This is the level of specificity that makes agents truly autonomous.
