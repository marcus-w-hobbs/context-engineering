Review local changes before committing.

## Review Workflow

1. **Gather changes**
   ```bash
   git status --short
   git diff --stat
   ```

2. **Read changed files** - For each modified file, read and analyze

3. **Review against project patterns**
   - Reference CLAUDE.md files for standards
   - Check for consistency with existing code

4. **Generate review report**

---

## Review: <date>

### Summary
- **Files changed:** X
- **Status:** ✅ Ready / ⚠️ Issues found

### Findings

| Severity | File | Issue |
|----------|------|-------|
| 🔴 P1 | ... | ... |
| 🟡 P2 | ... | ... |
| 🟢 P3 | ... | ... |

### Checklist
- [ ] Follows project patterns from CLAUDE.md
- [ ] No hardcoded secrets or credentials
- [ ] Error handling appropriate
- [ ] Types/interfaces aligned across boundaries
- [ ] No debug code left in

### Recommendations
<Priority fixes before committing>

---

5. **If issues found**, offer to fix them or explain what needs manual attention
