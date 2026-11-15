# Xeetrix Mart — Standalone High-Speed Backend Setup Guide

This guide sets up the **completely independent Google Sheets + Google Drive backend** specifically for **Xeetrix Mart** (`/mart` and `/mart/admin`). It does **not** mix with Holding Group or Xeetrix Travels.

---

## Step 1: Create a Blank Google Sheet & Run One-Click Auto-Setup

1. Go to [Google Sheets](https://sheets.google.com) and create a **brand-new blank spreadsheet** (e.g., `Xeetrix Mart Database`).
2. Click **Extensions → Apps Script**.
3. Delete any existing code inside `Code.gs` and paste the entire contents of **`backend/mart/Code.gs`** from this repository.
4. Click **Save** (`Ctrl+S` / `Cmd+S`).
5. In the top toolbar dropdown, select **`setupMartBackend`** and click **Run**.
6. Approve the Google Sheets & Google Drive authorization prompt when asked.

**What `setupMartBackend` automatically prepares for you in seconds:**
- Creates all **4 Mart tabs** with styled, frozen Row 1 column headers (with **ZERO dummy products, categories, or orders**):
  1. **`Mart_Products`**: `id | sku | name | category | price | comparePrice | stock | variants | imageUrl | description | featured | active | createdAt`
  2. **`Mart_Categories`**: `id | name | slug | description | imageUrl | active | createdAt`
  3. **`Mart_Orders`**: `id | itemsJson | itemsSummary | totalItems | subtotal | deliveryArea | deliveryCharge | totalAmount | customerName | phone | address | paymentMethod | transactionId | notes | status | createdAt`
  4. **`Mart_Settings`**: `key | value | updatedAt` *(hero texts & Dhaka/Outside Dhaka delivery charges)*
- Automatically creates Google Drive folder **`Xeetrix_Mart_Storage`** containing two subfolders: **`Products`** and **`Categories`**, and caches their Folder IDs in Script Properties for fast direct uploads.
- Pre-warms **`CacheService`** for sub-100ms storefront reads.

---

## Step 2: Deploy `backend/mart/Code.gs` as a Web App

1. *(Optional Security)* In Apps Script, open **Project Settings → Script Properties → Add script property**:
   - Property: `MART_API_TOKEN`
   - Value: any strong random secret token.
2. Click **Deploy → New deployment**:
   - **Select type:** `Web app`
   - **Description:** `Xeetrix Mart Standalone API v1`
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
3. Click **Deploy** and copy the **Web app URL** (`https://script.google.com/macros/s/.../exec`).

> **Note:** Any time you modify `backend/mart/Code.gs`, always choose **Deploy → New deployment** so the live `/exec` endpoint uses your latest code.

---

## Step 3: Configure Environment Variables in Vercel

In Vercel (**Project → Settings → Environment Variables**), add:

```env
MART_SCRIPT_URL=https://script.google.com/macros/s/YOUR_MART_DEPLOYMENT_ID/exec
MART_ADMIN_PASSWORD=your_secure_mart_password
MART_API_TOKEN=your_optional_matching_script_token
```

*(Compatibility: `NEXT_PUBLIC_MART_SCRIPT_URL`, `NEXT_PUBLIC_MART_ADMIN_PASSWORD`, and `NEXT_PUBLIC_MART_API_TOKEN` are also supported automatically as fallbacks if already set.)*

After saving variables in Vercel, trigger **Deployments → Redeploy**.

---

## Step 4: Verify & Add Your First Category & Product

1. Visit **`/mart/admin`** and unlock using `MART_ADMIN_PASSWORD` (default fallback `mart2026` if unset).
2. Open **Categories & Settings** to create your first category and verify delivery charges.
3. Open **Products & Inventory**, click **Upload Image to Drive** (uploads straight into `Xeetrix_Mart_Storage/Products`), fill in name, SKU, price, stock, and click **Publish Product**.
4. Visit **`/mart`**—products load instantly through the Next.js server proxy + `CacheService` + browser cache pipeline.
