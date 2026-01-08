# Image Upload Feature - Drag & Drop with Vercel Blob 📸

Complete guide to the new multiple image upload feature for your merchant dashboard.

---

## ✅ **What's Been Implemented:**

### 1. **Vercel Blob Integration** ✅
- Upload API route (`/api/upload`)
- Automatic file upload to Vercel Blob
- Fast CDN URLs for all images
- 4.5MB file size limit per image

### 2. **Drag & Drop Component** ✅
- Beautiful drag & drop interface
- Click to browse files
- Multiple file selection
- Real-time upload progress
- Image preview grid
- Remove individual images
- Main image indicator

### 3. **Multiple Images Support** ✅
- Up to 5 images per product
- First image = main product image
- All images saved in MongoDB
- Backward compatible with old single image URLs

### 4. **Product Form Updated** ✅
- Replaced Image URL field with drag & drop
- Visual image management
- Edit mode loads existing images
- Seamless integration

---

## 🎨 **What You'll See:**

### When Creating/Editing Products:

```
┌──────────────────────────────────────────────┐
│  Add New Product                             │
│                                              │
│  Product Images:                             │
│  ┌────────────────────────────────────────┐ │
│  │   📤                                   │ │
│  │   Drag & drop images here              │ │
│  │   or click to browse files             │ │
│  │                                        │ │
│  │   Supports: JPEG, PNG, WebP, GIF       │ │
│  │   Max size: 4.5 MB per image           │ │
│  │   Max 5 images total (0/5 uploaded)    │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  [After uploading:]                          │
│  Uploaded Images (3)                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ [MAIN]  │ │         │ │         │       │
│  │  🖼️    │ │  🖼️    │ │  🖼️    │       │
│  │    ❌   │ │    ❌   │ │    ❌   │       │
│  └─────────┘ └─────────┘ └─────────┘       │
│                                              │
│  Product Name: [___________________]         │
│  ...                                         │
└──────────────────────────────────────────────┘
```

---

## 📋 **How to Use:**

### **Step 1: Add Your Vercel Blob Token**

Make sure you have this in your `.env.local`:

```env
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_YourActualTokenHere
MONGODB_URI=mongodb+srv://...
MONGODB_DB_NAME=ripple_mart
```

If you haven't set it up yet, see: `merchant/docs/VERCEL_BLOB_SETUP.md`

---

### **Step 2: Start Your Server**

```bash
cd merchant
npm run dev
```

---

### **Step 3: Test the Feature!**

#### **Create a New Product:**

1. Go to Products page
2. Click "Add Product"
3. In the "Product Images" section:
   - **Drag & drop** images directly onto the dropzone
   - **OR** click the dropzone to browse files
   - Select multiple images at once (Shift+Click or Ctrl+Click)
4. Watch the upload progress bar
5. See your images appear in the preview grid
6. First image is automatically marked as "Main"
7. Fill in other product details
8. Click "Create Product"

#### **Edit Existing Product:**

1. Click "Edit" on any product card
2. Existing images load automatically
3. Add more images by dragging/clicking
4. Remove images by clicking the ❌ button
5. Click "Update Product"

#### **Remove Images:**

- Hover over any uploaded image
- Click the red ❌ button in the top-right corner
- Image is removed (but not deleted from Vercel Blob yet)

---

## 🎯 **Features Explained:**

### **Drag & Drop Zone**

```typescript
// What you can do:
✅ Drag multiple images at once
✅ Click to open file picker
✅ Drop anywhere in the dropzone
✅ Visual feedback when dragging
✅ Disabled when max images reached
```

### **Upload Progress**

```typescript
// While uploading:
✅ Shows file name
✅ Progress percentage
✅ Progress bar animation
✅ Multiple simultaneous uploads
```

### **Image Preview Grid**

```typescript
// After uploading:
✅ Thumbnail previews
✅ "Main" badge on first image
✅ Remove button (shows on hover)
✅ Responsive grid layout
✅ Zoom effect on hover
```

### **Validation**

```typescript
// Automatic checks:
✅ File type: JPEG, PNG, WebP, GIF only
✅ File size: Max 4.5 MB each
✅ Total images: Max 5 per product
✅ Error messages if validation fails
```

---

## 🗄️ **How Data is Stored:**

### **In MongoDB:**

```javascript
{
  _id: "...",
  name: "Product Name",
  images: [  // ← New field! Array of image URLs
    "https://xyz.blob.vercel-storage.com/image1-abc.jpg",
    "https://xyz.blob.vercel-storage.com/image2-def.jpg",
    "https://xyz.blob.vercel-storage.com/image3-ghi.jpg"
  ],
  imageUrl: "https://...",  // Old field (backward compatible)
  price: 100,
  // ... other fields
}
```

### **In Vercel Blob:**

- Each image gets a unique URL
- URLs are permanent and fast (CDN-backed)
- Format: `https://[random].public.blob.vercel-storage.com/[filename]-[hash].jpg`
- Images are publicly accessible
- No expiration

---

## 🎨 **Product Display:**

### **Product Cards:**

- Show the **first image** from the `images` array
- Falls back to `imageUrl` if no images array
- Hover zoom effect works on all images
- Main image loads on product page

```typescript
// Display logic:
const displayImage = product.images?.[0] || product.imageUrl || '/placeholder.png';
```

---

## 🔧 **Technical Details:**

### **Files Created:**

1. **`/app/api/upload/route.ts`** - Upload endpoint
2. **`/components/ImageUpload.tsx`** - Drag & drop component
3. **`/lib/models.ts`** - Updated Product interface

### **Files Modified:**

1. **`/app/products/page.tsx`** - Integrated ImageUpload component
2. **`/package.json`** - Added dependencies

### **New Dependencies:**

```json
{
  "@vercel/blob": "^0.x.x",
  "react-dropzone": "^14.x.x"
}
```

---

## 📊 **API Endpoint:**

### **POST `/api/upload`**

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: File in `file` field

**Response (Success):**
```json
{
  "url": "https://xyz.blob.vercel-storage.com/image-abc.jpg",
  "pathname": "/image-abc.jpg",
  "contentType": "image/jpeg",
  "size": 123456
}
```

**Response (Error):**
```json
{
  "error": "File size exceeds 4.5MB limit"
}
```

**Validations:**
- ✅ File type: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`, `image/gif`
- ✅ Max size: 4.5 MB (4,718,592 bytes)
- ✅ Token required: `BLOB_READ_WRITE_TOKEN`

---

## ⚠️ **Important Notes:**

### **File Size Limits:**

| Plan | Max File Size | Storage | Bandwidth |
|------|--------------|---------|-----------|
| **Free (Hobby)** | 4.5 MB | 1 GB | 100 GB/month |
| **Pro** | 50 MB | 100 GB | 1 TB/month |

### **Image Limits:**

- **Max images per product:** 5 (configurable in `ImageUpload` component)
- **Recommended dimensions:** 800x800px to 2000x2000px
- **Supported formats:** JPEG, PNG, WebP, GIF
- **Compression:** Recommended before upload for faster loading

### **Backward Compatibility:**

- Old products with `imageUrl` still work
- System checks `images` array first, then `imageUrl`
- You can have both for transition period
- Eventually, phase out `imageUrl` field

---

## 🐛 **Troubleshooting:**

### **"Upload failed" error:**

**Problem:** Token not set or invalid

**Fix:**
1. Check `.env.local` has `BLOB_READ_WRITE_TOKEN`
2. Verify token is correct (copy from Vercel)
3. Restart dev server: `npm run dev`

---

### **"File size exceeds limit":**

**Problem:** Image is larger than 4.5 MB

**Fix:**
1. Compress image before uploading
2. Use tools like:
   - TinyPNG.com
   - Squoosh.app
   - ImageOptim (Mac)
3. Or upgrade to Vercel Pro plan

---

### **Drag & drop not working:**

**Problem:** Browser compatibility or JavaScript error

**Fix:**
1. Check browser console for errors
2. Try Chrome/Firefox (best compatibility)
3. Make sure JavaScript is enabled
4. Clear browser cache

---

### **Images not showing after upload:**

**Problem:** MongoDB not updated or display logic issue

**Fix:**
1. Check MongoDB Atlas → Browse Collections
2. Verify `images` array has URLs
3. Check product card display logic
4. Refresh the page

---

## 🎯 **Best Practices:**

### **For Better Performance:**

1. **Optimize images before upload:**
   - Resize to reasonable dimensions (1200x1200px max)
   - Compress to reduce file size
   - Use WebP format when possible

2. **Organize images:**
   - First image = main product image
   - Additional images = different angles/views
   - Keep relevant images only

3. **Image naming:**
   - Use descriptive filenames
   - e.g., `red-shoes-front.jpg`, `red-shoes-side.jpg`

### **For Better UX:**

1. **Use high-quality images:**
   - Clear, well-lit photos
   - White or clean backgrounds
   - Multiple angles

2. **Consistent style:**
   - Same aspect ratio for all products
   - Similar backgrounds
   - Professional photography

---

## 📈 **What's Next:**

### **Possible Enhancements:**

- ✨ Image reordering (drag to rearrange)
- ✨ Image cropping tool
- ✨ Image filters/effects
- ✨ Bulk upload
- ✨ Image gallery view on product page
- ✨ Delete images from Vercel Blob when removed
- ✨ Automatic image optimization
- ✨ Progressive image loading

---

## 🎉 **You're All Set!**

Your merchant dashboard now supports:
- ✅ Drag & drop image uploads
- ✅ Multiple images per product (up to 5)
- ✅ Vercel Blob storage integration
- ✅ Beautiful image preview and management
- ✅ Fast CDN delivery
- ✅ Mobile-friendly interface

**Start uploading beautiful product images!** 📸

---

## 📞 **Need Help?**

- **Vercel Blob Setup:** See `VERCEL_BLOB_SETUP.md`
- **MongoDB Issues:** See `MONGODB_SETUP.md`
- **General Setup:** See `QUICK_START.md`

**Happy selling with amazing product images!** 🚀

