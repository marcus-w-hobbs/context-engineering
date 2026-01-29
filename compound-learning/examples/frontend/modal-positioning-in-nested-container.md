---
title: Center Modal Within Container Instead of Viewport
category: frontend
tags: [modal, slideout, positioning, portal, css, fixed, absolute, react]
date: 2026-01-22
---

# Center Modal Within Container Instead of Viewport

## Symptom

Modal appears centered in the entire browser viewport instead of within a slideout/drawer panel. The backdrop covers the whole screen rather than just the container.

```
┌──────────────────────────────────────────┐
│  Main Page        │  Slideout Panel      │
│                   │                      │
│       ┌───────────┼───────┐              │
│       │   Modal   │       │  ← Wrong!    │
│       │  (wrong)  │       │              │
│       └───────────┼───────┘              │
│                   │                      │
└──────────────────────────────────────────┘
```

## Root Cause

Modal uses `position: fixed` CSS which positions relative to the **viewport**, not relative to any parent container. Even when rendered inside a slideout, fixed positioning breaks out of normal document flow.

```tsx
// Problem: fixed positioning ignores parent containers
<div className="fixed inset-0 flex items-center justify-center">
  <div className="modal-content">...</div>
</div>
```

## Solution

1. **Add containerRef prop** to the modal component
2. **Use absolute positioning** when containerRef is provided
3. **Portal to the container** instead of document.body
4. **Ensure container has `position: relative`**

```tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  containerRef?: RefObject<HTMLDivElement>;
}

function Modal({ isOpen, onClose, containerRef }: ModalProps) {
  if (!isOpen) return null;

  const positionClass = containerRef
    ? 'absolute inset-0'   // Relative to container
    : 'fixed inset-0';     // Relative to viewport

  const content = (
    <div className={`${positionClass} flex items-center justify-center z-50`}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl p-6">
        {/* Modal content */}
      </div>
    </div>
  );

  // Portal to container if provided, otherwise render in place
  if (containerRef?.current) {
    return createPortal(content, containerRef.current);
  }
  return content;
}

// Parent component
function SlideoutPanel() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="relative h-full overflow-hidden">
      <ChildComponent containerRef={containerRef} />
    </div>
  );
}
```

Result:
```
┌──────────────────────────────────────────┐
│  Main Page        │  Slideout Panel      │
│                   │  ┌──────────────┐    │
│                   │  │    Modal     │    │
│                   │  │  (correct!)  │ ←  │
│                   │  └──────────────┘    │
│                   │                      │
└──────────────────────────────────────────┘
```

## Prevention

1. **Design modals with container-awareness from the start**
2. **Default to `absolute` for contained contexts**, `fixed` only for viewport-level overlays
3. **Document positioning context** in component props

| Positioning | Relative To | Use Case |
|-------------|-------------|----------|
| `fixed` | Viewport | Full-page modals, toasts |
| `absolute` | Nearest positioned ancestor | Contained modals, dropdowns |

## Related

- Parent must have `position: relative` for absolute children to position correctly
- React's `createPortal` lets you render into any DOM node
- Consider if you actually need a portal—sometimes relative positioning is simpler
