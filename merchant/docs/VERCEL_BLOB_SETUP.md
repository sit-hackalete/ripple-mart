# Vercel Blob Storage Setup Guide

Complete guide to setting up Vercel Blob for image uploads in your merchant dashboard.

---

## 🎯 What is Vercel Blob?

Vercel Blob is a **cloud storage service** that lets you:
- ✅ Upload files (images, videos, documents)
- ✅ Store them securely in the cloud
- ✅ Get fast CDN URLs for your files
- ✅ Pay only for what you use (Free tier available!)

**Perfect for:** Product images, merchant logos, any file uploads

---

## 💰 Pricing (as of 2024)

**Free (Hobby) Plan:**
- ✅ 1 GB storage
- ✅ 100 GB bandwidth per month
- ✅ Perfect for starting out!

**Pro Plan ($20/month):**
- 100 GB storage
- 1 TB bandwidth
- Better for production

---

## 📝 Step-by-Step Setup on Vercel Website

### Step 1: Go to Vercel Dashboard

1. Open your browser
2. Go to [vercel.com](https://vercel.com)
3. **Sign in** to your account
4. You should see your projects dashboard

---

### Step 2: Navigate to Storage

```
┌─────────────────────────────────────────┐
│  Vercel Dashboard                       │
│                                         │
│  Sidebar:                               │
│  • Overview                             │
│  • Projects                             │
│  • Storage  ← Click this!               │
│  • Domains                              │
│  • Settings                             │
└─────────────────────────────────────────┘
```

**What to do:**
1. Look at the left sidebar
2. Click **"Storage"**

---

### Step 3: Create Blob Store

On the Storage page, you'll see options:

```
┌─────────────────────────────────────────┐
│  Create Database                        │
│                                         │
│  Choose a storage type:                 │
│                                         │
│  ┌─────────────────┐                   │
│  │  📦 Blob        │  ← Choose this!   │
│  │  File storage   │                    │
│  └─────────────────┘                   │
│                                         │
│  ┌─────────────────┐                   │
│  │  🗄️  KV          │                    │
│  │  Key-Value      │                    │
│  └─────────────────┘                   │
│                                         │
│  ┌─────────────────┐                   │
│  │  🐘 Postgres    │                    │
│  │  SQL Database   │                    │
│  └─────────────────┘                   │
└─────────────────────────────────────────┘
```

**What to do:**
1. Click **"Create Database"** or **"Add New"**
2. Select **"Blob"** (the file storage option)

---

### Step 4: Configure Your Blob Store

You'll see a configuration form:

```
┌─────────────────────────────────────────┐
│  Create Blob Store                      │
│                                         │
│  Store Name:                            │
│  [ripple-mart-images]                   │
│   ↑ Enter a name                        │
│                                         │
│  Region:                                │
│  ● Washington, D.C., USA (iad1)         │
│  ○ San Francisco, USA (sfo1)            │
│  ○ Frankfurt, Germany (fra1)            │
│   ↑ Choose closest to you               │
│                                         │
│        [Create Blob Store]              │
└─────────────────────────────────────────┘
```

**What to do:**
1. **Store Name**: Enter `ripple-mart-images` (or any name you like)
2. **Region**: Select the region closest to your users
   - USA East Coast → Washington, D.C.
   - USA West Coast → San Francisco
   - Europe → Frankfurt
3. Click **"Create Blob Store"**

---

### Step 5: Get Your Token

After creation, you'll see your Blob store details:

```
┌─────────────────────────────────────────────────────┐
│  ripple-mart-images                                 │
│  Blob Store                                         │
│                                                     │
│  Status: ⚫ Active                                  │
│  Region: iad1                                       │
│  Created: Just now                                  │
│                                                     │
│  ┌──────────────────────────────────────────┐    │
│  │  Environment Variables                   │    │
│  │                                          │    │
│  │  BLOB_READ_WRITE_TOKEN=vercel_blob_...  │    │
│  │                           [Copy] 📋     │    │
│  └──────────────────────────────────────────┘    │
│                                                     │
│  [Connect to Project ▼]                            │
└─────────────────────────────────────────────────────┘
```

**What to do:**
1. Look for **"BLOB_READ_WRITE_TOKEN"**
2. Click the **[Copy]** button
3. **Save it temporarily** in Notepad

**It will look like:**
```
vercel_blob_rw_AbCdEfGh123456_xYzAbC1234567890aBcDeF
```

---

### Step 6: Connect to Your Project (Optional but Recommended)

Still on the Blob store page:

```
┌─────────────────────────────────────────┐
│  [Connect to Project ▼]                 │
│                                         │
│  Select projects to connect:            │
│  ☐ my-other-project                     │
│  ☑ ripple-mart  ← Check this!          │
│                                         │
│  This will automatically add the        │
│  environment variable to your project   │
│                                         │
│        [Connect]                        │
└─────────────────────────────────────────┘
```

**What to do:**
1. Click **"Connect to Project"** dropdown
2. Check your **ripple-mart** project (or whatever you named it)
3. Click **"Connect"**

**Benefit:** 
- Automatically adds `BLOB_READ_WRITE_TOKEN` to your Vercel project
- No need to manually add it later

---

### Step 7: Add Token to Local Environment

Even if you connected to the project, you still need it locally for development.

**On your computer:**

1. Open your `.env.local` file:
   ```bash
   cd merchant
   notepad .env.local  # Windows
   # or
   nano .env.local     # Mac/Linux
   ```

2. Add this line:
   ```env
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_AbCdEfGh123456_xYzAbC1234567890aBcDeF
   ```
   ↑ Replace with your actual token from Step 5

3. Your complete `.env.local` should now have:
   ```env
   MONGODB_URI=mongodb+srv://...
   MONGODB_DB_NAME=ripple_mart
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
   ```

4. Save and close the file

---

## 🔒 Security Best Practices

### ✅ Do's:
- ✅ Keep your token secret
- ✅ Never commit `.env.local` to Git (it's already in `.gitignore`)
- ✅ Use different tokens for development and production
- ✅ Rotate tokens if compromised

### ❌ Don'ts:
- ❌ Don't share your token publicly
- ❌ Don't commit it to GitHub
- ❌ Don't use it in client-side code (always use API routes)

---

## 🧪 Verify Setup

### Quick Test:

1. **Check Vercel Dashboard:**
   - Go to Vercel → Storage
   - Your Blob store should show "Active" status

2. **Check Local Environment:**
   ```bash
   cd merchant
   cat .env.local | grep BLOB
   # Should show: BLOB_READ_WRITE_TOKEN=vercel_blob_...
   ```

3. **Check Project Connection (if you connected):**
   - Vercel Dashboard → Your Project → Settings → Environment Variables
   - Should see `BLOB_READ_WRITE_TOKEN` listed

---

## 📊 Understanding Your Blob Store

### What You Can Store:
- ✅ Images (JPEG, PNG, GIF, WebP)
- ✅ Videos (MP4, WebM)
- ✅ Documents (PDF, DOCX)
- ✅ Any file type!

### File Size Limits:
- **Free Plan:** 4.5 MB per file
- **Pro Plan:** 50 MB per file

### URL Format:
After uploading, you get URLs like:
```
https://[random-id].public.blob.vercel-storage.com/[filename]-[hash].jpg
```

**Example:**
```
https://abc123xyz.public.blob.vercel-storage.com/product-image-def456.jpg
```

These URLs are:
- ✅ Permanent (don't expire)
- ✅ Fast (CDN-backed)
- ✅ Secure (HTTPS)
- ✅ Publicly accessible

---

## 🎯 What Happens Next

After this setup:
1. ✅ Your Blob store is ready
2. ✅ Token is in your environment
3. ✅ You can now upload files
4. ✅ Files are stored in Vercel's CDN
5. ✅ You get back URLs to use in your products

---

## 📝 Quick Reference

| What | Where to Find It |
|------|-----------------|
| **Blob Dashboard** | vercel.com → Storage → Your blob store |
| **Usage Stats** | Blob dashboard → Overview tab |
| **Environment Variable** | Vercel project → Settings → Environment Variables |
| **Token** | Blob dashboard → Environment Variables section |
| **Pricing** | vercel.com/pricing/blob |

---

## 🆘 Troubleshooting

### "Cannot find Blob store"
**Fix:** Make sure you're logged into the correct Vercel account

### "Token not working"
**Fix:** 
1. Copy the token again from Vercel
2. Make sure no extra spaces in `.env.local`
3. Restart your dev server

### "Upload fails"
**Fix:**
1. Check file size (< 4.5 MB on free plan)
2. Verify token is correct
3. Check internet connection

---

## ✨ You're All Set!

Once you complete these steps, you'll have:
- ✅ Vercel Blob store created
- ✅ Token saved in `.env.local`
- ✅ Project connected (optional)
- ✅ Ready to upload images!

**Next:** I'll show you the code to implement drag & drop uploads!

---

## 🔗 Helpful Links

- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- [Vercel Blob API Reference](https://vercel.com/docs/storage/vercel-blob/using-blob-sdk)
- [Pricing Details](https://vercel.com/pricing/blob)
- [Storage Dashboard](https://vercel.com/dashboard/stores)

