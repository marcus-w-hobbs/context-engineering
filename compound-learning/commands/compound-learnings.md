Document the solution we just found.

## Compound Learning Workflow

1. **Analyze recent conversation**
   - What problem were we solving?
   - What symptoms did we observe (errors, unexpected behavior)?
   - What was the root cause?
   - What fixed it?

2. **Determine category**

   | Category | Use for |
   |----------|---------|
   | `backend` | API issues, database, auth, server-side logic |
   | `frontend` | Component bugs, hooks, state management, CSS |
   | `integration` | Cross-boundary issues, API contracts, data flow |
   | `devops` | Docker, env vars, CI/CD, deployment, cloud config |

3. **Generate filename**
   - Format: `docs/solutions/<category>/<kebab-case-description>.md`
   - Example: `docs/solutions/integration/cors-preflight-failing.md`

4. **Write solution file**

---
title: <Descriptive title>
category: <backend|frontend|integration|devops>
tags: [<searchable>, <tags>]
date: <YYYY-MM-DD>
---

# <Title>

## Symptom
<What did we observe? Include error messages verbatim.>

## Root Cause
<Why did this happen? Technical explanation.>

## Solution
<Step-by-step fix with code examples.>

```language
# Example fix
```

## Prevention
<How to avoid this in the future. Patterns, checks, tests.>

## Related
- <Links to docs, issues, other solutions>

---

5. **Confirm with user**
   - Show the solution file path
   - Ask if they want to edit anything

6. **Explain the compounding effect**
   > This solution is now saved. Next time you run `/compound-plan` for a related task,
   > I'll automatically find and apply this learning. The more solutions we
   > document, the smarter our planning becomes.
