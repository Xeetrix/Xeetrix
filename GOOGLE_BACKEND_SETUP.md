# Xeetrix Google Sheets & Drive Backend Setup Guide

This guide walks you through connecting **Xeetrix** (`xeetrix.com`) to a zero-cost **Google Sheets** database and **Google Drive** asset storage using `backend/Code.gs`.

Every tab name, Row 1 column header, and JSON key below matches `backend/Code.gs` and `lib/googleApi.ts` 1:1.

---

## Step 1: Create the Google Spreadsheet & 7 Tabs

Create a new Google Sheet named **`Xeetrix Holding Database`** and create the exact **7 tabs** listed below. Copy the exact Row 1 column headers into Row 1 (`A1`, `B1`, ...) of each sheet (case-sensitive).

> **Shortcut:** After pasting `backend/Code.gs` in Step 2, you can run the `setupXeetrixWorkbook` function once inside the Apps Script Editor to automatically generate all 7 tabs, Row 1 headers, and default `Site_Settings` keys!

### 1. `Mart_Products`
| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| `id` | `name` | `category` | `price` | `comparePrice` | `stock` | `imageUrl` | `description` | `active` | `createdAt` |

### 2. `Mart_Orders`
| A | B | C | D | E | F | G | H | I | J | K | L |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `id` | `productId` | `productName` | `quantity` | `unitPrice` | `totalAmount` | `customerName` | `phone` | `address` | `notes` | `status` | `createdAt` |

### 3. `Travel_Routes`
| A | B | C | D | E | F | G | H | I | J | K | L |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `id` | `originCode` | `originCity` | `destinationCode` | `destinationCity` | `airline` | `tripCategory` | `baggageAllowance` | `startingFareBDT` | `duration` | `active` | `createdAt` |

### 4. `Travel_Bookings`
| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `id` | `tripType` | `serviceCategory` | `origin` | `destination` | `departureDate` | `returnDate` | `passengers` | `cabinClass` | `customerName` | `phone` | `email` | `notes` | `status` | `createdAt` |

### 5. `Investor_Leads`
| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| `id` | `investorName` | `organization` | `email` | `phone` | `capitalTier` | `message` | `status` | `createdAt` |

### 6. `Corporate_Inquiries`
| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| `id` | `fullName` | `organization` | `email` | `phone` | `subject` | `message` | `status` | `createdAt` |

### 7. `Site_Settings`
| A | B | C |
|---|---|---|
| `key` | `value` | `updatedAt` |

Recommended baseline keys in `Site_Settings`:
- `pitchDeckUrl` — Public Google Drive download URL for the Investor Pitch Deck PDF
- `kpiVentures` — e.g. `3`
- `kpiClientsServed` — e.g. `54,000+`
- `kpiGlobalRoutes` — e.g. `120+`
- `kpiAnnualGrowth` — e.g. `42%`

---

## Step 2: Deploy `backend/Code.gs` as a Google Apps Script Web App

1. Open your Google Sheet and click **Extensions → Apps Script**.
2. Delete any boilerplate code in `Code.gs` and paste the entire contents of `backend/Code.gs` from this repository.
3. Click **Save** (`Ctrl+S` / `Cmd+S`).
4. In the top toolbar dropdown, select **`setupXeetrixWorkbook`** and click **Run**. Grant Google Sheets & Google Drive permissions when prompted so all 7 tabs and default settings are initialized cleanly.
5. *(Optional Security Hardening)* Go to **Project Settings → Script Properties → Add script property**:
   - Property: `ADMIN_API_TOKEN`
   - Value: any strong random secret string (must match `NEXT_PUBLIC_ADMIN_API_TOKEN` in Vercel if set).
6. Click **Deploy → New deployment**:
   - **Select type:** `Web app`
   - **Description:** `Xeetrix Production API v1`
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
7. Click **Deploy**, authorize if prompted, and copy the **Web app URL** (`https://script.google.com/macros/s/.../exec`).

---

## Step 3: Configure Vercel Environment Variables

Add the following environment variables in Vercel (**Project Settings → Environment Variables**) and in `.env.local` for local testing:

```env
NEXT_PUBLIC_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_admin_password
NEXT_PUBLIC_ADMIN_API_TOKEN=your_optional_matching_script_token
```

> **Note:** All POST requests from `lib/googleApi.ts` intentionally use `Content-Type: text/plain;charset=utf-8` so browsers skip CORS preflight `OPTIONS` requests against `script.google.com`. Uploaded product images and Pitch Deck PDFs are automatically stored inside Google Drive (`Xeetrix_Assets/Mart_Products` and `Xeetrix_Assets/Investor_Pitch_Decks`) with `ANYONE_WITH_LINK` view permission.
