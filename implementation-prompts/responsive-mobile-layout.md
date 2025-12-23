# Implementation Prompt: Responsive Mobile Layout

A reusable prompt for adding mobile responsive layouts to existing desktop implementations.

---

## Overview

**Input**: 
- File path to component/page
- Desktop Figma URL (existing implementation)
- Mobile Figma URL (new layout to implement)

**Output**: 
- Mobile-responsive component that matches BOTH Figma designs
- Desktop layout unchanged (regression-free)
- Verified via screenshots at both viewports

---

## 1. Responsive Implementation Rules

### RULE 1: Preserve Desktop Completely

```
- Do NOT change any styling that affects desktop (≥1024px)
- Wrap desktop-specific layouts in responsive classes
- Desktop implementation is the source of truth for large screens
- If desktop breaks, you have introduced a regression - fix it immediately
```

### RULE 2: Add Mobile Breakpoint (< 768px)

Fetch mobile Figma design and compare with desktop to identify:

| Change Type | Example |
|-------------|---------|
| Layout changes | Multi-column → single column |
| Order changes | Component reordering via flex-order or grid |
| Hidden elements | `display: none` on mobile |
| New mobile-only elements | `display: none` on desktop |
| Size/spacing changes | Padding, margins, font sizes |
| Component variants | Horizontal scroll vs grid |

### RULE 3: Implementation Approach

```
- Use Tailwind responsive prefixes: (default=mobile, md:=tablet, lg:=desktop)
- Mobile-first CSS: base styles for mobile, lg: overrides for desktop
- Use CSS Grid/Flexbox order property for reordering
- Use hidden/block classes for show/hide behavior
- Create mobile-specific component variants only if structure differs significantly
```

### RULE 4: Breakpoint Reference

| Breakpoint | Width | Tailwind Prefix | Verification Viewport |
|------------|-------|-----------------|----------------------|
| Mobile | < 768px | (none - default) | 400×900 |
| Tablet | ≥ 768px | `md:` | - |
| Desktop | ≥ 1024px | `lg:` | 1920×1080 |
| Wide | ≥ 1280px | `xl:` | Only if needed |

---

## 2. Common Responsive Patterns

### Multi-column to Single Column

```tsx
<div className="flex flex-col lg:flex-row lg:gap-6 gap-4">
```

### Grid Column Changes

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

### Horizontal Scroll on Mobile (Carousels)

```tsx
<div className="flex overflow-x-auto lg:grid lg:grid-cols-3 gap-4 pb-2 lg:pb-0 snap-x snap-mandatory -mx-4 px-4 lg:mx-0 lg:px-0">
  <div className="flex-shrink-0 w-[280px] lg:w-auto snap-start">
    {/* Card content */}
  </div>
</div>
```

### Reorder Components

```tsx
<div className="order-2 lg:order-1">  {/* First on desktop, second on mobile */}
<div className="order-1 lg:order-2">  {/* Second on desktop, first on mobile */}
```

### Hide on Mobile / Show on Mobile

```tsx
<div className="hidden lg:block">     {/* Desktop only */}
<div className="block lg:hidden">     {/* Mobile only */}
```

### Responsive Spacing

```tsx
<div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
```

### Responsive Typography

```tsx
<h1 className="text-xl lg:text-2xl font-semibold">
<p className="text-sm lg:text-base">
```

### Full-bleed Mobile Sections

```tsx
<section className="-mx-4 px-4 lg:mx-0 lg:px-0">
```

---

## 3. Section Markers for Verification

Add `data-section` attributes to major sections:

```tsx
<section data-section="metrics" className="...">
<section data-section="products" className="...">
<section data-section="agents" className="...">
<section data-section="integrations" className="...">
<section data-section="resources" className="...">
```

This enables targeted scrolling and verification:

```bash
./eval.js 'document.querySelector("[data-section=\"products\"]").scrollIntoView({block: "start"})'
./screenshot.js --mobile
```

---

## 4. Verification Process

### Desktop Verification (Single Screenshot)

```bash
./eval.js 'window.scrollTo(0, 0)'
./screenshot.js --desktop    # 1920×1080 viewport
# Compare against desktop Figma - must match exactly
```

### Mobile Verification (Multiple Screenshots Required)

Mobile layouts are often very tall (400×5000+). The `--mobile` flag captures a 400×900 viewport. You MUST scroll and take multiple screenshots.

```bash
# First, check total page height
./eval.js 'document.documentElement.scrollHeight'
# Example output: 4500 → need ~5 screenshots (4500/900)
```

**Option A: Scroll by Viewport Height**

```bash
./eval.js 'window.scrollTo(0, 0)'
./screenshot.js --mobile      # Top section (0-900px)

./eval.js 'window.scrollTo(0, 900)'
./screenshot.js --mobile      # Second section (900-1800px)

./eval.js 'window.scrollTo(0, 1800)'
./screenshot.js --mobile      # Third section (1800-2700px)

./eval.js 'window.scrollTo(0, 2700)'
./screenshot.js --mobile      # Fourth section (2700-3600px)
```

**Option B: Scroll to Specific Sections (Recommended)**

```bash
./eval.js 'document.querySelector("[data-section=\"metrics\"]")?.scrollIntoView({block: "start"})'
./screenshot.js --mobile

./eval.js 'document.querySelector("[data-section=\"products\"]")?.scrollIntoView({block: "start"})'
./screenshot.js --mobile

./eval.js 'document.querySelector("[data-section=\"agents\"]")?.scrollIntoView({block: "start"})'
./screenshot.js --mobile
```

---

## 5. Comparing Against Tall Figma Designs

The mobile Figma screenshot will be a single tall image (e.g., 400×5000). Your browser screenshots are 400×900 viewports. Compare each browser screenshot against the CORRESPONDING REGION of the Figma image.

### Strategy A: Get Individual Section Screenshots (Preferred)

```bash
# 1. Get structure of mobile layout
mcp__figma__get_metadata(fileKey, mobileNodeId)
# Returns child nodes with their IDs

# 2. For each major section, get its individual screenshot
mcp__figma__get_screenshot(fileKey, "sectionNodeId")
# Now you have a Figma screenshot sized to that section

# 3. Compare 1:1
# Browser screenshot of section → Figma screenshot of same section
```

### Strategy B: Visual Region Matching

```bash
# 1. Note which section you scrolled to
./eval.js 'document.querySelector("[data-section=products]").scrollIntoView()'
./screenshot.js --mobile

# 2. In the tall Figma image, locate the "Products" section visually
# 3. Compare your browser screenshot against THAT REGION
```

### Strategy C: Use scrollY to Calculate Region

```bash
./eval.js 'window.scrollY'
# Returns: 1800

# Your 400×900 screenshot shows Figma pixels 1800-2700
# Compare against that vertical slice
```

### What to Compare

| Aspect | Check For |
|--------|-----------|
| Layout | Single column vs multi-column, card arrangement |
| Spacing | Gaps between cards, section padding, margins |
| Typography | Font sizes, weights, line heights |
| Component order | Section A before/after Section B |
| Visibility | Elements hidden/shown on mobile |
| Horizontal scroll | Carousel vs grid layout |
| Card widths | Fixed width in scroll vs full-width stacked |
| Touch targets | Buttons/links large enough for mobile |
| Border radius | Rounded corners matching Figma |
| Colors | Background, text, border colors |
| Shadows | Box shadows present/absent |

---

## 6. Section-by-Section Debug Loop

For each section in the page:

### Step 1: Get Figma Reference

```bash
# Option A: Get section's own node screenshot
mcp__figma__get_screenshot(fileKey, sectionNodeId)

# Option B: Note position in full mobile Figma
# Products section is approximately at Y=1200-2000px
```

### Step 2: Get Browser State

```bash
./eval.js 'document.querySelector("[data-section=\"products\"]").scrollIntoView({block: "start"})'
./screenshot.js --mobile
```

### Step 3: Compare Side by Side

```
- Figma shows: 2 product cards per row, 16px gap, cards have shadows
- Browser shows: 1 card per row, 24px gap, no shadows
- MISMATCH FOUND: grid columns, gap size, shadow missing
```

### Step 4: Fix the Code

```diff
- className="gap-6"
+ className="gap-4"

- className="grid-cols-1"
+ className="grid-cols-2 lg:grid-cols-3"

+ className="shadow-sm"
```

### Step 5: Verify Fix

```bash
./screenshot.js --mobile
# Now matches Figma region ✓
```

### Step 6: Verify Desktop Not Broken

```bash
./eval.js 'document.querySelector("[data-section=\"products\"]").scrollIntoView({block: "start"})'
./screenshot.js --desktop
# Still matches desktop Figma ✓
```

### Step 7: Move to Next Section

---

## 7. Documentation Format

Before marking a section complete, document:

```
Section: Products
Browser scroll position: 1200px
Figma region: 1200-2000px (or section node ID: 564:12345)

Comparison results:
- Layout: ✓ matches (single column stacked cards)
- Spacing: ✓ matches (16px gap)
- Typography: ✓ matches (text-sm labels)
- Order: ✓ matches (after metrics, before agents)
- Visibility: ✓ matches (descriptions hidden on mobile)
- Card style: ✓ matches (shadow-sm, rounded-lg)

Desktop regression check: ✓ no changes to desktop layout

Status: VERIFIED
```

---

## 8. Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| Assuming one mobile screenshot covers tall layout | Take 4-8+ screenshots at different scroll positions |
| Using fixed pixel widths that break mobile | Use `max-w-*` or percentage widths |
| Forgetting to make tables horizontally scrollable | Add `overflow-x-auto` wrapper |
| Desktop padding creates cramped mobile layouts | Use responsive padding: `p-4 lg:p-6` |
| Breaking desktop grid by removing `grid-cols-*` | Add mobile override, don't remove desktop |
| Using `lg:flex` when base should be flex | Use `flex-col lg:flex-row` |
| Forgetting negative margin for edge-to-edge carousels | Use `-mx-4 px-4 lg:mx-0 lg:px-0` |
| Skipping desktop regression check | ALWAYS verify both viewports after changes |

---

## 9. Autonomy Rules

Do NOT ask clarifying questions - be autonomous:

- ✅ Fetch BOTH desktop and mobile Figma designs using MCP tools
- ✅ Compare them side-by-side to identify all differences
- ✅ Implement mobile styles WITHOUT breaking desktop
- ✅ For tall mobile layouts, scroll and take multiple screenshots
- ✅ Verify EVERY section of the page at mobile viewport
- ✅ Preserve all existing functionality and interactions
- ✅ Fix your own errors (TypeScript, runtime, visual)
- ✅ Iterate until BOTH viewports match their Figma designs exactly

---

## 10. Completion Checklist

```
[ ] Fetched both desktop and mobile Figma designs
[ ] Identified all differences between desktop and mobile layouts
[ ] Added data-section attributes to major sections
[ ] Implemented responsive styles (mobile-first with lg: overrides)
[ ] Verified desktop layout UNCHANGED at 1920×1080
[ ] Verified ENTIRE mobile layout via scroll + multiple screenshots at 400×900
[ ] Documented comparison results for each section
[ ] No TypeScript errors
[ ] No console errors in browser
[ ] All functionality preserved (interactions, navigation, etc.)
```

### Commit Message Format

```
Add responsive mobile layout for [PageName]

- Verified desktop at 1920×1080: no regressions
- Verified mobile at 400×900: X screenshots taken
- Sections verified: [list sections]
- Layout changes: [brief summary]
```

---

## Why This Level of Detail?

Mobile responsive work is where agents frequently fail because:

1. **They break desktop** while adding mobile styles
2. **They miss tall page sections** by taking only one screenshot
3. **They compare against wrong Figma regions** on tall designs
4. **They don't document what they verified**

This prompt forces:
- Section-by-section verification
- Explicit before/after for both viewports
- Documentation of each comparison
- Clear completion criteria
