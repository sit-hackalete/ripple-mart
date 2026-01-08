# Design System Quick Reference Card

## 🎨 Colors (Copy & Paste Ready)

```tsx
/* Primary */
bg-[#007AFF]           // Primary button
hover:bg-[#0066DD]     // Primary hover
bg-[#EFF6FF]           // Light blue background
text-[#007AFF]         // Primary text

/* Text */
text-slate-900         // Headings
text-slate-600         // Body text
text-slate-500         // Muted text

/* Success */
bg-emerald-50          // Success background
text-emerald-600       // Success text

/* Borders */
border-slate-100       // Light border
border-slate-200       // Medium border
```

---

## 🔘 Common Patterns

### Primary Button
```tsx
<button className="flex items-center gap-2 px-5 py-2.5 bg-[#007AFF] 
                   hover:bg-[#0066DD] text-white rounded-full 
                   font-semibold shadow-sm transition-all">
  <Icon className="w-4 h-4" strokeWidth={2} />
  Button Text
</button>
```

### Secondary Button
```tsx
<button className="px-5 py-2.5 bg-white hover:bg-slate-50 
                   text-slate-700 border-2 border-slate-200 
                   rounded-full font-semibold transition-all">
  Button Text
</button>
```

### Card
```tsx
<div className="bg-white dark:bg-slate-900 rounded-2xl 
                border border-slate-100 dark:border-slate-800 
                p-6 hover:shadow-md transition-all">
  {/* Content */}
</div>
```

### Status Badge (Active)
```tsx
<span className="px-3 py-1 text-xs font-semibold rounded-full 
                 bg-emerald-50 text-emerald-700">
  Active
</span>
```

### Growth Indicator
```tsx
<div className="inline-flex items-center gap-1 px-2 py-1 
                bg-emerald-50 rounded-full">
  <ArrowUpRight className="w-3 h-3 text-emerald-600" strokeWidth={2.5} />
  <span className="text-xs font-semibold text-emerald-600">+15%</span>
</div>
```

### Stat Card Icon
```tsx
<div className="p-3 bg-[#EFF6FF] dark:bg-blue-950/30 rounded-xl 
                group-hover:scale-110 transition-transform">
  <DollarSign className="w-6 h-6 text-[#007AFF]" strokeWidth={2} />
</div>
```

### Large Financial Number
```tsx
<div className="flex items-baseline gap-2">
  <p className="text-3xl font-bold text-slate-900 dark:text-white">
    250.00
  </p>
  <p className="text-lg font-semibold text-[#007AFF]">RLUSD</p>
</div>
```

### Page Title
```tsx
<h1 className="text-4xl font-bold text-slate-900 dark:text-white 
               mb-2 tracking-tight">
  Dashboard
</h1>
<p className="text-lg text-slate-600 dark:text-slate-400">
  Track your business performance
</p>
```

---

## 📐 Spacing

```tsx
gap-2  // 0.5rem / 8px   - Tight spacing
gap-3  // 0.75rem / 12px - Small spacing
gap-4  // 1rem / 16px    - Medium spacing
gap-5  // 1.25rem / 20px - Large spacing
gap-6  // 1.5rem / 24px  - Extra large

mb-2   // Bottom margin tight
mb-4   // Bottom margin medium
mb-6   // Bottom margin large
mb-8   // Bottom margin section

p-5    // Padding card content
p-6    // Padding default
p-8    // Padding generous
```

---

## 🎯 Border Radius

```tsx
rounded-xl    // 0.75rem - Input fields
rounded-2xl   // 1rem    - Cards
rounded-full  // 9999px  - Buttons, badges
```

---

## 💫 Transitions

```tsx
transition-all       // Default smooth transition
transition-transform // For scale effects
hover:shadow-md      // Lift on hover
hover:scale-110      // Subtle scale
group-hover:scale-110 // Scale on parent hover
```

---

## 🎨 Gradients

```tsx
/* Logo/Icon gradient */
bg-gradient-to-br from-[#007AFF] to-[#0066DD]

/* Chart bars */
bg-gradient-to-t from-[#007AFF] to-[#0066DD]
```

---

## 📱 Responsive Grid

```tsx
/* 4-column stats */
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

/* 3-column products */
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

---

## 🌙 Dark Mode

```tsx
/* Always use dark: variants */
bg-white dark:bg-slate-900
text-slate-900 dark:text-white
border-slate-100 dark:border-slate-800
```

---

## 🔤 Typography Scale

```tsx
text-xs    // 0.75rem / 12px - Small labels
text-sm    // 0.875rem / 14px - Body, buttons
text-base  // 1rem / 16px - Default
text-lg    // 1.125rem / 18px - Card titles
text-xl    // 1.25rem / 20px - Section titles
text-2xl   // 1.5rem / 24px - Page subtitles
text-3xl   // 1.875rem / 30px - Stat values
text-4xl   // 2.25rem / 36px - Page titles

/* Weights */
font-medium   // 500 - Body text
font-semibold // 600 - Buttons, emphasis
font-bold     // 700 - Numbers, headings
```

---

## 🎭 Icon Sizing

```tsx
/* Lucide React icons */
<Icon className="w-3 h-3" strokeWidth={2.5} /> // Badge icons
<Icon className="w-4 h-4" strokeWidth={2} />   // Button icons
<Icon className="w-5 h-5" strokeWidth={2} />   // Nav icons
<Icon className="w-6 h-6" strokeWidth={2} />   // Card icons
<Icon className="w-8 h-8" strokeWidth={2} />   // Large icons
```

---

## ⚡ Import Shortcuts

```tsx
// Components
import { Card, Button, Badge, StatCard } from '@/components/ui';

// Icons
import { 
  DollarSign, TrendingUp, ShoppingBag, Package,
  Plus, Edit, Trash2, Eye, EyeOff, X,
  ArrowUpRight, BarChart3, Wallet
} from 'lucide-react';
```

---

## 🎬 Animation Classes

```tsx
/* Loading spinner */
animate-spin rounded-full h-12 w-12 border-4 
border-slate-200 border-t-[#007AFF]

/* Fade in */
opacity-0 group-hover:opacity-100 transition-opacity

/* Scale on hover */
group-hover:scale-110 transition-transform
```

---

## 🎨 Status Colors

```tsx
/* Success/Active */
bg-emerald-50 text-emerald-700

/* Warning */
bg-amber-50 text-amber-700

/* Error/Delete */
bg-red-500 text-white

/* Info */
bg-[#EFF6FF] text-[#007AFF]

/* Neutral/Inactive */
bg-slate-100 text-slate-600
```

---

## 📋 Form Fields

```tsx
<input className="w-full px-4 py-3 
                  border border-slate-200 dark:border-slate-700 
                  rounded-xl 
                  bg-white dark:bg-slate-800 
                  text-slate-900 dark:text-white 
                  placeholder-slate-400 
                  focus:ring-2 focus:ring-[#007AFF] 
                  focus:border-transparent 
                  transition-all" />
```

---

## 🎯 Navigation Active State

```tsx
<Link className={`flex items-center gap-2 px-4 py-2 
                   text-sm font-medium rounded-full transition-all
                   ${isActive 
                     ? 'bg-[#EFF6FF] text-[#007AFF]' 
                     : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                   }`}>
```

---

## 🎪 Modal Wrapper

```tsx
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm 
                flex items-center justify-center z-50 p-4">
  <div className="bg-white dark:bg-slate-900 rounded-2xl 
                  border border-slate-200 dark:border-slate-800 
                  shadow-2xl max-w-2xl w-full max-h-[90vh] 
                  overflow-y-auto">
```

---

## 🎨 Product Image Placeholder

```tsx
<div className="w-full h-full bg-slate-100 dark:bg-slate-800 
                rounded-2xl flex items-center justify-center">
  <ImageIcon className="w-10 h-10 text-slate-400" strokeWidth={2} />
</div>
```

---

## ⚙️ Container

```tsx
<div className="container mx-auto px-6 py-8">
```

---

## 🎨 Backdrop Blur Nav

```tsx
<nav className="sticky top-0 z-50 w-full 
                border-b border-slate-100 dark:border-slate-800 
                bg-white/80 dark:bg-black/80 backdrop-blur-xl">
```

---

**💡 Pro Tip:** Copy these patterns directly into your code for instant consistency!

