# Ripple Mart Merchant Dashboard - Design System

## Overview

The Ripple Mart Merchant Dashboard follows a **"Soft Fintech Minimalism"** design philosophy that combines the simplicity of modern e-commerce with the trust cues of a banking application.

---

## 1. Core Design Philosophy

### Key Principles

- **Clean & Airy:** Generous white space, subtle backgrounds
- **Trustworthy:** Professional color palette with Azure Blue as primary
- **Modern:** Rounded corners, soft shadows, smooth transitions
- **Accessible:** High contrast text, clear hierarchy, semantic colors

---

## 2. Color Palette

### Primary Colors

```css
--primary: #007AFF           /* Azure Blue - Primary actions */
--primary-hover: #0066DD     /* Darker blue for hover states */
--primary-light: #EFF6FF     /* Light blue for backgrounds */
```

### Backgrounds

```css
--background: #FFFFFF         /* Clean white */
--background-subtle: #F8F9FA  /* Off-white for page backgrounds */
```

### Text Colors

```css
--foreground: #0F172A        /* slate-900 - Headings */
--foreground-muted: #64748B  /* slate-500 - Descriptions */
```

### Semantic Colors

```css
/* Success/Savings */
--success: #10B981
--success-bg: #D1FAE5

/* Error */
--error: #EF4444

/* Warning */
--warning: #F59E0B
```

### Usage Examples

- **RLUSD Price Tags:** Azure Blue (`#007AFF`)
- **Growth Indicators:** Emerald Green with mint background
- **Status Active:** Green badge with rounded-full shape
- **Status Inactive:** Gray badge with rounded-full shape

---

## 3. Typography

### Font Family

Primary: **Geist Sans** (with fallbacks to Inter, SF Pro, System fonts)

```css
font-family: var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 
             'Segoe UI', 'Inter', 'SF Pro', 'Roboto', sans-serif;
```

### Text Styles

| Element | Size | Weight | Color | Letter Spacing |
|---------|------|--------|-------|----------------|
| Page Title (H1) | 2.25rem (36px) | Bold (700) | slate-900 | -0.011em |
| Section Title (H2) | 1.5rem (24px) | Bold (700) | slate-900 | -0.011em |
| Card Title (H3) | 1.125rem (18px) | Bold (700) | slate-900 | -0.011em |
| Body Text | 0.875rem (14px) | Medium (500) | slate-600 | Normal |
| Stat Value | 1.875rem (30px) | Bold (700) | slate-900 | -0.011em |
| Button Text | 0.875rem (14px) | Semibold (600) | White/Gray | Normal |

### Typography Guidelines

- Use tight letter-spacing (`-0.011em`) for headings to achieve modern look
- Keep body text readable with `font-medium` (500 weight)
- Use `font-semibold` (600) for buttons and emphasis
- Use `font-bold` (700) for large numbers and headings

---

## 4. Spacing & Layout

### Container

```css
max-width: 1280px
padding: 0 1.5rem (24px)
```

### Vertical Rhythm

- **Section spacing:** `mb-8` (2rem / 32px)
- **Card spacing:** `mb-6` (1.5rem / 24px)
- **Element spacing:** `mb-4` (1rem / 16px)
- **Tight spacing:** `mb-2` (0.5rem / 8px)

### Grid Layouts

```html
<!-- 4-column stats grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

<!-- 3-column product grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

---

## 5. Components

### Cards

**Style:** Clean white cards with generous rounded corners

```tsx
<div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 
            dark:border-slate-800 p-6 hover:shadow-md transition-all">
  {/* Card content */}
</div>
```

**Key Features:**
- Border radius: `rounded-2xl` (1.5rem)
- Border: Subtle `border-slate-100`
- Hover: `hover:shadow-md` with smooth transition
- Padding: `p-6` for content area

**Usage:** Stats cards, product cards, info panels

---

### Buttons

#### Primary Button (Call-to-Action)

```tsx
<button class="px-5 py-2.5 bg-[#007AFF] hover:bg-[#0066DD] text-white 
               rounded-full font-semibold shadow-sm transition-all">
  Connect Wallet
</button>
```

**Features:**
- Shape: `rounded-full` (pill shape)
- Background: Solid Azure Blue
- Text: White, semibold
- Shadow: Subtle `shadow-sm`

#### Secondary Button

```tsx
<button class="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 
               border-2 border-slate-200 rounded-full font-semibold 
               transition-all">
  Cancel
</button>
```

**Features:**
- Shape: `rounded-full`
- Background: White with border
- Border: 2px solid gray

#### Ghost Button

```tsx
<button class="text-slate-600 hover:text-[#007AFF] hover:bg-slate-50 
               px-4 py-2 rounded-full transition-all">
  Learn More
</button>
```

---

### Badges (Status Pills)

**Active Status:**
```tsx
<span class="px-3 py-1 text-xs font-semibold rounded-full 
             bg-emerald-50 text-emerald-700">
  Active
</span>
```

**Growth Indicator:**
```tsx
<span class="inline-flex items-center gap-1 px-2 py-1 
             bg-emerald-50 rounded-full">
  <ArrowUpRight class="w-3 h-3 text-emerald-600" />
  <span class="text-xs font-semibold text-emerald-600">+15%</span>
</span>
```

**Info Badge:**
```tsx
<span class="px-2 py-0.5 text-xs font-medium text-slate-500 
             bg-slate-50 rounded-full">
  Merchant
</span>
```

---

### Navigation

**Style:** Minimalist with light background and backdrop blur

```tsx
<nav class="sticky top-0 z-50 border-b border-slate-100 
            bg-white/80 backdrop-blur-xl">
  {/* Navigation content */}
</nav>
```

**Active State:**
- Background: Light blue wash (`bg-[#EFF6FF]`)
- Text: Primary blue (`text-[#007AFF]`)
- Shape: Pill-shaped menu items

**Key Features:**
- Sticky positioning
- Backdrop blur for glassmorphism effect
- Pill-shaped active indicators
- Lucide React icons (thin stroke)

---

### Stat Cards (Financial Display)

Styled like "Order Summary" cards from frontend:

```tsx
<div class="bg-white rounded-2xl border border-slate-100 p-6 
            hover:shadow-md transition-all group">
  {/* Icon with colored background */}
  <div class="p-3 bg-[#EFF6FF] rounded-xl group-hover:scale-110 
              transition-transform">
    <DollarSign class="w-6 h-6 text-[#007AFF]" />
  </div>
  
  {/* Label */}
  <p class="text-sm font-medium text-slate-600 mb-1">Total Revenue</p>
  
  {/* Large value */}
  <p class="text-3xl font-bold text-slate-900">250.00</p>
  
  {/* Currency badge */}
  <p class="text-lg font-semibold text-[#007AFF]">RLUSD</p>
  
  {/* Growth indicator */}
  <div class="inline-flex items-center gap-1 px-2 py-1 
              bg-emerald-50 rounded-full mt-2">
    <ArrowUpRight class="w-3 h-3 text-emerald-600" />
    <span class="text-xs font-semibold text-emerald-600">+15%</span>
  </div>
</div>
```

---

### Tables / Product Lists

Use "Row Cards" instead of dense tables:

```tsx
<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
  {products.map(product => (
    <div class="bg-white rounded-2xl border border-slate-100 
                overflow-hidden hover:shadow-lg transition-all">
      {/* Product image with rounded corners */}
      <img class="w-full aspect-square object-cover" />
      
      {/* Product details with generous padding */}
      <div class="p-5">
        {/* Content */}
      </div>
    </div>
  ))}
</div>
```

---

### Modal Dialogs

```tsx
<div class="fixed inset-0 bg-black/50 backdrop-blur-sm 
            flex items-center justify-center z-50">
  <div class="bg-white rounded-2xl border border-slate-200 
              shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
    {/* Modal content */}
  </div>
</div>
```

**Features:**
- Backdrop: Black overlay with blur (`backdrop-blur-sm`)
- Border radius: `rounded-2xl`
- Shadow: Strong `shadow-2xl`

---

## 6. Shadows

Use soft, diffused shadows for depth:

```css
/* Soft shadow for cards */
shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)

/* Medium shadow for hover states */
shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1)

/* Strong shadow for modals */
shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1)
```

**Usage:**
- Default cards: `shadow-sm` or no shadow
- Hover cards: `hover:shadow-md`
- Modals/Popovers: `shadow-2xl`

---

## 7. Border Radius

Generous rounded corners for modern feel:

```css
rounded-xl: 0.75rem   /* 12px - Input fields */
rounded-2xl: 1rem     /* 16px - Cards */
rounded-full: 9999px  /* Full - Buttons, badges */
```

**Guidelines:**
- Cards: `rounded-2xl`
- Buttons & Badges: `rounded-full`
- Input Fields: `rounded-xl`
- Product Images: `rounded-lg` when nested in cards

---

## 8. Icons

**Library:** Lucide React

**Style:** Thin, rounded stroke icons

```tsx
import { DollarSign, Package, TrendingUp } from 'lucide-react';

<DollarSign className="w-6 h-6" strokeWidth={2} />
```

**Sizing:**
- Small icons (badges): `w-3 h-3`, `strokeWidth={2.5}`
- Medium icons (buttons): `w-4 h-4`, `strokeWidth={2}`
- Large icons (stat cards): `w-6 h-6`, `strokeWidth={2}`

---

## 9. Transitions

Smooth transitions for all interactive elements:

```css
transition-all /* Default for most elements */
transition-transform /* For scale/hover effects */
cubic-bezier(0.4, 0, 0.2, 1) /* Easing function */
```

**Common Patterns:**

```tsx
/* Card hover lift */
<div class="hover:shadow-md transition-all">

/* Icon hover scale */
<div class="group-hover:scale-110 transition-transform">

/* Button hover */
<button class="hover:bg-[#0066DD] transition-all">
```

---

## 10. Dark Mode Support

All components support dark mode using Tailwind's `dark:` prefix:

```tsx
<div class="bg-white dark:bg-slate-900 
            text-slate-900 dark:text-white
            border-slate-100 dark:border-slate-800">
```

**Dark Mode Colors:**
- Background: `#0a0a0a` → `#1a1a1a`
- Text: `#F8FAFC` (off-white)
- Borders: `#1E293B` (slate-800)
- Cards: `slate-900` background

---

## 11. Loading States

### Spinner

```tsx
<div class="inline-block animate-spin rounded-full h-12 w-12 
            border-4 border-slate-200 border-t-[#007AFF]">
</div>
```

### Skeleton (Future)

Use subtle gray backgrounds with shimmer animation.

---

## 12. Responsive Design

### Breakpoints

```css
sm: 640px   /* Small devices */
md: 768px   /* Tablets */
lg: 1024px  /* Desktops */
xl: 1280px  /* Large screens */
```

### Grid Patterns

```tsx
/* Mobile-first approach */
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
```

---

## 13. Accessibility

### Focus States

All interactive elements should have visible focus states:

```tsx
<input class="focus:ring-2 focus:ring-[#007AFF] 
              focus:border-transparent">
```

### Color Contrast

- Body text: Minimum 4.5:1 contrast ratio
- Large text: Minimum 3:1 contrast ratio
- Use `slate-900` for dark text on white backgrounds
- Use `slate-600` for secondary text

---

## 14. Component Library

Reusable components are available in `components/ui/`:

```tsx
import { Card, Button, Badge, StatCard } from '@/components/ui';

// Usage examples
<Button variant="primary" size="md">Connect Wallet</Button>
<Badge variant="success">Active</Badge>
<StatCard 
  title="Total Revenue"
  value="250.00"
  icon={DollarSign}
  iconColor="blue"
/>
```

---

## 15. Best Practices

### Do's ✅

- Use pill-shaped buttons (`rounded-full`)
- Apply generous padding (`p-6` for cards)
- Use soft shadows (`shadow-sm`, `shadow-md`)
- Keep backgrounds clean (white or subtle off-white)
- Highlight key metrics in Azure Blue
- Use growth badges for positive indicators
- Add smooth transitions to all interactive elements
- Use Lucide icons with thin strokes

### Don'ts ❌

- Don't use dark, heavy sidebars
- Don't use sharp corners (prefer `rounded-2xl`)
- Don't use harsh borders (use subtle `border-slate-100`)
- Don't use bright, saturated colors
- Don't use dense layouts without breathing room
- Don't mix rounded styles (square + pill in same context)

---

## 16. Examples

### Complete Stat Card Example

```tsx
<div className="bg-white dark:bg-slate-900 rounded-2xl border 
                border-slate-100 dark:border-slate-800 p-6 
                hover:shadow-md transition-all group">
  <div className="flex items-start justify-between mb-4">
    <div className="p-3 bg-[#EFF6FF] dark:bg-blue-950/30 rounded-xl 
                    group-hover:scale-110 transition-transform">
      <DollarSign className="w-6 h-6 text-[#007AFF]" strokeWidth={2} />
    </div>
  </div>
  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
    Total Revenue
  </p>
  <div className="flex items-baseline gap-2 mb-1">
    <p className="text-3xl font-bold text-slate-900 dark:text-white">
      250.00
    </p>
    <p className="text-lg font-semibold text-[#007AFF]">RLUSD</p>
  </div>
  <div className="inline-flex items-center gap-1 px-2 py-1 
                  bg-emerald-50 dark:bg-emerald-950/30 rounded-full mt-2">
    <ArrowUpRight className="w-3 h-3 text-emerald-600" strokeWidth={2.5} />
    <span className="text-xs font-semibold text-emerald-600">+15%</span>
  </div>
</div>
```

---

## Resources

- **Icons:** [Lucide React](https://lucide.dev/)
- **Colors:** [Tailwind CSS Colors](https://tailwindcss.com/docs/customizing-colors)
- **Font:** Geist Sans (loaded via next/font)

---

## Version History

- **v1.0** (2026-01-08): Initial design system implementation
  - Soft Fintech Minimalism philosophy
  - Azure Blue primary color
  - Comprehensive component library
  - Full dark mode support

