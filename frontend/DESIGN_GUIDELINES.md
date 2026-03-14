# Design Guidelines - Bakso Premium Admin

## Typography Scale

### Headings
| Element | Size | Weight | Usage |
|---------|------|--------|-------|
| H1 / Page Title | `text-lg` (18px) | `font-bold` (700) | Page titles, order numbers |
| H2 / Section Title | `text-sm` (14px) | `font-bold` (700) | Card section headers |
| H3 / Subsection | `text-xs` (12px) | `font-semibold` (600) | Sub-section labels |

### Body Text
| Element | Size | Weight | Usage |
|---------|------|--------|-------|
| Primary Content | `text-sm` (14px) | `font-medium` (500) | Main readable content |
| Secondary Content | `text-xs` (12px) | `font-medium` (500) | Supporting info, labels |
| Tertiary/Meta | `text-[10px]` (10px) | `font-medium` (500) | Timestamps, hints, captions |

### Numbers & Prices
| Element | Size | Weight | Usage |
|---------|------|--------|-------|
| Large Total | `text-lg` (18px) | `font-bold` (700) | Grand totals (highlighted) |
| Price Display | `text-xs` (12px) | `font-bold` (700) | Item prices |
| Counter/Badge | `text-xs` (12px) | `font-bold` (700) | Quantity badges |

---

## Spacing System

### Padding
| Context | Class | Pixels |
|---------|-------|--------|
| Card Inner | `p-3` | 12px |
| Card Compact | `p-2` | 8px |
| Element Inner | `px-2.5 py-1.5` | 10px × 6px |

### Gap (Spacing Between Elements)
| Context | Class | Pixels |
|---------|-------|--------|
| Major Sections | `gap-2` | 8px |
| Related Items | `gap-1.5` | 6px |
| Tight Groups | `gap-1` | 4px |

### Space-Y (Vertical Stacking)
| Context | Class | Pixels |
|---------|-------|--------|
| Card Sections | `space-y-3` | 12px |
| List Items | `space-y-2` | 8px |
| Inline Elements | `space-y-1.5` | 6px |

---

## Element Sizes

### Icons
| Context | Size | Class |
|---------|------|-------|
| Standard Icons | 16×16px | `w-4 h-4` |
| Small Icons | 14×14px | `w-3.5 h-3.5` |
| Mini Icons | 10×10px | `w-2.5 h-2.5` |

### Avatar/Icon Containers
| Context | Size | Class |
|---------|------|-------|
| Section Icons | 32×32px | `w-8 h-8 rounded-lg` |
| User Avatar | 32×32px | `w-8 h-8 rounded-full` |
| Quantity Badge | 36×36px | `w-9 h-9 rounded-lg` |

### Status Indicators
| Context | Size | Class |
|---------|------|-------|
| Progress Circle | 28×28px | `w-7 h-7 rounded-full` |
| Status Dot | 8×8px | `w-2 h-2 rounded-full` |

### Buttons
| Context | Height | Class |
|---------|--------|-------|
| Icon Button | 32px | `w-8 h-8` |
| Action Button | Auto | `px-2.5 py-1.5 text-xs h-auto` |
| Badge Button | Auto | `px-2.5 py-1 text-xs` |

---

## Layout Structure

### Page Container
```jsx
<div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pb-24">
```

### Sticky Header
```jsx
<div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-sm">
  <div className="px-3 py-2.5">
```

### Content Area
```jsx
<div className="p-3 space-y-3">
```

### Card Component
```jsx
<Card className="p-3">
  <div className="flex items-center gap-2 mb-2">
    {/* Icon + Title */}
  </div>
  <div className="space-y-2">
    {/* Content */}
  </div>
</Card>
```

---

## Color System

### Status Colors
| Status | Gradient | Badge Variant |
|--------|----------|---------------|
| Warning/Pending | `from-orange-500 to-amber-500` | `warning` |
| Primary/Active | `from-blue-500 to-cyan-500` | `primary` |
| Success | `from-green-500 to-emerald-500` | `success` |
| Error | `from-red-500 to-pink-500` | `error` |

### Background Accents
| Type | Light Mode | Dark Mode |
|------|------------|-----------|
| Blue Accent | `bg-blue-50` | `bg-blue-900/20` |
| Orange Accent | `bg-orange-50` | `bg-orange-900/20` |
| Green Accent | `bg-green-50` | `bg-green-900/20` |
| Red Accent | `bg-red-50` | `bg-red-900/20` |
| Gray Surface | `bg-gray-50` | `bg-gray-800/50` |

### Border Colors
| Context | Light Mode | Dark Mode |
|---------|------------|-----------|
| Default | `border-gray-200` | `border-gray-700` |
| Blue Accent | `border-blue-200` | `border-blue-800` |
| Orange Accent | `border-orange-200` | `border-orange-800` |
| Green Accent | `border-green-200` | `border-green-900/30` |

---

## Design Principles

### 1. Compact But Readable
- Use smaller fonts but maintain readability
- Reduce padding but keep touch targets accessible
- Tight spacing but preserve visual hierarchy

### 2. Consistent Visual Language
- All cards use `p-3` padding
- All section headers use `text-sm font-bold`
- All icons use `w-4 h-4` standard size
- All rounded corners use `rounded-lg` or `rounded-xl`

### 3. Color-Coded Information
- Orange: Highlights, totals, important actions
- Blue: Information, delivery addresses
- Green: Success states, discounts
- Gray: Neutral content, metadata

### 4. Gradient Accents
- Icons use gradient backgrounds for visual interest
- Buttons use gradient for call-to-action emphasis
- Status indicators use gradient for completion states

### 5. Shadow Hierarchy
| Element | Shadow |
|---------|--------|
| Cards | Default (from Card component) |
| Icons | `shadow-md` |
| Buttons | `shadow-md` |
| Status Circles | `shadow-md` |
| Progress (active) | `shadow-lg` + ring |

---

## Component Patterns

### Section Header Pattern
```jsx
<div className="flex items-center gap-2 mb-2">
  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-{color}-500 to-{color}-500 flex items-center justify-center shadow-md">
    <Icon className="w-4 h-4 text-white" />
  </div>
  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Section Title</h3>
</div>
```

### Info Row Pattern
```jsx
<div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
  <div className="flex items-center gap-2">
    <Icon className="w-4 h-4 text-gray-400" />
    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Label</span>
  </div>
  <span className="text-xs font-semibold text-gray-900 dark:text-white">Value</span>
</div>
```

### List Item Pattern
```jsx
<div className="flex items-start gap-2 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-md">
    {quantity}x
  </div>
  <div className="flex-1 min-w-0">
    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{name}</p>
    {notes && <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{notes}</p>}
  </div>
  <p className="text-orange-600 dark:text-orange-400 font-bold text-xs whitespace-nowrap">{price}</p>
</div>
```

### Status Badge Pattern
```jsx
<Badge variant={status.color} className="text-xs px-2.5 py-1 font-semibold">
  {status.label}
</Badge>
```

---

## Quick Reference

### DO ✅
- Use `text-sm` for primary content
- Use `text-xs` for labels and secondary info
- Use `text-[10px]` for meta/captions only
- Keep `gap-2` as standard spacing
- Use `p-3` for card padding
- Use `w-4 h-4` for icons
- Use `w-8 h-8` for icon containers

### DON'T ❌
- Don't use `text-base` or larger (too big)
- Don't use `gap-4` or larger (too loose)
- Don't use `p-4` or larger (wastes space)
- Don't use `w-5 h-5` icons (too big)
- Don't use `w-10 h-10` containers (too big)
- Don't add extra margin/padding unless necessary

---

## File Reference

| Component | File Path |
|-----------|-----------|
| Order Detail Page | `frontend/src/pages/admin/OrderDetail.jsx` |
| Orders List Page | `frontend/src/pages/admin/Orders.jsx` |
| Base Components | `frontend/src/components/ui/BaseComponents.jsx` |
| Utils | `frontend/src/lib/utils.js` |
| API | `frontend/src/lib/api.js` |

---

*Last updated: 2026-03-15*
*Design system version: Compact v1.0*
