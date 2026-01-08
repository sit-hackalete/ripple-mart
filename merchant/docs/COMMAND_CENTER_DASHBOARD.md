# Command Center Dashboard - Merchant Overview 🎯

Complete merchant dashboard with "The Pulse" metrics, performance trends, and action-required orders.

---

## 🎯 Overview

A comprehensive "Command Center" dashboard that gives merchants a complete view of their store's performance at a glance.

---

## 📐 Layout Structure

### **Full Page Design:**
```
┌─────────────────────────────────────────────────────────┐
│ Header: Good Morning, Merchant     [View Store Button]  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ SECTION 1: THE PULSE (4 Metric Cards)                   │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│ │ Revenue  │ │ Orders   │ │ Low Stock│ │ Avg Value│   │
│ │ +12%     │ │ 8 Pending│ │ 3 Items  │ │ 145 RLUSD│   │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│                                                          │
│ SECTION 2: PERFORMANCE & TRENDS                         │
│ ┌────────────────────────────┐ ┌──────────────┐        │
│ │ Revenue Chart (7 days)     │ │ Top Products │        │
│ │                            │ │ 1. Headphones│        │
│ │    [Bar Chart]             │ │ 2. Watch     │        │
│ │                            │ │ 3. USB Hub   │        │
│ └────────────────────────────┘ └──────────────┘        │
│                                                          │
│ SECTION 3: ACTION NEEDED (Recent Orders Table)          │
│ ┌──────────────────────────────────────────────────┐   │
│ │ Order ID │ Customer │ Status │ Total │ Action   │   │
│ │ ORD-001  │ Alice    │ Pending│ $250  │ [Ship]   │   │
│ │ ORD-002  │ Bob      │ Paid   │ $145  │          │   │
│ └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 Design System - "Soft Fintech"

### **Color Palette:**
```css
Background: bg-slate-50 (light gray - makes white cards pop)
Cards: bg-white with shadow-sm
Borders: border-slate-200
Primary: blue-600
Success: emerald-600
Warning: amber-600
Alert: orange-600
```

### **Typography:**
```css
Page Title: text-3xl font-bold
Section Titles: text-xl font-bold
Card Labels: text-sm font-medium text-slate-500
Card Values: text-2xl font-bold text-slate-900
```

### **Spacing:**
```css
Page Padding: px-4 sm:px-6 lg:px-8 py-8
Card Padding: p-8 (sections) or p-6 (metric cards)
Grid Gap: gap-6
```

### **Borders & Shadows:**
```css
Border Radius: rounded-2xl
Border: border border-slate-200
Shadow: shadow-sm (default) → shadow-md (hover)
```

---

## 📊 Section 1: The Pulse (Metric Cards)

### **1. Total Revenue Card**

```tsx
<div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
  {/* Icon */}
  <div className="p-2.5 bg-blue-100 rounded-xl">
    <DollarSign className="w-5 h-5 text-blue-600" />
  </div>
  
  {/* Badge */}
  <div className="bg-emerald-50 rounded-full px-2 py-0.5">
    +12%
  </div>
  
  {/* Content */}
  <p className="text-sm text-slate-500">Total Revenue (January)</p>
  <div className="text-2xl font-bold">12,450 RLUSD</div>
  <p className="text-xs text-slate-400">vs last month</p>
</div>
```

**Features:**
- 💙 Blue icon background
- 🟢 Green growth badge (+12%)
- 📅 Current month label
- 📈 Comparison text

---

### **2. Active Orders Card**

```tsx
<div className="bg-white rounded-2xl border-orange-200 bg-orange-50/30 p-6">
  {/* Icon + Badge */}
  <div className="p-2.5 bg-orange-100 rounded-xl">
    <Package className="w-5 h-5 text-orange-600" />
  </div>
  <span className="w-6 h-6 bg-orange-600 text-white rounded-full">8</span>
  
  {/* Content */}
  <p className="text-sm text-slate-500">Active Orders</p>
  <div className="text-2xl font-bold">8 Pending</div>
  <p className="text-xs text-orange-600 font-medium">Needs attention</p>
</div>
```

**Features:**
- 🟠 Orange highlight when orders > 0
- 🔴 Number badge in corner
- ⚠️ "Needs attention" warning
- 🎯 Catches merchant's eye

---

### **3. Low Stock Card**

```tsx
<div className="bg-white rounded-2xl border border-slate-200 p-6">
  {/* Icon */}
  <div className="p-2.5 bg-amber-100 rounded-xl">
    <AlertTriangle className="w-5 h-5 text-amber-600" />
  </div>
  
  {/* Content */}
  <p className="text-sm text-slate-500">Low Stock</p>
  <div className="text-2xl font-bold">3 Items</div>
  <p className="text-xs text-amber-600 font-medium">&lt; 10 inventory</p>
</div>
```

**Features:**
- ⚠️ Amber warning triangle
- 📦 Shows items needing restock
- 🔢 Threshold: < 10 items
- 🟡 Warning color scheme

---

### **4. Average Order Value Card**

```tsx
<div className="bg-white rounded-2xl border border-slate-200 p-6">
  {/* Icon */}
  <div className="p-2.5 bg-purple-100 rounded-xl">
    <TrendingUp className="w-5 h-5 text-purple-600" />
  </div>
  
  {/* Content */}
  <p className="text-sm text-slate-500">Avg. Order Value</p>
  <div className="text-2xl font-bold">145 RLUSD</div>
  <p className="text-xs text-slate-400">per transaction</p>
</div>
```

**Features:**
- 💜 Purple trending icon
- 💰 Shows average transaction size
- 📊 Key performance metric
- 🎯 Helps track pricing strategy

---

## 📈 Section 2: Performance & Trends

### **Revenue Chart (2/3 width)**

```tsx
<div className="lg:col-span-2 bg-white rounded-2xl border p-8">
  <h2 className="text-xl font-bold">Revenue Overview</h2>
  <p className="text-sm text-slate-500">Last 7 days</p>
  
  {/* Bar Chart */}
  <div className="flex items-end justify-between gap-2 h-64">
    {chartData.map((item) => (
      <div className="flex-1 flex-col">
        <div 
          className="bg-gradient-to-t from-blue-500 to-blue-600 rounded-t-lg"
          style={{ height: `${percentage}%` }}
        />
        <p className="text-xs text-slate-500">{item.day}</p>
      </div>
    ))}
  </div>
</div>
```

**Features:**
- 📊 Bar chart with 7 days of data
- 🔵 Blue gradient bars
- 🖱️ Hover shows exact amount
- 📱 Responsive and animated

---

### **Top Products (1/3 width)**

```tsx
<div className="bg-white rounded-2xl border p-6">
  <h2 className="text-lg font-bold">Top Products</h2>
  
  <div className="space-y-4">
    {topProducts.map((product, index) => (
      <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50">
        {/* Thumbnail */}
        <div className="w-12 h-12 bg-slate-100 rounded-lg">
          <img src={product.image} />
          <div className="badge">{index + 1}</div>
        </div>
        
        {/* Info */}
        <div>
          <p className="text-sm font-semibold">{product.name}</p>
          <p className="text-xs text-slate-500">24 sold • 2,400 RLUSD</p>
        </div>
      </div>
    ))}
  </div>
</div>
```

**Features:**
- 🏆 Numbered ranking badges (1, 2, 3)
- 📦 Product thumbnail
- 📊 Sales count + revenue
- 🖱️ Hover effect on items

---

## 📋 Section 3: Action Needed (Recent Orders)

### **Orders Table**

```tsx
<div className="bg-white rounded-2xl border p-8">
  <h2 className="text-xl font-bold">Recent Orders</h2>
  <p className="text-sm text-slate-500">Latest transactions</p>
  
  <table className="w-full">
    <thead>
      <tr className="border-b">
        <th>Order ID</th>
        <th>Customer</th>
        <th>Status</th>
        <th>Total</th>
        <th>Date</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      {orders.map((order) => (
        <tr className="hover:bg-slate-50">
          <td><button className="text-blue-600">ORD-001</button></td>
          <td>Alice Johnson</td>
          <td><span className="badge">Pending</span></td>
          <td>250.00 RLUSD</td>
          <td>Jan 8</td>
          <td><button className="btn-primary">Ship Now</button></td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

**Features:**
- 📋 Clean table layout
- 🔵 Clickable Order IDs
- 🏷️ Status badges (Paid/Pending/Shipped)
- 🚚 "Ship Now" button for pending orders
- 🖱️ Row hover effects

---

## 🎯 Status Badge Styling

### **Paid (Green):**
```css
bg-emerald-50 text-emerald-700
icon: CheckCircle
```

### **Pending (Orange):**
```css
bg-orange-50 text-orange-700
icon: Clock
```

### **Shipped (Blue):**
```css
bg-blue-50 text-blue-700
icon: Truck
```

---

## 🎨 Header Section

```tsx
<div className="flex items-center justify-between mb-8">
  <div>
    <h1 className="text-3xl font-bold">
      {getGreeting()}, {merchantName}
    </h1>
    <p className="text-sm text-slate-500">
      Here's what's happening with your store today
    </p>
  </div>
  
  <a href="/products" className="btn-secondary">
    <ExternalLink className="w-4 h-4" />
    View Store
  </a>
</div>
```

**Features:**
- 👋 Dynamic greeting (Morning/Afternoon/Evening)
- 👤 Merchant name (from wallet)
- 🔗 "View Store" link to products page
- 📱 Responsive layout

---

## 📊 Mock Data Structure

### **Stats:**
```typescript
interface MerchantStats {
  totalRevenue: number;      // 12,450
  profit: number;            // 8,915
  totalSales: number;        // 86
  totalProducts: number;     // 15
  recentSales: number;       // 12
  chartData: Array<{
    day: string;             // "Monday"
    sales: number;           // 1,250.50
  }>;
}
```

### **Orders:**
```typescript
interface RecentOrder {
  id: string;                // "ORD-001"
  customerName: string;      // "Alice Johnson"
  status: 'Paid' | 'Pending' | 'Shipped';
  total: number;             // 250.00
  date: string;              // "2026-01-08"
}
```

### **Top Products:**
```typescript
interface TopProduct {
  name: string;              // "Wireless Headphones"
  image: string;             // "/api/placeholder/80/80"
  soldCount: number;         // 24
  revenue: number;           // 2400
}
```

---

## 🚀 Key Features

### **1. Whitespace & Breathing Room**
- ✅ Generous padding (`p-8`)
- ✅ Consistent gaps (`gap-6`)
- ✅ Light background (`bg-slate-50`)
- ✅ Cards "pop" against background

### **2. Visual Hierarchy**
- ✅ Clear section headings
- ✅ Bold numbers, subtle labels
- ✅ Color-coded statuses
- ✅ Icon-based navigation

### **3. Actionable Insights**
- ✅ Growth badges (+12%)
- ✅ Warning indicators (Low Stock)
- ✅ Action buttons (Ship Now)
- ✅ Clickable elements (Order IDs)

### **4. Responsive Design**
- ✅ 1 column on mobile
- ✅ 2 columns on tablet
- ✅ 3-4 columns on desktop
- ✅ Adaptive chart sizing

---

## 💡 UX Improvements

### **Progressive Disclosure:**
- Most important metrics at top
- Details in middle section
- Actions at bottom

### **Visual Cues:**
- Orange border for pending orders
- Green badges for growth
- Amber warnings for stock
- Blue primary actions

### **Interactive Elements:**
- Hover effects on cards
- Clickable order IDs
- Action buttons
- Chart tooltips

---

## 🎯 Merchant Workflow

### **Morning Routine:**
1. **Check "The Pulse"** → See overnight revenue
2. **Active Orders** → Ship pending items
3. **Low Stock** → Note items to reorder
4. **Revenue Chart** → Track weekly trends
5. **Top Products** → Identify bestsellers
6. **Recent Orders** → Process shipments

---

## 📱 Responsive Breakpoints

### **Mobile (< 768px):**
- 1 column layout
- Stacked cards
- Simplified table
- Compact chart

### **Tablet (768px - 1024px):**
- 2 column metrics
- 2/3 + 1/3 layout for chart/products
- Full table

### **Desktop (> 1024px):**
- 4 column metrics
- Side-by-side chart + products
- Spacious table

---

## 🎨 Component Breakdown

### **Files:**
- `merchant/app/page.tsx` - Main dashboard
- Uses existing `@/lib/wallet-context`
- Existing API: `/api/merchant/stats`

### **Icons:**
```typescript
import {
  DollarSign,      // Revenue
  Package,         // Orders
  AlertTriangle,   // Low Stock
  TrendingUp,      // Avg Value
  BarChart3,       // Chart
  ExternalLink,    // View Store
  CheckCircle,     // Paid
  Clock,           // Pending
  Truck,           // Shipped
} from 'lucide-react';
```

---

## ✅ Implementation Checklist

- [x] Page background `bg-slate-50`
- [x] Dynamic greeting (Good Morning/Afternoon/Evening)
- [x] 4 metric cards ("The Pulse")
- [x] Revenue chart (7 days, blue gradient)
- [x] Top 3 products list
- [x] Recent orders table (5 items)
- [x] Status badges (Paid/Pending/Shipped)
- [x] "Ship Now" action buttons
- [x] Responsive grid layout
- [x] Hover effects
- [x] Mock data integration

---

## 🎉 Result

A **professional Command Center** dashboard that gives merchants:
- 📊 **At-a-glance metrics** (The Pulse)
- 📈 **Performance trends** (Revenue chart)
- 🏆 **Product insights** (Top sellers)
- ⚡ **Actionable items** (Pending orders)

**Design Quality:** Enterprise SaaS level (Shopify, Stripe, Square)

---

**Last Updated:** January 2026

