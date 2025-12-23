# Implementation Prompt: Multi-Step Configuration Flow (Step 1)

A complete implementation prompt for Step 1 of a wizard-style configuration flow. This is a real production prompt (sanitized) that demonstrates the level of detail required to make AI agents reliable.

---

## Overview

This document provides a complete implementation guide for Step 1 of a configuration flow in a marketplace application. Step 1 is the "Product Settings" step where users select which products and their associated org groups/locations should be configured.

**Outcome**: After implementing this prompt, users will be able to:
1. Click a "Configure" button on a card from the Dashboard
2. See a slideout panel with product selection options
3. Toggle products to see their org groups
4. Select/deselect org groups and individual locations
5. Click Next to proceed to Step 2 (Settings)

---

## Prerequisites

- Login page is implemented (`src/pages/Login.tsx`)
- Authentication context exists (`src/auth/AuthContext.tsx`)
- Service layer pattern established (`src/services/authClient.ts`)
- `@acme/ui` component library is installed
- Tailwind CSS is configured

---

## 1. Component Inventory

### USE FROM @acme/ui (do NOT recreate)

| Component | Usage | Props to Use |
|-----------|-------|--------------|
| `Button` | Cancel/Next footer buttons, card buttons | `variant="primary"` or `variant="secondary"`, `size="md"`, `disabled`, `onPress` |
| `Toggle` | Product selection on/off | `checked`, `onChange` |
| `Checkbox` | Org group and location selection | `checked`, `indeterminate`, `onChange` |
| `Badge` | Category label | `variant` for color |

> **IMPORTANT**: Check `@acme/ui` exports first. If a component is not available, implement it. Do NOT install shadcn or other component libraries.

### CREATE AS NEW COMPONENTS

| Component | File Path | Description |
|-----------|-----------|-------------|
| `SlideoutPanel` | `src/components/SlideoutPanel.tsx` | Generic slideout container with overlay backdrop |
| `StepIndicator` | `src/components/StepIndicator.tsx` | Multi-step progress indicator |
| `ItemCard` | `src/components/ItemCard.tsx` | Card displaying an item with actions |
| `ProductSelector` | `src/components/config-flow/ProductSelector.tsx` | Product toggle card |
| `OrgGroupTable` | `src/components/config-flow/OrgGroupTable.tsx` | Expandable table of org groups/locations |
| `FlowHeader` | `src/components/config-flow/FlowHeader.tsx` | Icon + badge + title section in slideout |
| `ConfigFlowStep1` | `src/components/config-flow/ConfigFlowStep1.tsx` | Step 1 content composition |
| `TopNavBar` | `src/components/TopNavBar.tsx` | Navigation bar (responsive) |

### FILE STRUCTURE TO CREATE

```
src/
├── components/
│   ├── SlideoutPanel.tsx
│   ├── StepIndicator.tsx
│   ├── ItemCard.tsx
│   ├── TopNavBar.tsx
│   └── config-flow/
│       ├── ProductSelector.tsx
│       ├── OrgGroupTable.tsx
│       ├── FlowHeader.tsx
│       ├── ConfigFlowStep1.tsx
│       └── index.ts
├── services/
│   ├── orgGroupClient.ts          # Interface + factory
│   ├── orgGroupClient.mock.ts     # Mock implementation
│   └── orgGroupClient.api.ts      # API implementation (stub)
├── types/
│   └── config-flow.ts             # TypeScript types
└── constants/
    └── mockData.ts                # Add org group mock data
```

---

## 2. Architecture Rules

### Routing & Mounting

```
CRITICAL: The config flow does NOT use React Router navigation.

The Dashboard component conditionally renders the SlideoutPanel:
- Dashboard stays mounted (state preserved, visible but dimmed)
- SlideoutPanel renders as overlay with semi-transparent backdrop
- Clicking overlay backdrop, Cancel button, X button, or pressing ESC closes the slideout
- This is NOT a route change - it's a modal/slideout pattern
```

### Component Hierarchy

```tsx
// src/pages/Dashboard.tsx (updated structure)
<DashboardPage>
  <TopNavBar />

  <main>
    {/* Welcome section */}
    <WelcomeHeader userName={user.first_name} />

    {/* My Items carousel */}
    <section>
      <h2>My items</h2>
      <ItemCarousel>
        {myItems.map(item => (
          <ItemCard
            key={item.id}
            item={item}
            onConfigure={() => openConfigFlow(item.type)}
            onViewActivity={() => navigate(`/items/${item.id}/activity`)}
          />
        ))}
      </ItemCarousel>
    </section>

    {/* Marketplace carousel */}
    <section>
      <h2>Marketplace</h2>
      <ItemCarousel>
        {marketplaceItems.map(item => (
          <ItemCard
            key={item.id}
            item={item}
            onConfigure={() => openConfigFlow(item.type)}
          />
        ))}
      </ItemCarousel>
    </section>
  </main>

  {/* Slideout renders here, overlaying dashboard */}
  {configFlowState.isOpen && (
    <SlideoutPanel onClose={closeConfigFlow}>
      <ConfigFlow
        itemType={configFlowState.itemType}
        onComplete={handleConfigComplete}
        onCancel={closeConfigFlow}
      />
    </SlideoutPanel>
  )}
</DashboardPage>
```

### Responsive Behavior

| Breakpoint | Slideout Width | Step Indicator | Product Selectors |
|------------|----------------|----------------|-------------------|
| Desktop (≥1024px) | 783px from right | Horizontal at top | Side-by-side |
| Mobile (<1024px) | Full width minus 24px left gap | Vertical list | Stacked vertically |

---

## 3. State Machine

### Step 1 Flow States

```
┌─────────────────────────────────────────────────────────────────────┐
│                         STEP 1 STATES                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  EMPTY ─────────────────> PRODUCT_SELECTED ─────────────> READY    │
│    │                            │                           │      │
│    │ toggle product ON          │ select ≥1 org group       │      │
│    │                            │                           │      │
│    │                            ▼                           │      │
│    │                      ORG_EXPANDED                      │      │
│    │                      (UI substate for                  │      │
│    │                       expanded accordion)              │      │
│    │                                                        │      │
│    └────────────────────────────────────────────────────────┘      │
│                     [Cancel / X / Backdrop / ESC]                   │
│                              │                                      │
│                              ▼                                      │
│                           CLOSED                                    │
└─────────────────────────────────────────────────────────────────────┘
```

### State Transitions

| Current State | Trigger | Next State | Side Effects |
|---------------|---------|------------|--------------|
| CLOSED | Click "Configure" on card | EMPTY | Open slideout, fetch available products |
| EMPTY | Toggle Product A ON | PRODUCT_SELECTED | Fetch Product A org groups, show table |
| EMPTY | Toggle Product B ON | PRODUCT_SELECTED | Fetch Product B org groups, show table |
| PRODUCT_SELECTED | Toggle all products OFF | EMPTY | Hide org tables, disable Next |
| PRODUCT_SELECTED | Select ≥1 org group | READY | Enable Next button |
| READY | Deselect all org groups | PRODUCT_SELECTED | Disable Next button |
| READY | Click Next | → STEP_2 | Pass selections to Step 2 |
| ANY | Click Cancel/X/Backdrop/ESC | CLOSED | Close slideout, reset state |

### Next Button Enable Logic

```typescript
const canProceed = useMemo(() => {
  const hasProductSelected = productAEnabled || productBEnabled;
  const hasOrgGroupSelected = Array.from(selections.values())
    .some(sel => sel.selected || sel.indeterminate);

  return hasProductSelected && hasOrgGroupSelected;
}, [productAEnabled, productBEnabled, selections]);
```

---

## 4. Data Models

### TypeScript Interfaces

Create file: `src/types/config-flow.ts`

```typescript
// ============================================================================
// ITEM TYPES
// ============================================================================

export type ItemType = 'automation' | 'scheduling' | 'support' | 'analytics';
export type ItemCategory = 'operations' | 'analytics';
export type ItemStatus = 'configured' | 'available' | 'coming-soon';

export interface Item {
  id: string;
  type: ItemType;
  name: string;
  category: ItemCategory;
  status: ItemStatus;
  description: string;
  bullets: ItemBullet[];
  iconUrl?: string;
}

export interface ItemBullet {
  label: string;
  description: string;
}

// ============================================================================
// PRODUCT & ORG GROUP TYPES
// ============================================================================

export type ProductType = 'productA' | 'productB';

export interface OrgGroup {
  id: string;
  name: string;
  productType: ProductType;
  locationCount: number;
  locations: Location[];
}

export interface Location {
  id: string;
  name: string;
  groupId: string;
  orgGroupId: string;
}

// ============================================================================
// SELECTION STATE TYPES
// ============================================================================

export interface OrgGroupSelection {
  orgGroupId: string;
  selected: boolean;               // true = all locations selected
  indeterminate: boolean;          // true = some (not all) locations selected
  expanded: boolean;               // UI state for accordion
  locationSelections: Record<string, boolean>;  // locationId -> selected
}

export interface ProductSelection {
  productType: ProductType;
  enabled: boolean;
  orgGroups: OrgGroup[];
  selections: Record<string, OrgGroupSelection>;  // orgGroupId -> selection
}

export interface ConfigFlowStep1State {
  itemType: ItemType;
  products: {
    productA: ProductSelection;
    productB: ProductSelection;
  };
}

// ============================================================================
// CONFIGURATION SUMMARY
// ============================================================================

export interface ConfigurationSummary {
  productCount: number;
  orgGroupCount: number;
  locationCount: number;
}

export function calculateSummary(state: ConfigFlowStep1State): ConfigurationSummary {
  let productCount = 0;
  let orgGroupCount = 0;
  let locationCount = 0;

  for (const product of Object.values(state.products)) {
    if (!product.enabled) continue;

    let productHasSelections = false;

    for (const selection of Object.values(product.selections)) {
      if (selection.selected || selection.indeterminate) {
        productHasSelections = true;
        orgGroupCount++;
        locationCount += Object.values(selection.locationSelections)
          .filter(Boolean).length;
      }
    }

    if (productHasSelections) {
      productCount++;
    }
  }

  return { productCount, orgGroupCount, locationCount };
}

// ============================================================================
// STEP INDICATOR TYPES
// ============================================================================

export type StepStatus = 'complete' | 'current' | 'upcoming';

export interface Step {
  id: string;
  label: string;
  status: StepStatus;
}
```

### Service Interface

Create file: `src/services/orgGroupClient.ts`

```typescript
import type { OrgGroup, ProductType } from '@/types/config-flow';
import { MockOrgGroupClient } from './orgGroupClient.mock';
// import { ApiOrgGroupClient } from './orgGroupClient.api';

export interface IOrgGroupClient {
  /**
   * Fetch available org groups for a product type.
   * Called when user toggles a product ON.
   */
  getOrgGroupsByProduct(productType: ProductType): Promise<OrgGroup[]>;
}

// Toggle based on environment
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false';

export const orgGroupClient: IOrgGroupClient = USE_MOCK
  ? new MockOrgGroupClient()
  : new MockOrgGroupClient(); // TODO: Replace with ApiOrgGroupClient when ready
```

Create file: `src/services/orgGroupClient.mock.ts`

```typescript
import type { IOrgGroupClient } from './orgGroupClient';
import type { OrgGroup, ProductType } from '@/types/config-flow';
import { MOCK_ORG_GROUPS, MOCK_DELAYS } from '@/constants/mockData';

export class MockOrgGroupClient implements IOrgGroupClient {
  async getOrgGroupsByProduct(productType: ProductType): Promise<OrgGroup[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAYS.default));

    return MOCK_ORG_GROUPS[productType] || [];
  }
}
```

---

## 5. Mock Data

Add to `src/constants/mockData.ts`:

```typescript
import type { Item, OrgGroup, ProductType } from '@/types/config-flow';

export const MOCK_DELAYS = {
  default: 500,
};

// ============================================================================
// ITEM MOCK DATA
// ============================================================================

export const MOCK_ITEMS: Item[] = [
  {
    id: 'automation-item',
    type: 'automation',
    name: 'Automation',
    category: 'operations',
    status: 'available',
    description: 'Automates routine tasks via SMS and email',
    bullets: [
      { label: 'Less Manual Work:', description: 'Handles routine communications' },
      { label: 'Fewer Delays:', description: 'Sends timely notifications' },
      { label: 'Better Prep:', description: 'Shares info ahead of time' },
    ],
  },
  {
    id: 'scheduling-item',
    type: 'scheduling',
    name: 'Scheduling',
    category: 'operations',
    status: 'available',
    description: 'Fills open slots and manages bookings automatically',
    bullets: [
      { label: 'More Bookings:', description: 'Fills open slots automatically' },
      { label: 'Less Admin Work:', description: 'Automates outbound scheduling' },
      { label: 'Faster Conversions:', description: 'Engages high-interest leads' },
    ],
  },
  {
    id: 'support-item',
    type: 'support',
    name: 'Support',
    category: 'operations',
    status: 'coming-soon',
    description: 'Routes requests to the right person efficiently',
    bullets: [
      { label: 'Faster Response:', description: 'Auto-routes to the right person' },
      { label: 'Shorter Waits:', description: 'Reduces hold times and callbacks' },
      { label: 'Smarter Intake:', description: 'Captures request details up front' },
    ],
  },
  {
    id: 'analytics-item',
    type: 'analytics',
    name: 'Analytics',
    category: 'analytics',
    status: 'coming-soon',
    description: 'Streamlines reporting and insights',
    bullets: [
      { label: 'Better Insights:', description: 'Auto-generates reports' },
      { label: 'Less Manual Work:', description: 'Reduces data entry' },
      { label: 'Smarter Decisions:', description: 'Surfaces key metrics' },
    ],
  },
];

// ============================================================================
// ORG GROUP MOCK DATA
// ============================================================================

export const MOCK_ORG_GROUPS: Record<ProductType, OrgGroup[]> = {
  productA: [
    {
      id: 'org-a-1',
      name: 'Acme Corporation',
      productType: 'productA',
      locationCount: 3,
      locations: [
        { id: 'loc-1', name: 'Downtown Office', groupId: 'GRP-001', orgGroupId: 'org-a-1' },
        { id: 'loc-2', name: 'West Side Center', groupId: 'GRP-002', orgGroupId: 'org-a-1' },
        { id: 'loc-3', name: 'Riverside Branch', groupId: 'GRP-003', orgGroupId: 'org-a-1' },
      ],
    },
    {
      id: 'org-a-2',
      name: 'Summit Partners',
      productType: 'productA',
      locationCount: 2,
      locations: [
        { id: 'loc-4', name: 'Main Street', groupId: 'GRP-004', orgGroupId: 'org-a-2' },
        { id: 'loc-5', name: 'Plaza Location', groupId: 'GRP-005', orgGroupId: 'org-a-2' },
      ],
    },
    {
      id: 'org-a-3',
      name: 'Premier Services',
      productType: 'productA',
      locationCount: 1,
      locations: [
        { id: 'loc-6', name: 'North Campus', groupId: 'GRP-006', orgGroupId: 'org-a-3' },
      ],
    },
  ],
  productB: [
    {
      id: 'org-b-1',
      name: 'Bright Network',
      productType: 'productB',
      locationCount: 2,
      locations: [
        { id: 'loc-7', name: 'East Side Office', groupId: 'GRP-007', orgGroupId: 'org-b-1' },
        { id: 'loc-8', name: 'Harbor View', groupId: 'GRP-008', orgGroupId: 'org-b-1' },
      ],
    },
    {
      id: 'org-b-2',
      name: 'Coastal Partners',
      productType: 'productB',
      locationCount: 3,
      locations: [
        { id: 'loc-9', name: 'Beach Boulevard', groupId: 'GRP-009', orgGroupId: 'org-b-2' },
        { id: 'loc-10', name: 'Marina Office', groupId: 'GRP-010', orgGroupId: 'org-b-2' },
        { id: 'loc-11', name: 'Pier View Center', groupId: 'GRP-011', orgGroupId: 'org-b-2' },
      ],
    },
  ],
};
```

---

## 6. Component Specifications

### 6.1 SlideoutPanel

**File**: `src/components/SlideoutPanel.tsx`

**Purpose**: Generic container for slideout panels with overlay backdrop.

**Props**:
```typescript
interface SlideoutPanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: 'default' | 'wide';  // default = 783px
}
```

**Behavior**:
- Renders semi-transparent overlay backdrop
- Panel slides in from right edge
- Clicking backdrop calls `onClose`
- ESC key calls `onClose`
- Body scroll is locked when open
- Focus trap within panel (tab navigation stays inside)
- Smooth animation (300ms ease-out)

**Desktop Layout** (≥1024px):
```
┌────────────────────────────────────────────────────────────────┐
│ [Dashboard content - dimmed]            │    SlideoutPanel    │
│                                         │    width: 783px     │
│   70% opacity overlay                   │    bg-white         │
│   bg-[#0a0d12]                          │                     │
│   click to close                        │                     │
└────────────────────────────────────────────────────────────────┘
```

**Mobile Layout** (<1024px):
```
┌────────────────────────────────────────────────────────────┐
│24px│              SlideoutPanel                            │
│gap │              (full remaining width)                   │
│    │              bg-white                                 │
│    │              shadow-xl                                │
└────────────────────────────────────────────────────────────┘
```

**Styling**:
```css
/* Overlay */
.slideout-overlay {
  @apply fixed inset-0 bg-[#0a0d12]/70 z-40;
}

/* Panel */
.slideout-panel {
  @apply fixed top-0 right-0 bottom-0 bg-white z-50;
  @apply w-[783px] max-w-[calc(100%-24px)];
  @apply shadow-xl;
  @apply flex flex-col;
}

/* Mobile */
@media (max-width: 1023px) {
  .slideout-panel {
    @apply left-6 w-auto;
  }
}
```

---

### 6.2 StepIndicator

**File**: `src/components/StepIndicator.tsx`

**Purpose**: Shows progress through multi-step flow.

**Props**:
```typescript
interface StepIndicatorProps {
  steps: Step[];
  className?: string;
}
```

**Visual States**:
- **Complete**: Blue filled circle with white checkmark inside
- **Current**: Blue filled circle with white dot, blue focus ring (4px)
- **Upcoming**: Gray outlined circle with gray dot

**Desktop Layout** (horizontal):
```
     ●────────────────────○
Product settings     Configuration
   (current)          (upcoming)
```

**Mobile Layout** (vertical):
```
● Product Settings
│
○ Configuration
```

**Implementation**:
```tsx
export function StepIndicator({ steps, className }: StepIndicatorProps) {
  const isMobile = useMediaQuery('(max-width: 1023px)');

  return (
    <div className={cn(
      'flex items-center',
      isMobile ? 'flex-col items-start gap-4' : 'justify-center gap-4',
      className
    )}>
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          {/* Connector line (not before first item) */}
          {index > 0 && !isMobile && (
            <div className="flex-1 h-px bg-gray-200 max-w-[200px]" />
          )}
          {index > 0 && isMobile && (
            <div className="w-px h-6 bg-gray-200 ml-3" />
          )}

          {/* Step */}
          <div className={cn(
            'flex items-center gap-3',
            isMobile && 'flex-row'
          )}>
            <StepIcon status={step.status} />
            <span className={cn(
              'text-sm font-semibold',
              step.status === 'current' && 'text-[#005ec6]',
              step.status === 'upcoming' && 'text-gray-500',
              step.status === 'complete' && 'text-[#005ec6]'
            )}>
              {step.label}
            </span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

function StepIcon({ status }: { status: StepStatus }) {
  if (status === 'complete') {
    return (
      <div className="w-6 h-6 rounded-full bg-[#0069dc] flex items-center justify-center">
        <CheckIcon className="w-4 h-4 text-white" />
      </div>
    );
  }

  if (status === 'current') {
    return (
      <div className="w-6 h-6 rounded-full bg-[#0069dc] flex items-center justify-center ring-4 ring-[#0074e8]/30 ring-offset-2 ring-offset-white">
        <div className="w-2 h-2 rounded-full bg-white" />
      </div>
    );
  }

  // upcoming
  return (
    <div className="w-6 h-6 rounded-full border-2 border-gray-200 flex items-center justify-center">
      <div className="w-2 h-2 rounded-full bg-gray-200" />
    </div>
  );
}
```

---

### 6.3 OrgGroupTable

**File**: `src/components/config-flow/OrgGroupTable.tsx`

**Purpose**: Expandable table showing org groups and their locations.

**Props**:
```typescript
interface OrgGroupTableProps {
  orgGroups: OrgGroup[];
  selections: Record<string, OrgGroupSelection>;
  onOrgGroupToggle: (orgGroupId: string, selected: boolean) => void;
  onLocationToggle: (orgGroupId: string, locationId: string, selected: boolean) => void;
  onExpandToggle: (orgGroupId: string) => void;
  loading?: boolean;
}
```

**Layout**:
```
┌──────────────────────────────────────────────────────────────────────┐
│ [☑] Acme Corporation (3 locations)                              [▼] │
├──────────────────────────────────────────────────────────────────────┤
│     [☑] Downtown Office                                              │
│     [☑] West Side Center                                             │
│     [☑] Riverside Branch                                             │
├──────────────────────────────────────────────────────────────────────┤
│ [☐] Summit Partners (2 locations)                               [▶] │
└──────────────────────────────────────────────────────────────────────┘
```

**Checkbox States**:
- **Unchecked** (`[ ]`): No locations selected in this org group
- **Indeterminate** (`[-]`): Some (but not all) locations selected
- **Checked** (`[✓]`): All locations in org group selected

**Selection Logic**:
```typescript
// When org group checkbox is clicked:
function handleOrgGroupToggle(orgGroupId: string, newSelected: boolean) {
  // If turning ON: select all locations
  // If turning OFF: deselect all locations
  const orgGroup = orgGroups.find(og => og.id === orgGroupId);
  if (!orgGroup) return;

  orgGroup.locations.forEach(location => {
    onLocationToggle(orgGroupId, location.id, newSelected);
  });
}

// Compute org group checkbox state from location selections:
function getOrgGroupCheckboxState(selection: OrgGroupSelection): {
  checked: boolean;
  indeterminate: boolean;
} {
  const locationValues = Object.values(selection.locationSelections);
  const selectedCount = locationValues.filter(Boolean).length;
  const totalCount = locationValues.length;

  if (selectedCount === 0) {
    return { checked: false, indeterminate: false };
  }
  if (selectedCount === totalCount) {
    return { checked: true, indeterminate: false };
  }
  return { checked: false, indeterminate: true };
}
```

---

## 7. Implementation Steps

### Phase 1: Foundation (do first)

1. **Create types file**: `src/types/config-flow.ts`
2. **Add mock data**: Update `src/constants/mockData.ts` with items and org groups
3. **Create service layer**: `src/services/orgGroupClient.ts` and `orgGroupClient.mock.ts`

### Phase 2: Core Components

4. **Create SlideoutPanel**: `src/components/SlideoutPanel.tsx`
   - Test with simple content before integrating
   - Verify overlay click-to-close, ESC key, body scroll lock

5. **Create StepIndicator**: `src/components/StepIndicator.tsx`
   - Test both horizontal (desktop) and vertical (mobile) layouts

6. **Create ItemIcon**: `src/components/ItemIcon.tsx`
   - Extract SVG from design or use placeholder

### Phase 3: Config Flow Components

7. **Create ProductSelector**: `src/components/config-flow/ProductSelector.tsx`
8. **Create OrgGroupTable**: `src/components/config-flow/OrgGroupTable.tsx`
   - Pay special attention to checkbox indeterminate state
9. **Create FlowHeader**: `src/components/config-flow/FlowHeader.tsx`
10. **Create ConfigFlowStep1**: `src/components/config-flow/ConfigFlowStep1.tsx`

### Phase 4: Integration

11. **Create ItemCard**: `src/components/ItemCard.tsx`
12. **Update Dashboard**: `src/pages/Dashboard.tsx`
    - Add TopNavBar
    - Add item carousels (My Items, Marketplace)
    - Add slideout panel rendering
    - Add config flow state management

### Phase 5: Polish

13. **Add loading states and skeletons**
14. **Test responsive behavior**
15. **Test accessibility (keyboard navigation, screen readers)**

---

## 8. Acceptance Criteria

### Functional Requirements

- [ ] Slideout opens when user clicks "Configure" on item card
- [ ] Slideout closes via: X button, Cancel button, clicking backdrop, ESC key
- [ ] Step indicator shows "Product settings" as current, "Configuration" as upcoming
- [ ] Next button is disabled when no products are enabled
- [ ] Next button is disabled when no org groups are selected
- [ ] Toggling Product A ON fetches and displays Product A org groups
- [ ] Toggling Product B ON fetches and displays Product B org groups
- [ ] Org groups show location count in parentheses
- [ ] Clicking chevron expands/collapses org group to show locations
- [ ] Selecting an org group checkbox selects all its locations
- [ ] Deselecting one location shows org group as indeterminate
- [ ] Deselecting all locations unchecks the org group
- [ ] Configuration summary updates in real-time
- [ ] Next button enables when ≥1 product enabled AND ≥1 org group selected
- [ ] Clicking Next passes selection state to parent (for Step 2)

### Responsive Requirements

- [ ] Desktop (≥1024px): 783px slideout, horizontal steps, side-by-side products
- [ ] Mobile (<1024px): Full-width slideout with 24px left gap, vertical steps, stacked products

### Accessibility Requirements

- [ ] Focus trap: Tab stays within slideout when open
- [ ] ESC key closes slideout
- [ ] Checkboxes announce state correctly (checked, unchecked, indeterminate)
- [ ] Expand/collapse buttons have aria-expanded attribute
- [ ] Close button has aria-label

### Code Quality Requirements

- [ ] No mock data in components - all data from service layer
- [ ] TypeScript types for all props and state
- [ ] Components from @acme/ui used where available
- [ ] Responsive styles using Tailwind breakpoints (`lg:`, `md:`)

---

## 9. Testing Checklist

After implementation, manually verify:

1. **Open slideout**: Click "Configure" on item card
2. **Close methods**: Test X, Cancel, backdrop click, ESC key
3. **Product toggle**: Toggle Product A on, verify loading state, verify table appears
4. **Org group selection**: Check an org group, verify all locations become checked
5. **Location deselection**: Uncheck one location, verify org group shows indeterminate
6. **Next button logic**: Verify disabled until selections made
7. **Mobile view**: Resize browser, verify responsive layout changes
8. **Keyboard navigation**: Tab through all interactive elements

---

## 10. Notes for Implementers

### On Component Reuse

The following components will be reused across the application:
- `SlideoutPanel`: Used for all config flows, settings panels
- `StepIndicator`: Used in all multi-step flows
- `ItemCard`: Used in dashboard carousels
- `TopNavBar`: Used on all authenticated pages

Design them to be generic and configurable.

### On the @acme/ui Library

Before implementing a component, check if it exists in `@acme/ui`:
```typescript
import { Button, Toggle, Checkbox, Badge, Input, Select } from '@acme/ui';
```

If a component doesn't exist or doesn't have the needed features, implement it locally but follow the same API patterns.

### On State Management

For Step 1, local component state (`useState`) is sufficient. The state is passed to Step 2 via the `onNext` callback. If the application grows to need global state for the config flow (e.g., to persist across browser refresh), consider lifting to context or a state manager.

### On Checkbox Indeterminate

The indeterminate state requires special handling—it's not a third state but a visual indicator that some (not all) children are selected. The `checked` prop should be `false` when indeterminate.

### On State Persistence

If user navigates back from Step 2 to Step 1, their Step 2 input should be preserved. Store all state in the parent component or context. Reset only when slideout closes.

### On Service Layer

Remember: NO mock data in components. Create:
- `orgGroupClient.ts` — Interface
- `orgGroupClient.mock.ts` — Mock implementation with simulated delay
- Import only from `orgGroupClient.ts` in components

---

## Why This Level of Detail?

This prompt demonstrates several key principles:

1. **Component Inventory**: Explicitly listing what to USE vs CREATE prevents agents from recreating existing components or installing new libraries.

2. **State Machine**: Visual diagrams and transition tables eliminate ambiguity about how the UI should behave.

3. **TypeScript Types First**: Defining interfaces before implementation ensures type safety and clear contracts.

4. **Service Layer Pattern**: Forcing all data through services (not inline mock data) makes the codebase production-ready from day one.

5. **Acceptance Criteria**: Checkboxes make "done" unambiguous and enable self-verification.

6. **Implementation Phases**: Ordering the work prevents blocked dependencies.

The agent becomes an **executor**, not a decision-maker. Every architectural and design decision is pre-made.
