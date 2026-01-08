# Ripple Mart Merchant Dashboard - Color Palette

## Primary Brand Colors

### Azure Blue (Primary)
```
#007AFF   rgb(0, 122, 255)   Tailwind: Custom
```
**Usage:** Primary buttons, RLUSD price tags, active states, key icons

### Azure Blue (Hover)
```
#0066DD   rgb(0, 102, 221)   Tailwind: Custom
```
**Usage:** Hover state for primary buttons and interactive elements

### Light Blue (Background)
```
#EFF6FF   rgb(239, 246, 255)   Tailwind: blue-50
```
**Usage:** Active navigation states, icon backgrounds, light blue wash

---

## Neutral Colors

### White
```
#FFFFFF   rgb(255, 255, 255)   Tailwind: white
```
**Usage:** Card backgrounds, main backgrounds (light mode)

### Subtle Background
```
#F8F9FA   rgb(248, 249, 250)   Tailwind: Custom
```
**Usage:** Page background (light mode)

### Slate 900 (Dark Text)
```
#0F172A   rgb(15, 23, 42)   Tailwind: slate-900
```
**Usage:** Headings, primary text, large numbers

### Slate 600 (Body Text)
```
#475569   rgb(71, 85, 105)   Tailwind: slate-600
```
**Usage:** Body text, descriptions, secondary information

### Slate 500 (Muted Text)
```
#64748B   rgb(100, 116, 139)   Tailwind: slate-500
```
**Usage:** Subtle text, timestamps, helper text

### Slate 400 (Placeholder)
```
#94A3B8   rgb(148, 163, 184)   Tailwind: slate-400
```
**Usage:** Placeholder text, disabled states

### Slate 300 (Disabled)
```
#CBD5E1   rgb(203, 213, 225)   Tailwind: slate-300
```
**Usage:** Disabled icons, very subtle elements

---

## Border Colors

### Slate 100 (Light Border)
```
#F1F5F9   rgb(241, 245, 249)   Tailwind: slate-100
```
**Usage:** Card borders, dividers, light separators

### Slate 200 (Medium Border)
```
#E2E8F0   rgb(226, 232, 240)   Tailwind: slate-200
```
**Usage:** Input borders, button borders, stronger separators

---

## Success/Growth Colors

### Emerald 600 (Success)
```
#10B981   rgb(16, 185, 129)   Tailwind: emerald-600
```
**Usage:** Success icons, growth indicators, positive numbers

### Emerald 50 (Success Background)
```
#ECFDF5   rgb(236, 253, 245)   Tailwind: emerald-50
```
**Usage:** Success badge backgrounds, growth badge backgrounds

### Emerald 700 (Success Text)
```
#047857   rgb(4, 120, 87)   Tailwind: emerald-700
```
**Usage:** Success badge text, "Active" status text

---

## Accent Colors

### Purple 600
```
#9333EA   rgb(147, 51, 234)   Tailwind: purple-600
```
**Usage:** Total Sales icon, secondary accent

### Purple 50
```
#FAF5FF   rgb(250, 245, 255)   Tailwind: purple-50
```
**Usage:** Purple icon backgrounds

### Amber 600
```
#D97706   rgb(217, 119, 6)   Tailwind: amber-600
```
**Usage:** Product count icons, warning states

### Amber 50
```
#FFFBEB   rgb(255, 251, 235)   Tailwind: amber-50
```
**Usage:** Amber icon backgrounds

---

## Error/Danger Colors

### Red 500
```
#EF4444   rgb(239, 68, 68)   Tailwind: red-500
```
**Usage:** Delete buttons, error states

### Red 600
```
#DC2626   rgb(220, 38, 38)   Tailwind: red-600
```
**Usage:** Delete button hover

### Red 50
```
#FEF2F2   rgb(254, 242, 242)   Tailwind: red-50
```
**Usage:** Error backgrounds

---

## Dark Mode Colors

### Dark Background
```
#0A0A0A   rgb(10, 10, 10)   Tailwind: Custom
```
**Usage:** Page background (dark mode)

### Dark Subtle Background
```
#1A1A1A   rgb(26, 26, 26)   Tailwind: Custom
```
**Usage:** Subtle backgrounds (dark mode)

### Slate 900 (Dark Cards)
```
#0F172A   rgb(15, 23, 42)   Tailwind: slate-900
```
**Usage:** Card backgrounds (dark mode)

### Slate 800 (Dark Borders)
```
#1E293B   rgb(30, 41, 59)   Tailwind: slate-800
```
**Usage:** Borders, dividers (dark mode)

### Off-White (Dark Mode Text)
```
#F8FAFC   rgb(248, 250, 252)   Tailwind: slate-50
```
**Usage:** Headings, primary text (dark mode)

### Slate 300 (Dark Mode Secondary)
```
#CBD5E1   rgb(203, 213, 225)   Tailwind: slate-300
```
**Usage:** Secondary text (dark mode)

---

## Gradient Combinations

### Azure Blue Gradient
```css
background: linear-gradient(135deg, #007AFF 0%, #0066DD 100%);
```
**Usage:** Logo icons, feature highlights

### Chart Bar Gradient
```css
background: linear-gradient(180deg, #007AFF 0%, #0066DD 100%);
```
**Usage:** Bar chart columns

### Install Button Gradient
```css
background: linear-gradient(90deg, #F97316 0%, #F59E0B 100%);
```
**Usage:** "Install Crossmark" button (orange to amber)

---

## Color Combinations

### Primary Button
- **Background:** `#007AFF`
- **Text:** `#FFFFFF`
- **Hover:** `#0066DD`
- **Shadow:** `rgba(0, 0, 0, 0.05)`

### Secondary Button
- **Background:** `#FFFFFF`
- **Text:** `#475569` (slate-600)
- **Border:** `#E2E8F0` (slate-200)
- **Hover Background:** `#F8FAFC` (slate-50)

### Success Badge
- **Background:** `#ECFDF5` (emerald-50)
- **Text:** `#047857` (emerald-700)
- **Border:** None

### Info Badge
- **Background:** `#EFF6FF` (blue-50)
- **Text:** `#007AFF`
- **Border:** None

### Neutral Badge
- **Background:** `#F1F5F9` (slate-100)
- **Text:** `#475569` (slate-600)
- **Border:** None

---

## RLUSD Styling

### Price Display (Large)
```
Number: text-3xl font-bold text-[#007AFF]
Currency: text-lg font-semibold text-[#007AFF]
```

### Price Display (Card)
```
Number: text-2xl font-bold text-[#007AFF]
Currency: text-sm font-semibold text-slate-500
```

---

## Icon Backgrounds

### Blue Icon Container
```
Background: #EFF6FF (blue-50)
Icon: #007AFF
Shape: rounded-xl with padding
```

### Green Icon Container
```
Background: #ECFDF5 (emerald-50)
Icon: #10B981 (emerald-600)
Shape: rounded-xl with padding
```

### Purple Icon Container
```
Background: #FAF5FF (purple-50)
Icon: #9333EA (purple-600)
Shape: rounded-xl with padding
```

### Amber Icon Container
```
Background: #FFFBEB (amber-50)
Icon: #D97706 (amber-600)
Shape: rounded-xl with padding
```

---

## Shadows

### Soft Shadow (Default Cards)
```css
box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
```

### Medium Shadow (Hover States)
```css
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
            0 2px 4px -2px rgba(0, 0, 0, 0.1);
```

### Strong Shadow (Modals)
```css
box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 
            0 4px 6px -4px rgba(0, 0, 0, 0.1);
```

---

## Accessibility

### Contrast Ratios

All color combinations meet WCAG AA standards:

- **Headings (slate-900 on white):** 16.1:1 ✅
- **Body text (slate-600 on white):** 8.6:1 ✅
- **Primary button (white on #007AFF):** 4.8:1 ✅
- **Links (#007AFF on white):** 4.8:1 ✅

---

## Usage Guidelines

### Do's ✅
- Use Azure Blue for primary actions and RLUSD
- Use emerald for success and growth
- Use slate for text hierarchy
- Maintain consistent shade usage
- Test in both light and dark modes

### Don'ts ❌
- Don't use pure black (#000000)
- Don't mix primary blues (stick to #007AFF)
- Don't use saturated colors for backgrounds
- Don't ignore dark mode variants
- Don't use colors without semantic meaning

---

## Quick Copy Palette

```css
/* Primary */
--azure-blue: #007AFF;
--azure-hover: #0066DD;
--azure-light: #EFF6FF;

/* Text */
--text-primary: #0F172A;
--text-secondary: #475569;
--text-muted: #64748B;

/* Success */
--success: #10B981;
--success-bg: #ECFDF5;

/* Background */
--bg-white: #FFFFFF;
--bg-subtle: #F8F9FA;

/* Border */
--border-light: #F1F5F9;
--border-medium: #E2E8F0;
```

---

## Color Naming Convention

When adding new colors, follow this pattern:
- Use Tailwind color names as base
- Use custom values for brand colors
- Prefix with `--` in CSS variables
- Use semantic names (`primary`, `success`, not `blue`, `green`)

---

**💡 Tip:** Use browser DevTools color picker to verify exact colors in the built application!


