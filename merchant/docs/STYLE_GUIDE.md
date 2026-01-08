# Merchant UI Style Guide

## Design System Reference

### 🎨 Color Palette

#### Primary Colors
```
Blue (Primary):    #2563EB (blue-600)
Blue Hover:        #1D4ED8 (blue-700)
Blue Light:        #DBEAFE (blue-50)
```

#### Semantic Colors
```
Success Green:     #059669 (green-600)
Warning Orange:    #EA580C (orange-600)
Error Red:         #DC2626 (red-600)
Purple Accent:     #9333EA (purple-600)
```

#### Neutral Colors (Light Mode)
```
Background:        #FFFFFF (white)
Card Background:   #FFFFFF (white)
Border:            #E5E7EB (gray-200)
Text Primary:      #111827 (gray-900)
Text Secondary:    #6B7280 (gray-600)
Text Muted:        #9CA3AF (gray-400)
```

#### Neutral Colors (Dark Mode)
```
Background:        #0A0A0A (near black)
Card Background:   #111827 (gray-900)
Border:            #1F2937 (gray-800)
Text Primary:      #FFFFFF (white)
Text Secondary:    #9CA3AF (gray-400)
Text Muted:        #6B7280 (gray-500)
```

### 📐 Layout & Spacing

#### Container
```css
className="container mx-auto px-4"
/* Max width with auto margins and horizontal padding */
```

#### Page Padding
```css
className="py-8"      /* Standard page vertical padding */
className="py-16"     /* Large vertical padding for empty states */
```

#### Card Spacing
```css
className="p-6"       /* Standard card padding */
className="p-8"       /* Large card padding */
className="gap-6"     /* Grid gap between cards */
```

### 🔤 Typography

#### Headings
```css
/* Main Page Title */
className="text-4xl font-bold text-gray-900 dark:text-white mb-2"

/* Section Title */
className="text-2xl font-bold text-gray-900 dark:text-white mb-6"

/* Card Title */
className="text-lg font-bold text-gray-900 dark:text-white"
```

#### Body Text
```css
/* Large Subtitle */
className="text-lg text-gray-600 dark:text-gray-400"

/* Regular Body */
className="text-sm text-gray-600 dark:text-gray-400"

/* Small Text */
className="text-xs text-gray-500 dark:text-gray-400"
```

#### Special Text
```css
/* Price Display */
className="text-2xl font-bold text-blue-600"

/* Metric Number */
className="text-3xl font-bold text-gray-900 dark:text-white"
```

### 🎯 Components

#### Button Styles

**Primary Button**
```tsx
<button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium">
  Primary Action
</button>
```

**Secondary Button**
```tsx
<button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-md transition-colors font-medium">
  Secondary
</button>
```

**Danger Button**
```tsx
<button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors font-medium">
  Delete
</button>
```

**Outline Button**
```tsx
<button className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium">
  Cancel
</button>
```

#### Card Styles

**Standard Card**
```tsx
<div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
  {/* Content */}
</div>
```

**Hover Card**
```tsx
<div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow">
  {/* Content */}
</div>
```

**Interactive Card**
```tsx
<div className="group bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:border-blue-600 hover:shadow-md transition-all">
  {/* Content */}
</div>
```

#### Stat Card Template
```tsx
<div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
        Metric Label
      </p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">
        123
      </p>
      <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
        Additional Info
      </p>
    </div>
    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full">
      {/* Icon SVG */}
    </div>
  </div>
</div>
```

#### Badge Styles

**Active Badge**
```tsx
<span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
  Active
</span>
```

**Inactive Badge**
```tsx
<span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
  Inactive
</span>
```

### 📝 Form Elements

#### Text Input
```tsx
<input
  type="text"
  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  placeholder="Enter text..."
/>
```

#### Textarea
```tsx
<textarea
  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
  rows={4}
  placeholder="Enter description..."
/>
```

#### Select Dropdown
```tsx
<select className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
  <option>Select option</option>
</select>
```

#### Form Label
```tsx
<label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
  Field Name <span className="text-red-500">*</span>
</label>
```

### 🖼️ Image Containers

#### Product Image Container
```tsx
<div className="aspect-square w-full overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-lg">
  <img
    src={imageUrl}
    alt="Product"
    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
  />
</div>
```

#### Icon Container (Stat Cards)
```tsx
<div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full">
  <svg className="w-8 h-8 text-blue-600" /* ... */ />
</div>
```

### 🎭 Modal/Dialog

```tsx
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
    {/* Header */}
    <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
      {/* Header content */}
    </div>
    {/* Body */}
    <div className="p-6">
      {/* Modal content */}
    </div>
  </div>
</div>
```

### 🎨 Grid Layouts

#### 4-Column Stats Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Stat cards */}
</div>
```

#### 3-Column Product Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Product cards */}
</div>
```

#### 3-Column Actions Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {/* Action cards */}
</div>
```

### ⚡ Transitions & Animations

```css
/* Standard Transition */
transition-colors      /* For color changes */
transition-shadow      /* For shadow changes */
transition-all         /* For multiple properties */
transition-transform   /* For scale/transform */

/* Loading Spinner */
className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
```

### 🎯 Common Patterns

#### Empty State Pattern
```tsx
<div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-16 text-center">
  <svg className="w-20 h-20 mx-auto mb-6 text-gray-300" {/* ... */} />
  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
    No items yet
  </h3>
  <p className="text-gray-600 dark:text-gray-400 mb-6">
    Description text here
  </p>
  <button className="/* Primary button styles */">
    Add First Item
  </button>
</div>
```

#### Loading State Pattern
```tsx
<div className="container mx-auto px-4 py-16">
  <div className="text-center">
    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
  </div>
</div>
```

## Best Practices

### ✅ Do's
- Always include dark mode variants
- Use consistent spacing (multiples of 4)
- Add hover states to interactive elements
- Use semantic color coding (green=success, red=danger, blue=primary)
- Include transition classes for smooth animations
- Add proper focus states for accessibility

### ❌ Don'ts
- Don't mix shadow-based and border-based card styles
- Don't use arbitrary values unless absolutely necessary
- Don't forget responsive classes (md:, lg:)
- Don't use heavy shadows (keep it minimal)
- Don't forget to test in dark mode

## Accessibility

- All interactive elements have focus states
- Color contrast meets WCAG AA standards
- Icons have descriptive titles
- Form inputs have associated labels
- Buttons have descriptive text (no icon-only without labels)

---

**Tip**: Use this guide as a reference when creating new components or pages to maintain design consistency across the merchant dashboard.

