# Implementation Prompt: Multi-Step Configuration Flow (Step 2 + Success)

Step 2 of a wizard-style configuration flow, plus the Success State. This is a real production prompt (sanitized) that continues from Step 1.

---

## Overview

**Step 2** is the "Settings" step where users configure behavior options. This includes naming, voice selection, handling preferences, and operational limits.

**Success State** is shown after the user completes Step 2 and successfully submits the configuration.

**Outcome**: After implementing this prompt, users will be able to:
1. Configure persona settings (name, voice gender)
2. Set handling preferences and exceptions
3. Define capacity for scaling
4. Optionally set volume limits
5. See a success animation after completion
6. Optionally customize per-item settings

---

## Prerequisites

- Step 1 implementation complete (`ConfigFlowStep1.tsx`)
- SlideoutPanel component exists
- StepIndicator component exists
- FlowHeader component exists
- Types file exists (`src/types/config-flow.ts`)
- Service layer pattern established
- `@acme/ui` component library is installed

---

## 1. Component Inventory

### USE FROM @acme/ui (do NOT recreate)

| Component | Usage | Props to Use |
|-----------|-------|--------------|
| `Button` | Cancel/Next/Save footer buttons | `variant`, `size`, `isDisabled`, `onPress` |
| `Input` | Name, Max Calls, Capacity fields | `label`, `placeholder`, `value`, `onChange`, `isRequired` |
| `RadioButton` | Voice gender, limit type selection | `value`, `label` |
| `RadioGroup` | Group radio buttons | `value`, `onChange`, `children` |
| `Toggle` | Feature toggles | `isSelected`, `onChange`, `label` |
| `Select` | Exceptions multi-select, Tab selector (mobile) | `items`, `selectedKey`, `onSelectionChange` |
| `Checkbox` | Multi-select dropdown items | `isSelected`, `onChange` |
| `Tabs` | Settings tabs (desktop) | `selectedKey`, `onSelectionChange`, `children` |
| `Table` | Item settings table | Table API |

### CREATE AS NEW COMPONENTS

| Component | File Path | Description |
|-----------|-----------|-------------|
| `ConfigFlowStep2` | `src/components/config-flow/ConfigFlowStep2.tsx` | Step 2 content - settings form |
| `ConfigFlowSuccess` | `src/components/config-flow/ConfigFlowSuccess.tsx` | Success state with animation |
| `MultiSelectDropdown` | `src/components/config-flow/MultiSelectDropdown.tsx` | Multi-select for exception types |
| `VolumeLimitsSettings` | `src/components/config-flow/VolumeLimitsSettings.tsx` | Toggle + conditional fields |
| `ItemSettingsPanel` | `src/components/config-flow/ItemSettingsPanel.tsx` | Item settings table view |
| `ItemSettingsEditor` | `src/components/config-flow/ItemSettingsEditor.tsx` | Individual item edit form |
| `SuccessAnimation` | `src/components/config-flow/SuccessAnimation.tsx` | Animated success checkmark |

---

## 2. State Machine

### Step 2 Flow States

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              STEP 2 STATES                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  INCOMPLETE ──────────────> VALID ──────────────> SUBMITTING ──> SUCCESS   │
│      │                        │                       │              │      │
│      │ fill required          │ clear required        │ API call     │      │
│      │ fields                 │ fields                │              │      │
│      │                        │                       ▼              │      │
│      │                        └─────────────────> ERROR              │      │
│      │                                              │                │      │
│      │                                              │ retry          │      │
│      └──────────────────────────────────────────────┘                │      │
│                                                                      │      │
│  VOLUME_LIMITS_OFF ←→ VOLUME_LIMITS_ON                              │      │
│  (UI substate - affects required fields)                             │      │
│                                                                      │      │
│                     [Cancel / X / Backdrop / ESC]                    │      │
│                              │                                       │      │
│                              ▼                                       │      │
│                           CLOSED                                     │      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### State Transitions

| Current State | Trigger | Next State | Side Effects |
|---------------|---------|------------|--------------|
| Step 1 READY | Click Next | Step 2 INCOMPLETE | Pass step1State, show Step 2 form |
| INCOMPLETE | Fill all required fields | VALID | Enable Next button |
| VALID | Clear a required field | INCOMPLETE | Disable Next button |
| VALID | Toggle Volume Limits ON | INCOMPLETE | Show extra fields, disable Next |
| INCOMPLETE (limits on) | Fill Max Calls field | VALID | Enable Next button |
| VALID | Click Next | SUBMITTING | Call API to create config |
| SUBMITTING | API success | SUCCESS | Show success animation |
| SUBMITTING | API error | ERROR | Show error message, allow retry |

### Next Button Enable Logic (Step 2)

```typescript
const canProceed = useMemo(() => {
  // Required fields (always)
  const hasName = name.trim().length > 0;
  const hasVoice = voiceGender !== null;
  const hasCapacity = capacity > 0;

  // Required fields (conditional - only when volume limits enabled)
  const volumeLimitsValid = !volumeLimitsEnabled || (
    maxCalls > 0 &&
    limitType !== null // 'recurring' or 'total'
  );

  return hasName && hasVoice && hasCapacity && volumeLimitsValid;
}, [name, voiceGender, capacity, volumeLimitsEnabled, maxCalls, limitType]);
```

---

## 3. Data Models

Add to `src/types/config-flow.ts`:

```typescript
// ============================================================================
// STEP 2 - SETTINGS TYPES
// ============================================================================

export type VoiceGender = 'female' | 'male';
export type VolumeLimitType = 'recurring' | 'total';
export type RecurringPeriod = 'daily' | 'weekly' | 'monthly';

export interface ExceptionType {
  id: string;
  name: string;
  code?: string;
}

export interface HandlingSettings {
  enabled: boolean;
  exceptions: string[];  // Array of ExceptionType IDs
}

export interface VolumeLimitsSettings {
  enabled: boolean;
  maxCalls: number | null;
  type: VolumeLimitType | null;
  recurringPeriod: RecurringPeriod | null;
}

export interface ItemSettings {
  name: string;
  voiceGender: VoiceGender | null;
  handling: HandlingSettings;
  capacity: number | null;
  volumeLimits: VolumeLimitsSettings;
}

export interface ConfigFlowStep2State {
  itemType: ItemType;
  settings: ItemSettings;
}

// Combined state for the entire flow
export interface ConfigFlowCompleteState {
  step1: ConfigFlowStep1State;
  step2: ConfigFlowStep2State;
}

// ============================================================================
// SUCCESS STATE TYPES
// ============================================================================

export interface SuccessSummary {
  itemName: string;
  itemType: ItemType;
  productCount: number;
  orgGroupCount: number;
  locationCount: number;
}
```

---

## 4. Component Specifications

### 4.1 ConfigFlowStep2

**File**: `src/components/config-flow/ConfigFlowStep2.tsx`

**Layout**:
```
┌──────────────────────────────────────────────────────────────────────────────┐
│  [Step Indicator: ● Product settings ─── ○ Configuration]           [X]     │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  [Icon]    Configure the Item                                                │
│  [Badge]   Define how your item behaves. These settings apply to all         │
│            selected locations.                                               │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Persona                                                                     │
│  ─────────────────────────────────────────────────────────────────────────   │
│                                                                              │
│  Name *                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ e.g., Sarah                                                            │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  Voice gender *                                                              │
│  ○ Female    ○ Male                                                          │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Handling                                                                    │
│  ─────────────────────────────────────────────────────────────────────────   │
│                                                                              │
│  Enable handling *                                                           │
│  Allow processing of requests                                    [Toggle]    │
│                                                                              │
│  Exceptions (optional)                                                       │
│  ┌────────────────────────────────────────────────────────────────────[▼]┐  │
│  │ None selected                                                          │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Capacity & limits                                                           │
│  ─────────────────────────────────────────────────────────────────────────   │
│                                                                              │
│  Capacity *                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ 0                                                                      │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│  Number of staff at your locations                                           │
│                                                                              │
│  Volume limits                                                               │
│  Set limits on activity                                          [Toggle]    │
│                                                                              │
│  ┌─ (shown when toggle is ON) ─────────────────────────────────────────────┐ │
│  │                                                                         │ │
│  │  Max successful calls *                                                 │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │ │
│  │  │ 0                                                                │  │ │
│  │  └──────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                         │ │
│  │  ○ Recurring   ○ Total                                                 │ │
│  │                                                                         │ │
│  │  ┌─ (shown when Recurring is selected) ───────────────────────────────┐│ │
│  │  │  ○ Daily    ○ Weekly    ○ Monthly                                  ││ │
│  │  └────────────────────────────────────────────────────────────────────┘│ │
│  │                                                                         │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                             [Cancel]  [Back]  [Next]         │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Props**:
```typescript
interface ConfigFlowStep2Props {
  step1State: ConfigFlowStep1State;
  onNext: (state: ConfigFlowStep2State) => void;
  onBack: () => void;
  onCancel: () => void;
}
```

---

### 4.2 MultiSelectDropdown

**File**: `src/components/config-flow/MultiSelectDropdown.tsx`

**Behavior**:
- Shows "None selected" when empty
- Shows single item name when one selected
- Shows "Multiple" when more than one selected
- Has "Select All" option at top
- Individual checkboxes for each item
- Clicking outside closes dropdown

**Props**:
```typescript
interface MultiSelectDropdownProps {
  items: { id: string; name: string }[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
}
```

---

### 4.3 ConfigFlowSuccess

**File**: `src/components/config-flow/ConfigFlowSuccess.tsx`

**Layout**:
```
┌──────────────────────────────────────────────────────────────────────────────┐
│  [Step Indicator: ✓ Product settings ─── ✓ Configuration]           [X]     │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                                                                              │
│                        [Success Animation]                                   │
│                                                                              │
│                     Successfully configured!                                 │
│                                                                              │
│            Your item "Sarah" is now ready to start                           │
│            operating across 5 locations.                                     │
│                                                                              │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│               [Customize Item Settings]  [Go to Dashboard]                   │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Props**:
```typescript
interface ConfigFlowSuccessProps {
  summary: SuccessSummary;
  onCustomizeItems: () => void;
  onGoToDashboard: () => void;
  onClose: () => void;
}
```

---

### 4.4 SuccessAnimation

**File**: `src/components/config-flow/SuccessAnimation.tsx`

Animated success checkmark with concentric circles and optional confetti particles.

**Implementation Pattern**:
```typescript
export function SuccessAnimation() {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-32 h-32 mx-auto">
      {/* Outer circle with pulse */}
      <div className={`
        absolute inset-0 rounded-full bg-blue-500/10
        transition-transform duration-500 ease-out
        ${animated ? 'scale-100' : 'scale-0'}
      `} />
      
      {/* Inner circle */}
      <div className={`
        absolute inset-4 rounded-full bg-blue-500/20
        transition-transform duration-500 delay-100
        ${animated ? 'scale-100' : 'scale-0'}
      `} />
      
      {/* Center with checkmark */}
      <div className={`
        absolute inset-8 rounded-full bg-blue-500 
        flex items-center justify-center
        transition-all duration-300 delay-200
        ${animated ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
      `}>
        <CheckIcon className="w-8 h-8 text-white" />
      </div>
    </div>
  );
}
```

---

## 5. Implementation Steps

### Phase 1: Types & Services

1. **Update types file**: Add Step 2 types to `src/types/config-flow.ts`
2. **Add mock data**: Exception types to `src/constants/mockData.ts`
3. **Create service layer**: `src/services/configClient.ts` and mock

### Phase 2: Step 2 Components

4. **Create MultiSelectDropdown**: With Select All, checkboxes, outside click
5. **Create ConfigFlowStep2**: Main form with validation
   - Test conditional fields (volume limits)
   - Test Next button enable/disable logic

### Phase 3: Success State

6. **Create SuccessAnimation**: With CSS transitions
7. **Create ConfigFlowSuccess**: With action buttons

### Phase 4: Integration

8. **Create ConfigFlow orchestrator**: Manages step navigation
9. **Update Dashboard**: Integrate the complete flow

---

## 6. Acceptance Criteria

### Step 2 - Settings

- [ ] Step indicator shows Step 1 as complete (checkmark), Step 2 as current
- [ ] Next button is disabled when required fields are not filled
- [ ] Name is a required text field
- [ ] Voice gender has two radio options: Female, Male
- [ ] Handling toggle defaults to OFF
- [ ] Exceptions dropdown shows "None selected" when empty
- [ ] Exceptions dropdown shows single item name when one selected
- [ ] Exceptions dropdown shows "Multiple" when more than one selected
- [ ] Exceptions dropdown has "Select All" option
- [ ] Capacity is a required number field
- [ ] Volume limits toggle defaults to OFF
- [ ] When volume limits enabled, additional fields appear
- [ ] Max calls is required when volume limits enabled
- [ ] Recurring/Total radio appears when volume limits enabled
- [ ] Daily/Weekly/Monthly radio appears only when Recurring selected
- [ ] Next button enables only when all required fields are filled
- [ ] Back button returns to Step 1 with state preserved
- [ ] Cancel button closes slideout

### Success State

- [ ] Shows success animation on load
- [ ] Step indicator shows both steps as complete (checkmarks)
- [ ] Displays item name in success message
- [ ] Shows location count in success message
- [ ] "Customize Item Settings" button opens settings panel
- [ ] "Go to Dashboard" button closes slideout and navigates

### Responsive Requirements

- [ ] Desktop (≥1024px): 783px slideout, horizontal tabs
- [ ] Mobile (<1024px): Full-width slideout, dropdown selector

### Code Quality Requirements

- [ ] No mock data in components - all data from service layer
- [ ] TypeScript types for all props and state
- [ ] Components from @acme/ui used where available
- [ ] Form validation is properly implemented

---

## 7. Testing Checklist

1. **Step 2 Form Validation**:
   - Leave all fields empty → Next disabled
   - Fill name only → Next disabled
   - Fill all required fields → Next enabled
   - Toggle volume limits ON with empty Max Calls → Next disabled
   - Complete all fields → Next enabled

2. **Dropdown Behavior**:
   - Click dropdown → Opens with Select All and items
   - Select one item → Shows item name in trigger
   - Select multiple → Shows "Multiple" in trigger
   - Click outside → Closes dropdown

3. **Volume Limits**:
   - Toggle ON → Shows additional fields
   - Select Recurring → Shows period options
   - Select Total → Hides period options
   - Toggle OFF → Hides all additional fields

4. **Navigation**:
   - Back button → Returns to Step 1 with state preserved
   - Cancel button → Closes slideout
   - X button → Closes slideout

---

## Why This Level of Detail?

Step 2 builds on Step 1's foundation, demonstrating:

1. **Conditional Fields**: Volume limits section only appears when toggle is ON, and has its own nested conditional (recurring period).

2. **Multi-Select Pattern**: The exceptions dropdown shows a common UI pattern that agents often get wrong without explicit specification.

3. **Validation Complexity**: The `canProceed` logic has multiple conditions that change based on UI state.

4. **State Preservation**: Back button must preserve Step 2 state, requiring careful state management.

5. **Success Flow**: The animation and next actions pattern is reusable across many flows.

The agent knows exactly what to build, in what order, and how to validate it works.
