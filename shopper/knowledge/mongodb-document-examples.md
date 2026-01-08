# MongoDB Document Examples

## Product (Example from user)
```
_id: ObjectId('695f8ccfdcb7b621ed9895df')
merchantWalletAddress: "rYourMerchantWalletAddressHere"
name: "Kleenex"
description: "xxx"
price: 7
imageUrl: "s3.image.com"
category: "Personal Care"
stock: 100
isActive: true
createdAt: "2024-01-15T10:30:00.000Z"
updatedAt: "2024-01-15T10:30:00.000Z"
```

## User
```
_id: ObjectId('695f8ccfdcb7b621ed9895e0')
walletAddress: "rCustomerWalletAddress123"
name: "John Doe"
email: "john.doe@example.com"
phoneNumber: "+1234567890"
isActive: true
createdAt: "2024-01-15T10:30:00.000Z"
updatedAt: "2024-01-15T10:30:00.000Z"
```

## Order
```
_id: ObjectId('695f8ccfdcb7b621ed9895e1')
userWalletAddress: "rCustomerWalletAddress123"
items: [
  {
    productId: ObjectId('695f8ccfdcb7b621ed9895df'),
    name: "Kleenex",
    price: 7,
    quantity: 2,
    imageUrl: "s3.image.com"
  },
  {
    productId: ObjectId('695f8ccfdcb7b621ed9895e2'),
    name: "Toothpaste",
    price: 5,
    quantity: 1,
    imageUrl: "s3.image.com/toothpaste"
  }
]
subtotal: 19
tax: 1.52
total: 20.52
status: "completed"
transactionHash: "ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567BCD890"
merchantWalletAddress: "rYourMerchantWalletAddressHere"
createdAt: "2024-01-15T11:45:00.000Z"
updatedAt: "2024-01-15T11:45:30.000Z"
```

## Merchant
```
_id: ObjectId('695f8ccfdcb7b621ed9895e3')
walletAddress: "rYourMerchantWalletAddressHere"
businessName: "RippleMart Store"
description: "Your trusted online marketplace"
email: "merchant@ripplemart.com"
phoneNumber: "+1234567890"
isVerified: true
isActive: true
rating: 4.8
totalSales: 1500
createdAt: "2024-01-15T10:30:00.000Z"
updatedAt: "2024-01-15T10:30:00.000Z"
```

## Review
```
_id: ObjectId('695f8ccfdcb7b621ed9895e4')
productId: ObjectId('695f8ccfdcb7b621ed9895df')
userWalletAddress: "rCustomerWalletAddress123"
userName: "John Doe"
rating: 5
title: "Great product!"
comment: "Really happy with the quality and fast delivery."
isVerifiedPurchase: true
isApproved: true
createdAt: "2024-01-16T09:20:00.000Z"
updatedAt: "2024-01-16T09:20:00.000Z"
```

## Category
```
_id: ObjectId('695f8ccfdcb7b621ed9895e5')
name: "Personal Care"
slug: "personal-care"
description: "Personal care and hygiene products"
imageUrl: "s3.image.com/categories/personal-care"
parentCategoryId: null
isActive: true
sortOrder: 1
createdAt: "2024-01-15T10:30:00.000Z"
updatedAt: "2024-01-15T10:30:00.000Z"
```

## Cart Item (Stored in User's cart)
```
_id: ObjectId('695f8ccfdcb7b621ed9895e6')
userWalletAddress: "rCustomerWalletAddress123"
productId: ObjectId('695f8ccfdcb7b621ed9895df')
quantity: 3
price: 7
addedAt: "2024-01-15T14:30:00.000Z"
updatedAt: "2024-01-15T14:30:00.000Z"
```

## Payment Transaction
```
_id: ObjectId('695f8ccfdcb7b621ed9895e7')
orderId: ObjectId('695f8ccfdcb7b621ed9895e1')
userWalletAddress: "rCustomerWalletAddress123"
merchantWalletAddress: "rYourMerchantWalletAddressHere"
amount: 20.52
currency: "RLUSD"
transactionHash: "ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567BCD890"
status: "confirmed"
blockNumber: 12345678
networkFee: 0.01
createdAt: "2024-01-15T11:45:00.000Z"
updatedAt: "2024-01-15T11:45:30.000Z"
```

## Shipping Address
```
_id: ObjectId('695f8ccfdcb7b621ed9895e8')
userWalletAddress: "rCustomerWalletAddress123"
fullName: "John Doe"
addressLine1: "123 Main Street"
addressLine2: "Apt 4B"
city: "New York"
state: "NY"
zipCode: "10001"
country: "United States"
phoneNumber: "+1234567890"
isDefault: true
createdAt: "2024-01-15T10:30:00.000Z"
updatedAt: "2024-01-15T10:30:00.000Z"
```

## Wishlist Item
```
_id: ObjectId('695f8ccfdcb7b621ed9895e9')
userWalletAddress: "rCustomerWalletAddress123"
productId: ObjectId('695f8ccfdcb7b621ed9895df')
addedAt: "2024-01-15T12:00:00.000Z"
updatedAt: "2024-01-15T12:00:00.000Z"
```

## Inventory Movement
```
_id: ObjectId('695f8ccfdcb7b621ed9895ea')
productId: ObjectId('695f8ccfdcb7b621ed9895df')
movementType: "sale"
quantity: -2
previousStock: 100
newStock: 98
orderId: ObjectId('695f8ccfdcb7b621ed9895e1')
notes: "Order #12345"
createdAt: "2024-01-15T11:45:30.000Z"
```

