I need to create a plan for: $ARGUMENTS

## Planning Workflow

1. **Understand the request**
   - Parse what feature/bug/improvement is being requested
   - Identify keywords for solution search

2. **Search past learnings (CRITICAL)**

   Before planning, search for relevant solutions:
   ```bash
   grep -r -l "<keywords>" docs/solutions/ 2>/dev/null || echo "No solutions directory yet"
   ```

   If solutions found:
   - Read each relevant solution file
   - Note gotchas, patterns, and prevention strategies
   - Incorporate learnings into the plan's approach
   - Reference the solution file in the plan

   Categories to check based on task:
   | Task involves | Check these |
   |---------------|-------------|
   | API endpoints | `docs/solutions/backend/`, `docs/solutions/integration/` |
   | UI components | `docs/solutions/frontend/` |
   | Database/ORM | `docs/solutions/backend/` |
   | Auth/CORS | `docs/solutions/integration/` |
   | Docker/env | `docs/solutions/devops/` |

3. **Research the codebase**
   - Read relevant CLAUDE.md files for patterns
   - Find existing code that relates to this task
   - Identify files that will need changes

4. **Create the plan**
   - Generate filename: `plans/<kebab-case-title>.md`
   - Use this template:

---

# Plan: <Title>

## Context
<What problem are we solving? Why does it matter?>

## Learnings Applied
<!-- List any past solutions that inform this plan -->
- `docs/solutions/<category>/<file>.md` - <what we learned>
- (or "No related solutions found")

## Approach
<High-level strategy. What's the solution?>

<If learnings found, note how they influence the approach:>
> Based on past solution X, we should avoid Y and instead do Z.

## Files to Modify
- [ ] `path/to/file1`
- [ ] `path/to/file2`

## Implementation Steps
1. <Step with specific file and change>
2. <Step with specific file and change>
3. ...

## Gotchas
<!-- From past learnings or codebase research -->
- <Known issue to watch for>
- <Pattern that must be followed>

## Verification
- [ ] <how to verify it works>
- [ ] <how to verify no regressions>

---

5. **Present the plan**
   - Show the user the plan file path
   - Ask if they want to proceed with `/compound-work <plan-file>`
