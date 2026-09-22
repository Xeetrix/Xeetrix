# Xeetrix — Air Ticketing & Global Travel Agency

A corporate, high-converting Air Ticketing & Global Travel Agency web application for **Xeetrix** (domain: [xeetrix.com](https://xeetrix.com)).

## Overview

- **Brand:** Xeetrix (Air Ticketing & Global Travel)
- **Domain:** xeetrix.com
- **Helpline:** +880 965 803 6631 (`tel:+8809658036631`)
- **Booking Email:** booking@xeetrix.com
- **Brand Palette:** Deep Emerald Green (`#0B5336`), White, Slate Gray (`#0F172A`), and Gold Accents (`#D97706`).

## Features

1. **Interactive Flight Search Box:**
   - One Way & Round Trip flight toggles
   - Origin & Destination airport selectors (DAC, CGP, ZYL, JED, DXB, RUH, KUL, LHR, etc.)
   - Real-time date pickers and passenger counter
   - Specialized fare categories: Standard, Migrant Worker Net-Fare, Student (46kg Luggage), and Umrah Group
   - Live fare inquiry generation with reference code (`XTX-xxxx`)

2. **Core Travel Services:**
   - Domestic & International Flight Ticketing (120+ global partner airlines)
   - Middle East & Migrant Worker Special Fares (Saudi Arabia, UAE, Qatar, Oman, Malaysia)
   - Student Flights & Extra Luggage Support (Up to 46kg allowance)
   - Umrah & Holiday Air Tickets (Direct flights to Jeddah & Madinah)
   - 24/7 Instant Date Change & Ticket Re-issue Assistance

3. **Popular Routes & Fare Highlights:**
   - Filterable route cards for Dhaka/Chittagong to Jeddah, Dubai, Riyadh, Kuala Lumpur, London, and Singapore
   - Detailed baggage allowances, flight durations, and starting prices

4. **3-Step Ticketing Process:**
   - Submit flight route and travel dates
   - Get verified net-fare quotation with baggage details within 15 minutes
   - Complete payment and receive instant confirmed e-ticket with authentic airline PNR

5. **Direct Booking Inquiry & Quote Engine:**
   - Server route `/api/quote` validated with Zod
   - Instant quotation reference code generation
   - Direct phone hotline connection (`+8809658036631`)

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Validation:** Zod
- **SEO:** Dynamic OpenGraph, JSON-LD Schema (TravelAgency), XML Sitemap, and robots.txt

## Vercel Deployment

This project is configured for 100% clean deployment on Vercel:

```bash
npm run build
```
