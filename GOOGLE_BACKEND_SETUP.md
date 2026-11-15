# Xeetrix Ecosystem & Xeetrix Mart — Google Sheets & Drive Backend Setup

This guide explains how to connect **Xeetrix** (`xeetrix.com`), **Xeetrix Travels** (`/travels`), and the decoupled **Xeetrix Mart** (`/mart`) e-commerce engine to a zero-cost **Google Sheets** database and **Google Drive** file storage using `backend/Code.gs`.

Every tab name, Row 1 column header, and JSON key below matches `backend/Code.gs`, `lib/martApi.ts`, and `lib/googleApi.ts` 1:1.

---

## Step 1: Google Spreadsheet Tabs & Exact Row 1 Headers

Create a Google Sheet named **`Xeetrix Ecosystem Database`** (or run `setupXeetrixWorkbook` inside Apps Script to auto-create all 9 tabs and Row 1 headers).

### A. Xeetrix Mart E-Commerce Tabs (4 Tabs)

#### 1. `Mart_Products`
| A | B | C | D | E | F | G | H | I | J | K | L | M |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `id` | `sku` | `name` | `category` | `price` | `comparePrice` | `stock` | `variants` | `imageUrl` | `description` | `featured` | `active` | `createdAt` |

#### 2. `Mart_Categories`
| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| `id` | `name` | `slug` | `description` | `imageUrl` | `active` | `createdAt` |

#### 3. `Mart_Orders`
| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `id` | `itemsJson` | `itemsSummary` | `totalItems` | `subtotal` | `deliveryArea` | `deliveryCharge` | `totalAmount` | `customerName` | `phone` | `address` | `paymentMethod` | `transactionId` | `notes` | `status` | `createdAt` |

#### 4. `Mart_Settings`
| A | B | C |
|---|---|---|
| `key` | `value` | `updatedAt` |

Keys managed by `/mart/admin`:
- `heroTitle`
- `heroSubtitle`
- `heroCtaText`
- `promoText`
- `insideDhakaCharge` (e.g. `70`)
- `outsideDhakaCharge` (e.g. `130`)
- `mobileBankingNumber` (optional bKash/Nagad merchant/personal number displayed at checkout)

---

### B. Xeetrix Holding & Travels Tabs (5 Tabs)

#### 5. `Travel_Routes`
| A | B | C | D | E | F | G | H | I | J | K | L |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `id` | `originCode` | `originCity` | `destinationCode` | `destinationCity` | `airline` | `tripCategory` | `baggageAllowance` | `startingFareBDT` | `duration` | `active` | `createdAt` |

#### 6. `Travel_Bookings`
| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `id` | `tripType` | `serviceCategory` | `origin` | `destination` | `departureDate` | `returnDate` | `passengers` | `cabinClass` | `customerName` | `phone` | `email` | `notes` | `status` | `createdAt` |

#### 7. `Investor_Leads`
| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| `id` | `investorName` | `organization` | `email` | `phone` | `capitalTier` | `message` | `status` | `createdAt` |

#### 8. `Corporate_Inquiries`
| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| `id` | `fullName` | `organization` | `email` | `phone` | `subject` | `message` | `status` | `createdAt` |

#### 9. `Site_Settings`
| A | B | C |
|---|---|---|
| `key` | `value` | `updatedAt` |

---

## Step 2: Deploy `backend/Code.gs` as Web App

1. Open your Google Sheet → **Extensions → Apps Script**.
2. Replace everything in `Code.gs` with the full contents of `backend/Code.gs`.
3. Click **Save** (`Ctrl+S` / `Cmd+S`).
4. Select **`setupXeetrixWorkbook`** from the function dropdown and click **Run** once to generate all 9 tabs, Row 1 headers, and default settings. Authorize Google Sheets & Google Drive permissions when prompted.
5. *(Optional API Token)* In **Project Settings → Script Properties**, add `ADMIN_API_TOKEN` with a secret string if you want server-side write verification.
6. Click **Deploy → New deployment**:
   - **Type:** `Web app`
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
7. Click **Deploy** and copy the Web App URL (`https://script.google.com/macros/s/.../exec`).

> **Important:** Whenever you update `backend/Code.gs`, always create a **New deployment** (or update the deployment version) so live `/exec` URL serves the latest code.

---

## Step 3: Vercel Environment Variables

Add these environment variables in Vercel (**Settings → Environment Variables**) and redeploy:

```env
NEXT_PUBLIC_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
NEXT_PUBLIC_MART_SCRIPT_URL=
NEXT_PUBLIC_ADMIN_PASSWORD=your_holding_admin_password
NEXT_PUBLIC_MART_ADMIN_PASSWORD=your_mart_admin_password
NEXT_PUBLIC_ADMIN_API_TOKEN=
```

- When **Xeetrix Mart** is deployed to its own standalone domain later, simply copy `app/mart`, `components/mart`, and `lib/martApi.ts` and set `NEXT_PUBLIC_MART_SCRIPT_URL` (or `NEXT_PUBLIC_GOOGLE_SCRIPT_URL`) to point at Mart's own Google Apps Script Web App.
