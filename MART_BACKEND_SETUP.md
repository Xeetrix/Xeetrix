# Xeetrix Mart — Standalone ERP, Hybrid Sourcing, Accounting & CRM Backend Setup

This guide sets up the **completely independent Google Sheets + Google Drive backend** specifically for **Xeetrix Mart** (`/mart` and `/mart/admin`). It does **not** mix with Holding Group or Xeetrix Travels.

---

## Step 1: Create or Non-Destructively Upgrade Your Mart Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and open your dedicated Mart spreadsheet (or create a brand-new spreadsheet, e.g., `Xeetrix Mart Database`).
2. Click **Extensions → Apps Script**.
3. Replace the contents of `Code.gs` with the entire contents of **`backend/mart/Code.gs`** from this repository.
4. Click **Save** (`Ctrl+S` / `Cmd+S`).
5. In the top toolbar dropdown, select **`setupMartBackend`** and click **Run**.
6. Approve the Google Sheets & Google Drive authorization prompt when asked.

**What `setupMartBackend` automatically prepares (safe to re-run — upgrades existing sheets cleanly without erasing data):**
- Creates/upgrades all **9 Mart tabs** with styled, frozen Row 1 column headers (**ZERO dummy items**):
  1. **`Mart_Products`**: Bilingual fields, multi-category/label CSV slugs, plus **`costPrice`, `fulfillmentType` (`own_stock` | `dropship`), `supplierId`, `sourceName`, `collectionMode` (`store_collects` | `supplier_collects`), `supplierAvailable`, `lowStockThreshold`**
  2. **`Mart_Categories`**: Bilingual category names, parent categories, Drive icons, and sort order
  3. **`Mart_Labels`**: Bilingual promotional labels / seasonal collections & tone styling
  4. **`Mart_Orders`**: Full item snapshots in `itemsJson` (including `unitCost`, `lineCost`, `lineProfit`, `fulfillmentType`, `supplierId`, `collectionMode`, and per-item `itemStatus`)
  5. **`Mart_Settings`**: Bilingual store hero text, promo banner, Dhaka/Outside delivery charges, and mobile banking number
  6. **`Mart_Suppliers`**: Wholesalers, factories, & dropshipping partners with payout terms, SLA lead time, tags, notes, & follow-up reminders
  7. **`Mart_Transactions`**: Double-aspect cashbook & expense ledger (`marketing_expense`, `operating_expense`, `inventory_purchase`, `return_shipping_loss`, `supplier_payout`, `dropship_receipt`, `other_income`, `other_expense`)
  8. **`Mart_CRM_Profiles`**: Client 360° profiles, manual B2B buyers, tier/risk overrides (`auto` | `vip` | `regular` | `new` | `high_risk` | `blocked`), tags, & follow-up reminders
  9. **`Mart_CRM_Logs`**: Timestamped phone call, SMS, email, payment follow-up, and internal communication logs for both customers and suppliers
- Automatically creates Google Drive folder **`Xeetrix_Mart_Storage`** containing **`Products`** and **`Categories`** subfolders and pre-warms **`CacheService`**.

> **Privacy Note:** Cost prices, internal supplier details, accounting ledger entries, and CRM logs are strictly restricted to admin requests (`action=martAdmin`) and stripped automatically from public storefront responses (`action=martPublic` / `/api/mart/track`).

---

## Step 2: Deploy `backend/mart/Code.gs` as a Web App

1. *(Optional Security)* In Apps Script, open **Project Settings → Script Properties → Add script property**:
   - Property: `MART_API_TOKEN`
   - Value: any strong random secret token.
2. Click **Deploy → New deployment**:
   - **Select type:** `Web app`
   - **Description:** `Xeetrix Mart Hybrid ERP, Accounting & CRM v3`
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
3. Click **Deploy** and copy the **Web app URL** (`https://script.google.com/macros/s/.../exec`).

> **Important:** Whenever you update `backend/mart/Code.gs`, always choose **Deploy → New deployment** so the live `/exec` URL serves the latest version.

---

## Step 3: Environment Variables

Ensure your Vercel / `.env` configuration sets:

```env
MART_SCRIPT_URL=https://script.google.com/macros/s/YOUR_MART_DEPLOYMENT_ID/exec
MART_ADMIN_PASSWORD=your_secure_mart_password
MART_API_TOKEN=your_optional_matching_script_token
```

---

## Step 4: Admin Portal Workflow (`/mart/admin`)

1. Unlock `/mart/admin` with `MART_ADMIN_PASSWORD` and switch between **EN / বাংলা** anytime.
2. Add partners in **Suppliers & Dropship**, set up multi-category & label collections in **Categories & Labels**, and publish **Own Stock** or **Dropshipping (Unlimited)** products with cost prices to see live unit margins.
3. Manage mixed-source orders item-by-item in **Orders**, monitor real **Net Profit, Supplier Payables & Dropship Receivables** in **Accounting & P&L**, and track VIP/High-Risk buyers & daily follow-ups in **Client CRM (360°)**.
