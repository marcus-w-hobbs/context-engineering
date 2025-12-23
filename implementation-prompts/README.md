# Implementation Prompts

**Deterministic specifications that turn AI agents into executors, not architects.**

---

## What Is an Implementation Prompt?

An implementation prompt is a complete specification for a feature or flow. It's so detailed that the agent has no decisions to make—every choice is pre-made.

Most prompts say: *"Build a user settings page"*

Implementation prompts say:
- Here's every component you'll use (and which come from the library vs. create new)
- Here's the exact file structure
- Here's the state machine with every transition
- Here's the TypeScript interfaces
- Here's code templates with blanks to fill
- Here's how to verify you're done

---

## Why This Works

### The Problem with Vague Prompts

When you give an agent a vague prompt, it has to make decisions:
- Which components to use?
- How to structure files?
- What state management approach?
- How to handle edge cases?

Each decision is a potential failure point. The agent might decide differently than you would, and you'll spend turns correcting it.

### The Solution: Pre-Make Every Decision

Implementation prompts front-load the cognitive work:

```
Vague prompt → Agent decides → Multiple corrections → Done

Implementation prompt → Agent executes → Verify → Done
```

The upfront investment pays off in:
- Fewer correction rounds
- Consistent patterns across features
- Reusable templates for similar flows
- Junior engineers can execute complex features

---

## Anatomy of an Implementation Prompt

### 1. Overview
What we're building and the expected outcome.

### 2. Prerequisites
What must exist before starting. Prevents agents from starting without necessary context.

### 3. Component Inventory
Two columns:
- **USE FROM library** — Components that exist, with exact props
- **CREATE AS NEW** — Components to build, with file paths

This prevents the #1 agent mistake: recreating things that already exist.

### 4. File Structure
Exact paths for every file to create. No ambiguity about where things go.

### 5. Architecture Rules
How pieces connect. Routing, state management, data flow.

### 6. State Machine
Visual diagram of states and transitions. Agents are surprisingly good at implementing state machines when given a clear diagram.

### 7. TypeScript Types
Interface definitions. Agents write better code when types are specified upfront.

### 8. Code Templates
Actual code with TODO markers. Agents fill in the blanks rather than generating from scratch.

### 9. Acceptance Criteria
Checkboxes the agent can verify. "Done" is unambiguous.

### 10. Testing Checklist
Manual verification steps. Agents can self-test using browser automation.

---

## How to Create Implementation Prompts

### The Meta-Prompting Workflow

You don't write these by hand. You generate them with Claude:

```
1. Start with a Figma URL or feature description
2. Use Claude + design tools to extract structure
3. Iterate: "Add state machine" / "Include mobile breakpoints"
4. Review and adjust
5. Save as reusable artifact
```

### Prompt for Generating Implementation Prompts

```markdown
I need to implement [FEATURE DESCRIPTION].

Design reference: [FIGMA URL or description]

Please create a complete implementation prompt that includes:

1. **Component Inventory**
   - Which components to use from our library (@acme/ui)
   - Which components to create new
   - Include props for library components

2. **File Structure**
   - Exact paths for every new file
   - Follow our existing patterns: [describe your patterns]

3. **State Machine**
   - All states the feature can be in
   - All transitions between states
   - What triggers each transition

4. **TypeScript Types**
   - Interfaces for all data structures
   - Props interfaces for new components

5. **Code Templates**
   - Skeleton code for each new component
   - Mark TODOs where logic needs to be filled

6. **Acceptance Criteria**
   - Checkboxes for every requirement
   - Include responsive requirements
   - Include accessibility requirements

The prompt should be detailed enough that another engineer (or AI agent) 
could implement this feature without asking any clarifying questions.
```

---

## Examples

### Simple: Form Component
[See multi-step-flow.md for a complex example]

A simpler example for a single component:

```markdown
# Implementation Prompt: User Profile Form

## Overview
Form for editing user profile information (name, email, avatar).

## Component Inventory

### USE FROM @acme/ui
| Component | Props |
|-----------|-------|
| Input | label, value, onChange, error |
| Button | variant="primary", type="submit", loading |
| Avatar | src, size="lg", editable, onEdit |

### CREATE NEW
| Component | Path |
|-----------|------|
| ProfileForm | src/components/ProfileForm.tsx |

## File Structure
```
src/components/
└── ProfileForm.tsx
```

## TypeScript Types
```typescript
interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
}

interface ProfileFormProps {
  initialData: ProfileFormData;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  onCancel: () => void;
}
```

## Acceptance Criteria
- [ ] Form displays current user data
- [ ] Validation shows errors inline
- [ ] Submit button shows loading state
- [ ] Cancel returns to previous view
- [ ] Avatar can be changed via click
```

### Complex: Multi-Step Configuration Flow
See the complete two-part example:
- [config-flow-step-1.md](./config-flow-step-1.md) - Step 1: Product Settings (~800 lines)
- [config-flow-step-2.md](./config-flow-step-2.md) - Step 2: Configuration + Success State (~500 lines)

Together, these prompts demonstrate:
- Full component inventory (USE vs CREATE)
- State machine with ASCII diagrams
- Complete TypeScript interfaces
- Service layer with mock implementation
- Conditional field logic
- Multi-select dropdown patterns
- Success animation implementation
- Responsive behavior tables
- Accessibility requirements
- Testing checklists

### Responsive: Mobile Layout
See [responsive-mobile-layout.md](./responsive-mobile-layout.md) for adding mobile responsiveness to existing desktop implementations.

Key patterns:
- Preserve desktop while adding mobile (regression-free)
- Section-by-section verification workflow
- Multiple screenshots for tall mobile pages
- Comparing browser screenshots against Figma regions
- Common Tailwind responsive patterns
- Completion checklist with commit message format

---

## Tips for Effective Implementation Prompts

### Be Specific About Library Components
Don't just say "use Button"—specify exactly which props:
```markdown
| Button | variant="secondary", size="md", onPress={handleCancel} |
```

### Include Edge Cases in State Machine
Common states people forget:
- Loading
- Error
- Empty state
- Partial completion

### Make Acceptance Criteria Verifiable
Bad: "Form should work correctly"
Good: "Submit button is disabled until all required fields are filled"

### Include Responsive Requirements
Specify exactly what changes at each breakpoint:
```markdown
| Breakpoint | Layout |
|------------|--------|
| Desktop (≥1024px) | Side-by-side panels |
| Mobile (<1024px) | Stacked, full-width |
```

### Reference Design Assets
If working from designs:
```markdown
## Design References
| State | Desktop | Mobile |
|-------|---------|--------|
| Empty | [link] | [link] |
| Filled | [link] | [link] |
| Error | [link] | [link] |
```

---

## The Payoff

A well-crafted implementation prompt:
- **2 hours to create** (with Claude's help)
- **15 minutes to execute** (by Claude Code)
- **Reusable** for similar features
- **Teachable** to team members
- **Consistent** across the codebase

Compare to:
- Vague prompt → 2 hours of back-and-forth corrections
- No reusability
- Inconsistent results

The upfront investment compounds.
