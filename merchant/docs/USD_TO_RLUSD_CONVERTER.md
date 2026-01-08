# USD to RLUSD Price Converter 💱

Smart currency converter that lets merchants set prices in USD and automatically converts to RLUSD.

---

## 🎯 Overview

Merchants can now enter product prices in **USD** and the system automatically converts to **RLUSD** (Ripple's USD stablecoin).

**Key Feature:** RLUSD is pegged 1:1 to USD, so 1 RLUSD = 1 USD

---

## ✨ Features

### **1. Currency Toggle** ⭐

Beautiful toggle button to switch between USD and RLUSD input:

```
┌──────────────────────────────┐
│ Price *        [USD] [RLUSD] │ ← Toggle buttons
│                               │
│ $ 250.00                      │ ← Input with currency symbol
│                           USD │
│                               │
│ ┌───────────────────────────┐ │
│ │ RLUSD Price: Ⓡ 250.00     │ │ ← Conversion display
│ │               1 RLUSD = 1 USD │
│ └───────────────────────────┘ │
└──────────────────────────────┘
```

### **2. Real-Time Conversion** ⭐

As you type, the system automatically:
- Converts USD to RLUSD
- Converts RLUSD to USD
- Shows both values
- Updates instantly

### **3. Visual Feedback** ⭐

- **Active mode** highlighted in blue
- **Currency symbol** changes ($ or Ⓡ)
- **Conversion display** shows equivalent value
- **Exchange rate** reminder (1:1)

---

## 🎨 Visual Design

### **Currency Toggle:**
```tsx
┌─────────────────────────┐
│  [  USD  ] [  RLUSD  ]  │  ← Pill-style toggle
└─────────────────────────┘

Active:   Blue background + shadow
Inactive: Gray text, no background
```

### **Price Input:**
```tsx
┌──────────────────────────┐
│ $ | 250.00          USD  │
└──────────────────────────┘
  ↑    ↑               ↑
Symbol Input         Label
```

### **Conversion Display:**
```tsx
┌─────────────────────────────────────┐
│ RLUSD Price: Ⓡ 250.00  1 RLUSD = 1 USD │
└─────────────────────────────────────┘
Blue background with subtle styling
```

---

## 🎯 How to Use

### **Set Price in USD (Recommended):**

1. **Open Add/Edit Product modal**
2. **Toggle is on USD by default** (most intuitive)
3. **Type the USD price**: e.g., `250.00`
4. **See automatic conversion** below the input
5. **Shows**: "RLUSD Price: Ⓡ 250.00 RLUSD"
6. **Submit** - product saved with RLUSD price

### **Set Price in RLUSD:**

1. **Click the "RLUSD" toggle button**
2. **Type the RLUSD price**: e.g., `250.00`
3. **See automatic conversion** below the input
4. **Shows**: "USD Price: $ 250.00 USD"
5. **Submit** - same result (1:1 conversion)

### **Edit Existing Product:**

1. **Click "Edit" on product card**
2. **Modal opens** with existing price
3. **Toggle shows** in either USD or RLUSD
4. **Change price** in either currency
5. **Update** - new price saved

---

## 🔧 Technical Implementation

### **State Management:**

```typescript
const [priceMode, setPriceMode] = useState<'RLUSD' | 'USD'>('USD');
const [usdAmount, setUsdAmount] = useState('');
const [formData, setFormData] = useState({
  // ...
  price: '', // Stored in RLUSD
  // ...
});
```

### **Conversion Logic:**

```typescript
onChange={(e) => {
  const value = e.target.value;
  if (priceMode === 'USD') {
    setUsdAmount(value);
    // RLUSD is pegged 1:1 to USD
    setFormData({ ...formData, price: value });
  } else {
    setFormData({ ...formData, price: value });
    setUsdAmount(value);
  }
}}
```

**Why 1:1?**
- RLUSD is a **stablecoin** pegged to USD
- 1 RLUSD = 1 USD (always)
- No API calls needed
- Instant conversion

### **Toggle Component:**

```tsx
<div className="flex gap-2 bg-slate-100 dark:bg-slate-800 rounded-full p-1">
  <button
    type="button"
    onClick={() => setPriceMode('USD')}
    className={`px-3 py-1 rounded-full ${
      priceMode === 'USD'
        ? 'bg-white text-blue-600 shadow-sm'
        : 'text-slate-600'
    }`}
  >
    USD
  </button>
  <button
    type="button"
    onClick={() => setPriceMode('RLUSD')}
    className={`px-3 py-1 rounded-full ${
      priceMode === 'RLUSD'
        ? 'bg-white text-blue-600 shadow-sm'
        : 'text-slate-600'
    }`}
  >
    RLUSD
  </button>
</div>
```

### **Input with Currency Symbol:**

```tsx
<div className="relative">
  {/* Left: Currency Symbol */}
  <div className="absolute inset-y-0 left-0 flex items-center pl-4">
    <span className="text-slate-500 font-medium">
      {priceMode === 'USD' ? '$' : 'Ⓡ'}
    </span>
  </div>
  
  {/* Input */}
  <input
    type="number"
    step="0.01"
    min="0"
    value={priceMode === 'USD' ? usdAmount : formData.price}
    className="w-full pl-10 pr-20 py-3 rounded-xl"
  />
  
  {/* Right: Currency Label */}
  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
    <span className="text-xs font-semibold text-slate-500">
      {priceMode === 'USD' ? 'USD' : 'RLUSD'}
    </span>
  </div>
</div>
```

### **Conversion Display:**

```tsx
{formData.price && parseFloat(formData.price) > 0 && (
  <div className="flex justify-between px-4 py-2 bg-blue-50 rounded-lg">
    <div>
      <span className="text-slate-600">
        {priceMode === 'USD' ? 'RLUSD Price:' : 'USD Price:'}
      </span>
      <span className="ml-2 font-semibold text-blue-600">
        {priceMode === 'USD' 
          ? `Ⓡ ${parseFloat(formData.price).toFixed(2)} RLUSD`
          : `$ ${parseFloat(formData.price).toFixed(2)} USD`
        }
      </span>
    </div>
    <div className="text-xs text-slate-500">
      1 RLUSD = 1 USD
    </div>
  </div>
)}
```

---

## 🎨 Design Specifications

### **Toggle Buttons:**

**Active State:**
```css
Background: bg-white dark:bg-slate-700
Text: text-blue-600 dark:text-blue-400
Shadow: shadow-sm
Border Radius: rounded-full
```

**Inactive State:**
```css
Background: transparent
Text: text-slate-600 dark:text-slate-400
No shadow
```

**Container:**
```css
Background: bg-slate-100 dark:bg-slate-800
Padding: p-1
Border Radius: rounded-full
```

### **Price Input:**

```css
Padding Left: pl-10 (space for $ or Ⓡ)
Padding Right: pr-20 (space for currency label)
Padding Y: py-3
Border Radius: rounded-xl
Border: border-slate-200 dark:border-slate-700
Focus Ring: ring-blue-500
```

### **Currency Symbols:**

```css
USD: $ (standard dollar sign)
RLUSD: Ⓡ (circled R - Ripple symbol)
Color: text-slate-500 dark:text-slate-400
Font: font-medium
```

### **Conversion Display:**

```css
Background: bg-blue-50 dark:bg-blue-950/20
Padding: px-4 py-2
Border Radius: rounded-lg
Text: text-slate-600 (label) + text-blue-600 (value)
```

---

## 💡 User Benefits

### **1. Intuitive Pricing** 💰
- Most merchants think in USD
- No need to understand crypto pricing
- Familiar currency (dollars)

### **2. Transparent Conversion** 📊
- See both USD and RLUSD values
- Understand the 1:1 relationship
- Build confidence in crypto

### **3. Flexible Input** 🔄
- Choose preferred currency
- Switch anytime
- No data loss

### **4. Professional UI** ✨
- Clean toggle design
- Clear visual feedback
- Matches premium aesthetic

---

## 🔍 Example Scenarios

### **Scenario 1: Selling Headphones**

```
Merchant thinks: "I want to sell these headphones for $250"

Steps:
1. Open Add Product modal
2. Toggle already on "USD" ✓
3. Type "250.00" in the price field
4. See conversion: "RLUSD Price: Ⓡ 250.00 RLUSD"
5. Fill other fields
6. Click "Create Product"
7. Product listed at 250.00 RLUSD (= $250 USD)
```

### **Scenario 2: Adjusting Price**

```
Merchant: "I need to increase the price to $299"

Steps:
1. Click "Edit" on product
2. Modal opens with current price (250.00)
3. Change to "299.00"
4. Conversion updates: "RLUSD Price: Ⓡ 299.00 RLUSD"
5. Click "Update Product"
6. New price saved
```

### **Scenario 3: Using RLUSD Directly**

```
Merchant familiar with RLUSD:

Steps:
1. Click "RLUSD" toggle button
2. Type "199.00"
3. See conversion: "USD Price: $ 199.00 USD"
4. Submit
5. Same result (1:1 conversion)
```

---

## 🎯 Why This Matters

### **Problem Solved:**
Many merchants are **new to crypto** and find crypto pricing confusing. They want to price products in familiar USD.

### **Solution:**
- **Think in USD** - the currency they know
- **Auto-convert** to RLUSD - the token they use
- **See both values** - build understanding
- **1:1 peg** - simple and predictable

### **Result:**
- ✅ Lower barrier to entry
- ✅ Faster product creation
- ✅ Fewer pricing errors
- ✅ Better merchant experience
- ✅ Professional and modern

---

## 🚀 Future Enhancements

### **Option 1: Other Cryptocurrencies**

```typescript
const [priceMode, setPriceMode] = useState<'USD' | 'RLUSD' | 'XRP'>('USD');

// Fetch live XRP/USD rate
const xrpRate = await fetch('https://api.coinbase.com/v2/exchange-rates?currency=XRP');

// Dynamic conversion
if (priceMode === 'XRP') {
  const rlusdPrice = xrpAmount * xrpRate;
  setFormData({ ...formData, price: rlusdPrice.toString() });
}
```

### **Option 2: Bulk Price Updates**

```typescript
// Update all products by percentage
const updateAllPrices = (percentage: number) => {
  products.forEach(product => {
    const newPrice = product.price * (1 + percentage / 100);
    updateProduct(product._id, { price: newPrice });
  });
};
```

### **Option 3: Price History**

```typescript
interface PriceHistory {
  price: number;
  currency: string;
  changedAt: Date;
  changedBy: string;
}

// Track price changes over time
```

### **Option 4: Multi-Currency Display**

```tsx
<div className="conversion-display">
  <div>USD: $ {usdPrice.toFixed(2)}</div>
  <div>RLUSD: Ⓡ {rlusdPrice.toFixed(2)}</div>
  <div>XRP: {xrpPrice.toFixed(4)}</div>
  <div>EUR: € {eurPrice.toFixed(2)}</div>
</div>
```

---

## 🐛 Edge Cases Handled

### **1. Empty Input**
- No conversion shown
- No errors
- Clean UI

### **2. Zero Value**
- Valid input
- No conversion shown (not useful)
- Can submit

### **3. Decimal Places**
- Input step: 0.01
- Display: 2 decimal places
- Stored: 2 decimal places

### **4. Very Large Numbers**
- JavaScript handles up to 2^53
- Plenty for any product price
- Formats correctly

### **5. Negative Numbers**
- Input has min="0"
- Can't enter negative
- Validated on submit

---

## 📝 Code Summary

### **Files Modified:**

**`merchant/app/products/page.tsx`**
- Added `priceMode` state (USD or RLUSD)
- Added `usdAmount` state (for USD input)
- Added currency toggle buttons
- Added conversion display
- Updated price input with currency symbols
- Reset states on modal open/close

### **No API Changes Needed:**
- RLUSD stored as-is in database
- 1:1 conversion handled in frontend
- No backend changes required

---

## ✅ Testing Checklist

### **Basic Functionality:**
- [ ] Toggle defaults to USD
- [ ] Can switch to RLUSD
- [ ] Can switch back to USD
- [ ] Typing updates both values
- [ ] Conversion display appears
- [ ] Shows correct exchange rate (1:1)

### **Create Product:**
- [ ] Enter price in USD
- [ ] Conversion shows RLUSD
- [ ] Submit saves correct price
- [ ] Product displays correct price

### **Edit Product:**
- [ ] Opens with existing price
- [ ] Can change price
- [ ] Conversion updates
- [ ] Update saves correctly

### **Edge Cases:**
- [ ] Empty input (no conversion)
- [ ] Zero value (no conversion)
- [ ] Decimal values (2 places)
- [ ] Toggle with value (keeps value)

---

## 💡 Best Practices

### **DO:**
- ✅ Use USD mode for most merchants
- ✅ Show conversion for transparency
- ✅ Format to 2 decimal places
- ✅ Keep 1:1 exchange rate visible
- ✅ Make toggle easy to find

### **DON'T:**
- ❌ Hide the conversion
- ❌ Use confusing symbols
- ❌ Make toggle hard to use
- ❌ Round to whole numbers
- ❌ Add unnecessary fees

---

## 📊 Benefits Summary

| Feature | Before | After |
|---------|--------|-------|
| Currency | RLUSD only | USD or RLUSD |
| Conversion | Manual | Automatic |
| Display | One currency | Both currencies |
| UX | Confusing | Intuitive |
| Speed | Slow (calculator needed) | Fast (instant) |

---

**Result:** Merchants can now price products in familiar USD with automatic RLUSD conversion! 💱✨

**Perfect for:**
- 🆕 New merchants unfamiliar with crypto
- 💼 Traditional business owners
- 🌐 International sellers
- 📊 Anyone who thinks in USD

---

**Last Updated:** January 2026

