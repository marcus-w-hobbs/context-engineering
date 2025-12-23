# CLAUDE.md Patterns

Reusable templates for different project types and configurations.

---

## Available Patterns

### [frontend-claude.md](./frontend-claude.md)
**For:** React/TypeScript frontend projects

Includes:
- Component library usage rules
- Service layer architecture
- Autonomous visual debugging workflow
- Browser automation tools documentation
- Figma integration workflow
- Agent delegation triggers

### [backend-claude.md](./backend-claude.md)
**For:** Python/FastAPI backend projects

Includes:
- Project structure conventions
- Schema naming patterns
- Service layer pattern
- Database patterns (async SQLAlchemy)
- Error handling standards
- Testing patterns

### [domain-specs-claude.md](./domain-specs-claude.md)
**For:** Parent-level context above frontend/backend

Includes:
- Functional specifications index
- Domain terminology glossary
- Business rules
- API contracts
- Cross-cutting concerns

### [autonomous-debugging.md](./autonomous-debugging.md)
**For:** Any project where agents debug issues autonomously

**Core principle:** The human should be completely OUT OF THE LOOP.

Includes:
- Visual debugging loop (screenshot → inspect → fix → verify)
- CI/CD pipeline loop (check → fix → push → monitor)
- "NEVER ask the human" rules
- Multi-environment management (CDP ports, dev servers)
- Fallback indicator patterns (hot pink = undefined variable)
- When TO ask vs when NOT to ask

---

## How to Use

### Single Repo Project

Copy the relevant pattern to your project root:

```bash
cp frontend-claude.md /path/to/your/project/CLAUDE.md
```

Edit to match your specifics:
- Replace `@acme/ui` with your component library
- Update tool paths
- Add project-specific patterns

### Multi-Repo Project

Use directory hierarchy for context inheritance:

```
project/
├── CLAUDE.md              ← Copy domain-specs-claude.md
├── functional-specs/      ← Your business requirements
├── frontend/
│   └── CLAUDE.md          ← Copy frontend-claude.md
└── backend/
    └── CLAUDE.md          ← Copy backend-claude.md
```

Agents working in `frontend/` will see both:
1. The frontend-specific patterns
2. The parent domain context

---

## Customization

These patterns are starting points. Extend them through friction:

1. Start with a template
2. Work with an agent on real tasks
3. Notice repeated corrections
4. Add constraints to your CLAUDE.md
5. Repeat

Your CLAUDE.md should grow organically to contain exactly what your project needs—no more, no less.

---

## Contributing

If you develop patterns for other project types (mobile, data science, DevOps, etc.), consider sharing them. The goal is a library of battle-tested templates that teams can adopt.
