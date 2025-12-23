# Domain Specs CLAUDE.md Template

A template for parent-level context that sits above frontend and backend repos.

---

## The Pattern: Context Inheritance

This file lives at the project root, above implementation directories:

```
project/
├── CLAUDE.md              ← THIS FILE (domain context)
├── functional-specs/      ← Business requirements
├── frontend/
│   └── CLAUDE.md          ← Implementation context
└── backend/
    └── CLAUDE.md          ← Implementation context
```

Claude Code reads `CLAUDE.md` files up the directory tree. When an agent is working in `frontend/`, it sees both:
1. The frontend-specific `CLAUDE.md`
2. This parent domain `CLAUDE.md`

This means **business rules live in one place** and both frontend and backend inherit them.

---

## How to Use This Template

1. Create this file at your project root (above frontend/backend)
2. Add your functional specifications to `functional-specs/`
3. Reference them in this file as a navigable index
4. Add domain terminology, business rules, and shared conventions

---

```markdown
# [Project Name]

## Overview

[Brief description of what this project does]

---

## Functional Specifications

All functional specifications are located in `functional-specs/`.

### Specification Index

| File | Description |
|------|-------------|
| **Overview.md** | High-level product overview, MVP scope, positioning |
| **F-01-Auth.md** | Authentication requirements: login, password reset, session management |
| **F-02-Dashboard.md** | Dashboard requirements: metrics, activity feed, navigation |
| **F-03-Settings.md** | Settings requirements: user preferences, configuration |
| **F-04-[Feature].md** | [Feature] requirements: [brief description] |

### How to Use Specs

1. **Before implementing a feature**, read the relevant spec file
2. **Reference requirement IDs** (e.g., F-02-REQ-001) in commit messages
3. **If a spec is unclear**, ask for clarification before assuming
4. **If implementation differs from spec**, document why

---

## Domain Terminology

Consistent terminology across frontend, backend, and documentation:

| Term | Definition |
|------|------------|
| **User** | An authenticated person using the system |
| **[Term 1]** | [Definition] |
| **[Term 2]** | [Definition] |
| **[Term 3]** | [Definition] |

### Usage Examples

```
✅ "The user selects a [Term 1]"
❌ "The customer picks a [different word for Term 1]"
```

Use these terms consistently in:
- Code (variable names, comments)
- API responses
- UI copy
- Documentation

---

## Business Rules

Rules that apply across the entire application:

### [Rule Category 1]

- Rule 1.1: [Description]
- Rule 1.2: [Description]

### [Rule Category 2]

- Rule 2.1: [Description]
- Rule 2.2: [Description]

### Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| Email | Valid email format | "Please enter a valid email address" |
| [Field] | [Rule] | [Message] |

---

## API Contracts

Shared understanding between frontend and backend:

### Authentication

```
POST /api/v1/auth/login
Request: { email: string, password: string }
Response: { token: string, user: User }

POST /api/v1/auth/logout
Headers: Authorization: Bearer <token>
Response: 204 No Content
```

### Standard Response Format

```typescript
// Success
{
  data: T,
  meta?: { page: number, total: number }
}

// Error
{
  error: {
    code: string,
    message: string,
    details?: object
  }
}
```

### Status Codes

| Code | Meaning | When to Use |
|------|---------|-------------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST that creates resource |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Missing or invalid auth |
| 403 | Forbidden | Valid auth but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Unexpected error |

---

## Environment Configuration

### Shared Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `API_URL` | Backend API base URL | `https://api.example.com` |
| `[VAR]` | [Description] | [Example] |

### Environment Files

```
.env.development   # Local development
.env.staging       # Staging environment
.env.production    # Production (never commit)
```

---

## Cross-Cutting Concerns

### Error Handling

- All errors should be user-friendly in the UI
- All errors should be logged with context in the backend
- Never expose stack traces to users

### Accessibility

- All interactive elements must be keyboard accessible
- All images must have alt text
- Color must not be the only indicator of state

### Performance

- API responses should complete within 200ms (p95)
- Initial page load should complete within 3s
- Images should be optimized and lazy-loaded

---

## Development Workflow

### Branch Naming

```
feature/[ticket-id]-brief-description
bugfix/[ticket-id]-brief-description
hotfix/[ticket-id]-brief-description
```

### Commit Messages

```
[type]: [brief description]

[optional body explaining why]

Refs: [ticket-id]
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

### PR Requirements

- [ ] Tests pass
- [ ] Lint passes
- [ ] Spec requirements referenced
- [ ] Reviewed by at least one team member
```

---

## Why This Pattern Works

1. **Single source of truth** — Business rules live in one place
2. **No sync problem** — Both frontend and backend see the same specs
3. **Automatic inheritance** — Claude Code reads parent CLAUDE.md automatically
4. **Clean separation** — Domain knowledge vs. implementation knowledge

When you update a business rule in this file, every agent working in any subdirectory will see the update immediately.
