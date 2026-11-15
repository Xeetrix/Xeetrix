# Xeetrix Mart — Standalone Bilingual & Multi-Taxonomy Backend Setup Guide

This guide sets up the **completely independent Google Sheets + Google Drive backend** specifically for **Xeetrix Mart** (`/mart` and `/mart/admin`). It does **not** mix with Holding Group or Xeetrix Travels.

---

## Step 1: Create or Upgrade Your Mart Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and open your dedicated Mart spreadsheet (or create a brand-new blank spreadsheet, e.g., `Xeetrix Mart Database`).
2. Click **Extensions → Apps Script**.
3. Replace the contents of `Code.gs` with the entire contents of **`backend/mart/Code.gs`** from this repository.
4. Click **Save** (`Ctrl+S` / `Cmd+S`).
5. In the top toolbar dropdown, select **`setupMartBackend`** and click **Run**.
6. Approve the Google Sheets & Google Drive authorization prompt when asked.

**What `setupMartBackend` automatically prepares (or upgrades safely without erasing existing rows):**
- Creates/upgrades all **5 Mart tabs** with styled, frozen Row 1 column headers (**ZERO dummy items**):
  1. **`Mart_Products`**: `id | sku | nameEn | nameBn | categories | labels | price | comparePrice | stock | variantsEn | variantsBn | imageUrl | descriptionEn | descriptionBn | featured | active | createdAt`
  2. **`Mart_Categories`**: `id | slug | parentSlug | nameEn | nameBn | descriptionEn | descriptionBn | imageUrl | sortOrder | active | createdAt`
  3. **`Mart_Labels`**: `id | slug | nameEn | nameBn | descriptionEn | descriptionBn | tone | sortOrder | active | createdAt`
  4. **`Mart_Orders`**: `id | itemsJson | itemsSummary | totalItems | subtotal | deliveryArea | deliveryCharge | totalAmount | customerName | phone | address | paymentMethod | transactionId | notes | status | createdAt`
  5. **`Mart_Settings`**: `key | value | updatedAt` *(bilingual EN + BN hero text, promo banner, & Dhaka/Outside Dhaka delivery charges)*
- Automatically creates Google Drive folder **`Xeetrix_Mart_Storage`** containing two subfolders: **`Products`** and **`Categories`**, and caches their Folder IDs in Script Properties for fast direct uploads.
- Pre-warms **`CacheService`** for fast storefront reads.

---

## Step 2: Deploy `backend/mart/Code.gs` as a Web App

1. *(Optional Security)* In Apps Script, open **Project Settings → Script Properties → Add script property**:
   - Property: `MART_API_TOKEN`
   - Value: any strong random secret token.
2. Click **Deploy → New deployment**:
   - **Select type:** `Web app`
   - **Description:** `Xeetrix Mart Bilingual Multi-Taxonomy API v2`
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
3. Click **Deploy** and copy the **Web app URL** (`https://script.google.com/macros/s/.../exec`).

> **Note:** Whenever you update `backend/mart/Code.gs`, always choose **Deploy → New deployment** so the live `/exec` URL serves the latest version.

---

## Step 3: Configure Environment Variables in Vercel

In Vercel (**Project → Settings → Environment Variables**), add:

```env
MART_SCRIPT_URL=https://script.google.com/macros/s/YOUR_MART_DEPLOYMENT_ID/exec
MART_ADMIN_PASSWORD=your_secure_mart_password
MART_API_TOKEN=your_optional_matching_script_token
```

*(Compatibility: `NEXT_PUBLIC_MART_SCRIPT_URL`, `NEXT_PUBLIC_MART_ADMIN_PASSWORD`, and `NEXT_PUBLIC_MART_API_TOKEN` are also supported automatically as fallbacks.)*

After saving variables in Vercel, trigger **Deployments → Redeploy**.

---

## Step 4: Set Up Categories, Labels & Bilingual Products

1. Visit **`/mart/admin`** and unlock using `MART_ADMIN_PASSWORD` (you can switch between **EN / বাংলা** anytime).
2. Open **Categories & Labels**:
   - Create **Categories** with both English and Bengali names (e.g., `Baby` / `বেবি`, `Clothing` / `পোশাক`), optional parent category, and Drive image upload.
   - Create **Labels / Collections** (e.g., `Winter Collection` / `উইন্টার কালেকশন`, `New Arrival` / `নতুন আগমন`).
3. Open **Products & Inventory**, fill in English & Bengali product details, check all matching categories (`Baby` + `Clothing`) and labels (`Winter Collection`), upload product image to Drive, and click **Publish Product**.
4. Visit **`/mart`**—customers can switch seamlessly between English and বাংলা and combine Category + Label filters + bilingual Search.
