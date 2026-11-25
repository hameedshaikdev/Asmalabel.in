<div align="center">

<img src="public/logo.png" alt="Asmalabel Logo" width="100" style="border-radius:50%"/>

# Asmalabel.in

### A full-featured e-commerce platform for tailoring tools & fashion

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)](https://vite.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000?style=flat-square&logo=vercel)](https://vercel.com)
[![License](https://img.shields.io/badge/License-Private-red?style=flat-square)]()

**Live Site → [asmalabel.in](https://asmalabel.in)**

</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Features](#-features)
  - [Storefront](#-storefront)
  - [Product System](#-product-system)
  - [Cart & Wishlist](#-cart--wishlist)
  - [Checkout & Payments](#-checkout--payments)
  - [Authentication](#-authentication)
  - [Order Management](#-order-management)
  - [Admin Panel](#-admin-panel)
  - [CMS – Homepage Builder](#-cms--homepage-builder)
  - [SEO & Performance](#-seo--performance)
  - [Notifications](#-notifications)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Scripts](#-scripts)
- [Contributing](#-contributing)

---

## 🛍️ About

**Asmalabel** is a production-grade Indian e-commerce platform serving two distinct categories:

| Category | Description |
|----------|-------------|
| 🧵 **Tailoring Tools** | Scissors, threads, needles, presser feet, measuring tools, tailoring kits & more |
| 👗 **Women's Fashion** | Curated apparel & fashion accessories |

Built entirely as a **React SPA** with **Supabase** as the backend-as-a-service (Postgres DB + Auth + Storage), deployed on **Vercel** with zero cold-start latency.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend Framework** | React 19, React Router v7 |
| **Build Tool** | Vite 8 (ESM-first, optimised chunking) |
| **Styling** | Tailwind CSS 3, custom CSS variables |
| **Animations** | Framer Motion 12 |
| **Icons** | Lucide React |
| **Backend / DB** | Supabase (PostgreSQL + RLS) |
| **Auth** | Supabase Auth (Email/Password + Google OAuth) |
| **File Storage** | Supabase Storage |
| **Payments** | Manual UPI (PhonePe, GPay, Paytm, CRED) + COD |
| **Analytics** | Vercel Analytics |
| **Deployment** | Vercel (Edge CDN) |
| **Linting** | oxlint |

---

## 📁 Project Structure

```
Asmalabel.in/
├── 📂 src/                          # Frontend source code
│   ├── 📂 components/
│   │   ├── 📂 admin/                # Admin panel components
│   │   │   ├── AdminUtils.jsx       # Toast, dialogs, CSV export, skeletons
│   │   │   ├── SocialMediaManager.jsx
│   │   │   └── 📂 cms/             # CMS homepage editor modules
│   │   │       ├── HomepageManager.jsx
│   │   │       ├── HeroEditor.jsx
│   │   │       ├── AnnouncementBarEditor.jsx
│   │   │       ├── BannersEditor.jsx
│   │   │       ├── CollectionsEditor.jsx
│   │   │       ├── FlashDealsEditor.jsx
│   │   │       ├── FooterEditor.jsx
│   │   │       ├── MediaLibrary.jsx
│   │   │       ├── NewArrivalsEditor.jsx
│   │   │       ├── SeoEditor.jsx
│   │   │       ├── TopPicksEditor.jsx
│   │   │       ├── TrustBadgesEditor.jsx
│   │   │       ├── CategoryFilterEditor.jsx
│   │   │       └── CmsLivePreviewModal.jsx
│   │   ├── 📂 auth/                 # Auth UI components
│   │   ├── 📂 cart/                 # Cart components
│   │   ├── 📂 common/               # Shared/reusable components
│   │   │   ├── SEO.jsx              # Dynamic meta + OpenGraph tags
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Toast.jsx
│   │   │   ├── ComingSoonModal.jsx
│   │   │   ├── CategoryIcons.jsx
│   │   │   └── UpiIcons.jsx
│   │   ├── 📂 layout/
│   │   │   ├── Header.jsx           # Sticky header with search
│   │   │   ├── Footer.jsx           # CMS-driven footer
│   │   │   └── BottomNav.jsx        # Mobile bottom navigation
│   │   └── 📂 products/
│   │       ├── ProductCard.jsx      # Animated product card
│   │       ├── ProductDescription.jsx
│   │       ├── ProductVideoPlayer.jsx
│   │       ├── CategoryFilter.jsx
│   │       └── QuickViewModal.jsx   # Slide-up product quick view
│   ├── 📂 config/
│   │   └── supabase.js              # Supabase client initialisation
│   ├── 📂 context/
│   │   └── AppContext.jsx           # Global state (cart, wishlist, auth, CMS, toast)
│   ├── 📂 hooks/                    # Custom React hooks
│   ├── 📂 pages/
│   │   ├── Home.jsx                 # Main storefront (SSG-ready)
│   │   ├── ProductDetail.jsx        # PDP with variants, images, reviews
│   │   ├── Cart.jsx                 # Cart with coupon engine
│   │   ├── Wishlist.jsx
│   │   ├── Checkout.jsx             # Multi-step checkout + UPI/COD payments
│   │   ├── Orders.jsx               # Order history
│   │   ├── OrderStatus.jsx          # Real-time order tracking page
│   │   ├── Profile.jsx
│   │   ├── Login.jsx                # Email + Google OAuth login
│   │   ├── Signup.jsx
│   │   ├── ResetPassword.jsx
│   │   ├── AuthCallback.jsx         # OAuth redirect handler
│   │   ├── AdminPanel.jsx           # Full admin dashboard (5500+ LOC)
│   │   └── About.jsx
│   └── 📂 utils/
│       ├── pricing.js               # Coupon engine & order pricing
│       ├── sizeSorting.js           # Smart size sorting (mm, inch, S/M/L/XL)
│       ├── colorUtils.js            # Color swatch + name utilities
│       ├── productImages.js         # Image URL helpers & tag parser
│       ├── imageCompressor.js       # Client-side image compression
│       ├── cmsDefaults.js           # Default CMS data & normalisation
│       └── whatsappNotifications.js # WhatsApp Business order alerts
│
├── 📂 database/                     # All database SQL files
│   ├── 📂 migrations/               # Ordered migration scripts
│   │   ├── 01_create_admin.sql
│   │   ├── 02_database_setup.sql    # Core tables: products, orders, carts
│   │   ├── 03_products_update.sql
│   │   ├── 04_payment_update.sql
│   │   ├── 05_variants_update.sql
│   │   ├── 06_social_media.sql
│   │   ├── 07_fix_orders_constraint.sql
│   │   └── 08_fix_orders_rls.sql
│   └── 📂 policies/
│       └── storage_policies.sql     # Supabase Storage RLS policies
│
├── 📂 docs/                         # Documentation
│   ├── DEPLOYMENT.md                # Vercel/Netlify deployment guide
│   ├── PRODUCTION_SETUP.md          # Production environment setup
│   └── SUPABASE_SETUP.md            # Database & auth configuration
│
├── 📂 scripts/                      # Build & utility scripts
│   ├── generate-sitemap.js          # Auto sitemap.xml generator (pre-build)
│   └── test-variants.js             # Product variant testing utility
│
├── 📂 public/                       # Static assets (served as-is)
│   ├── 📂 images/                   # Hero, collection & fashion images
│   ├── 📂 icons/                    # Payment & social icons
│   ├── favicon.svg / .ico / .png    # Multi-size favicons
│   ├── logo.png
│   ├── robots.txt
│   └── sitemap.xml
│
├── index.html                       # App shell
├── vite.config.js                   # Vite + manual chunk splitting
├── tailwind.config.js
├── postcss.config.js
├── vercel.json                      # Vercel deploy + cache headers config
├── package.json
└── .env                             # Local environment variables (git-ignored)
```

---

## ✨ Features

### 🏪 Storefront

- **Dual-category homepage** — seamlessly switches between *Tailoring Tools* and *Women's Fashion* with animated transitions
- **CMS-driven hero section** — headline, subtitle, CTA, background image all editable from admin without code changes
- **Announcement bar** — scrolling marquee with configurable discount messages & link
- **Dynamic collections grid** — showcase product sub-categories with images
- **Flash Deals section** — timed promotional product slots
- **New Arrivals & Top Picks** — curated product rows, admin-managed
- **Trust badges** — customisable icons (Free Shipping, Secure Payments, etc.)
- **Promotional banners** — full-width image banners with CTA links
- **CMS-driven footer** — links, tagline, social links, UPI/payment icons
- **Brand splash screen** — polished loading screen on app init
- **Shimmer skeleton loaders** — for products, orders, and admin tables

---

### 📦 Product System

- **Product cards** with:
  - Animated hover states (Framer Motion)
  - Sale/discount badges
  - Quick View slide-up modal
  - Wishlist toggle (heart icon)
  - Add-to-cart with variant selection
- **Product Detail Page (PDP)**:
  - Multiple product images with gallery
  - Embedded product video player
  - **Variant system** — color swatches + size selectors with smart mm/inch/clothing size sorting
  - Stock & availability indicator
  - Quantity selector
  - Full product description (rich text)
  - Related products / "You may also like"
- **Category & sub-category filtering** with animated pill UI
- **Search** — live product search with debouncing
- **Sorting** — by price (low→high, high→low), newest, popularity
- **Image compression** — client-side compression before admin upload

---

### 🛒 Cart & Wishlist

- **Persistent cart** — survives page refresh via `localStorage`
- **Persistent wishlist** — same local persistence strategy
- **Cart page** with:
  - Inline quantity adjustments
  - Remove items
  - Real-time price recalculation
  - Minimum order value progress bar (₹299 MOV)
  - Coupon code entry & validation
- **Coupon Engine** (fully client-side safe):
  - `WELCOME10` — 10% off up to ₹50 (min cart ₹399)
  - `SAVE50` — flat ₹50 off (min cart ₹499)
  - `SAVE100` — flat ₹100 off (min cart ₹799)
  - `FESTIVE15` — 15% off up to ₹150 (min cart ₹999)
  - Support for `ALL_PRODUCTS`, `SPECIFIC_CATEGORY`, `SELECTED_PRODUCTS`, `MIN_PRICE_TAG` scopes
  - Admin-manageable coupon list (stored in DB / local fallback)
- **Free shipping** across India on all orders (₹0 shipping fee)
- **Toast notifications** on cart/wishlist add with product preview

---

### 💳 Checkout & Payments

- **Multi-step checkout**:
  1. Delivery address form with full validation
  2. Order summary review
  3. Payment
- **UPI Direct Payment** — no third-party gateway, pays straight to merchant UPI ID
  - One-tap deep-links for **PhonePe**, **Google Pay**, **Paytm**, **CRED**
  - UPI QR Code display for in-app camera scan
  - Paste-ready UPI ID copy button
  - Customer types their own UPI VPA to trigger auto-routed deep-link
- **Payment screenshot upload** — customer uploads payment proof after UPI transfer; stored in Supabase Storage (`payment-screenshots` bucket); order moves to `payment_submitted` status
- **Cash on Delivery (COD)** — available payment option
- **Admin payment verification** — admin reviews screenshot and marks order `payment_verified` or rejects with a reason
- **WhatsApp notification** — auto-sends full order summary to admin WhatsApp on every new order
- **Order confirmation page** — instant feedback with shareable order status link

---

### 🔐 Authentication

- **Email / Password** sign up & login with Supabase Auth
- **Google OAuth** (one-click social login)
- **Reset Password** — email-based reset flow
- **Auth Callback** handler for OAuth redirects
- **Protected routes** — cart, checkout, orders, profile require login
- **Session persistence** — auto-login on page refresh

---

### 📬 Order Management

- **Orders page** — full order history with status badges
- **Order Status page** (`/order-status/:id`) — shareable per-order tracking link with **real-time live updates**
  - **Supabase Realtime** subscription (`postgres_changes` on the `orders` table) — status updates from admin appear on the customer's screen **instantly** without refresh
  - 30-second polling fallback for `payment_submitted` orders as a safety net
  - Manual Refresh button for on-demand sync
  - Status timeline: Pending Payment → Payment Submitted → Payment Verified → Confirmed → Preparing → Shipped → Delivered
  - Full shipping address, payment method, item breakdown with variant badges (size, colour)
  - "Buy Again" button — re-adds all items to cart in one tap
- **Admin order management**:
  - View all orders with real-time Supabase subscription
  - Filter by status, search by ID / customer name
  - Update order status (one-click)
  - Add tracking number & shipping notes
  - View & verify payment screenshot uploaded by customer
  - Reject payment with reason (shown to customer on status page)
  - Contact customer via WhatsApp directly from admin
  - Export orders to CSV

---

### 🛠 Admin Panel

> Accessible at `/admin` — restricted to the registered admin email.

The admin panel is a fully-featured back-office with **8 main sections**:

| Section | Description |
|---------|-------------|
| **Dashboard** | Sales overview, revenue stats, order counts, quick actions |
| **Orders** | All orders, status updates, WhatsApp contact, CSV export |
| **Products** | Full CRUD — add/edit/delete products with images, variants, pricing |
| **Variants** | Manage color + size variants per product with swatch preview |
| **Users** | Customer list from Supabase Auth |
| **Analytics** | Revenue trends, top products, category breakdown |
| **Homepage CMS** | Live homepage content editor (see CMS section) |
| **Social Media** | Manage social links displayed in footer & header |

**Admin UX features:**
- Command palette (`⌘K`) for instant navigation
- Confirm dialogs for destructive actions
- Toast notification system
- Skeleton loading states
- Keyboard-accessible throughout
- Mobile-responsive sidebar with collapse
- Undo / Redo for CMS changes

---

### 🎨 CMS – Homepage Builder

A fully visual **no-code homepage editor** built into the admin panel:

| CMS Section | What you can edit |
|-------------|-------------------|
| **Announcement Bar** | Text, link, background colour, visibility |
| **Hero Section** | Headline, subtitle, CTA button, background image |
| **Trust Badges** | Icon, label, description — drag-reorder |
| **Flash Deals** | Product selection, deal label, timer |
| **Category Filter** | Sub-category chips labels & icons |
| **Collections Grid** | Collection cards, images, labels |
| **New Arrivals** | Featured product slots |
| **Top Picks** | Curated product highlight row |
| **Promotional Banners** | Full-width banner image + CTA |
| **Footer** | Links, tagline, payment icons, social links |
| **SEO Settings** | Page title, meta description, OpenGraph image |
| **Media Library** | Upload & manage assets for CMS use |

**CMS features:**
- **Live Preview modal** — see changes before publishing
- **Publish / Draft system** — draft changes don't go live until you click Publish
- **Undo / Redo** history
- **Reset to defaults** with confirmation prompt
- **Women's Section Lock** — toggle to restrict Women's Fashion visibility

---

### ⚡ SEO & Performance

- **Dynamic `<head>` tags** via `SEO.jsx` component (title, description, OpenGraph, Twitter Card)
- **Auto-generated `sitemap.xml`** — runs as pre-build script via `scripts/generate-sitemap.js`
- **`robots.txt`** configured for crawlers
- **Code splitting** — Vite manual chunks:
  - `vendor-react` — React + React-DOM + React Router
  - `vendor-motion` — Framer Motion
  - `vendor-supabase` — Supabase client
  - `vendor-icons` — Lucide React
  - Per-page lazy bundles for all routes
- **Lazy loading with retry** — `lazyRetry()` auto-reloads on chunk fetch failures (post-deploy)
- **Vercel cache headers** — assets cached for 1 year (immutable), HTML `no-cache`
- **Image lazy loading** throughout all product grids
- **Client-side image compression** before upload to reduce storage usage

---

### 📲 Notifications

- **WhatsApp Business API integration** — order alerts sent to admin phone on every new order
  - Formatted message: order ID, items, total, shipping address, customer contact
- **In-app toast system** — non-blocking slide-in notifications for cart, wishlist, errors
- **Vercel Analytics** — page view + event tracking in production

---

## 🗄 Database Schema

> Managed via Supabase (PostgreSQL). All migrations in [`database/migrations/`](database/migrations/)

```sql
-- Core tables
products        -- id, name, description, price, original_price, category,
                -- sub_category, stock, image_url, features, active, variants (JSONB)

orders          -- id, user_id, total_amount, payment_id, shipping_address (JSONB),
                -- items (JSONB), status, tracking_number, notes

coupons         -- id, code, description, type, value, min_cart_total, max_discount,
                -- scope, active

cms_data        -- id, category, section_key, content (JSONB), published_at

social_links    -- id, platform, url, icon, active, display_order
```

**Row Level Security (RLS) policies:**
- Products: public read (active only), authenticated write
- Orders: users see only their own orders; admin sees all
- Storage: public read for product images, authenticated write

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- A [Supabase](https://supabase.com) project
- A UPI-enabled merchant account (PhonePe/GPay/Paytm/CRED)

### 1. Clone the repository

```bash
git clone https://github.com/hameedshaikdev/Asmalabel.in.git
cd Asmalabel.in
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

### 4. Set up the database

Run the SQL migrations in order against your Supabase project:

```bash
# In Supabase SQL Editor, run in order:
database/migrations/01_create_admin.sql
database/migrations/02_database_setup.sql
database/migrations/03_products_update.sql
database/migrations/04_payment_update.sql
database/migrations/05_variants_update.sql
database/migrations/06_social_media.sql
database/migrations/07_fix_orders_constraint.sql
database/migrations/08_fix_orders_rls.sql

# Then apply storage policies:
database/policies/storage_policies.sql
```

See [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md) for detailed setup.

### 5. Start development server

```bash
npm run dev
# → http://localhost:5173
```

---

## 🔑 Environment Variables

Create a `.env` file in the project root:

```env
# Supabase (required)
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional: Google Analytics
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
```

---

## 🌐 Deployment

Deployed on **Vercel** with automatic CI/CD from the `main` branch.

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for full Vercel/Netlify deployment instructions and [`docs/PRODUCTION_SETUP.md`](docs/PRODUCTION_SETUP.md) for production environment checklist.

**Vercel configuration** ([`vercel.json`](vercel.json)):
- SPA rewrites: all routes → `index.html`
- Assets cached `max-age=31536000, immutable`
- HTML `no-cache` for instant deploy propagation

---

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server on `localhost:5173` |
| `npm run build` | Generate sitemap + production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run oxlint static analysis |
| `node scripts/test-variants.js` | Test product variant parsing logic |

---

## 📄 Documentation

| File | Description |
|------|-------------|
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Vercel & Netlify deployment walkthrough |
| [`docs/PRODUCTION_SETUP.md`](docs/PRODUCTION_SETUP.md) | Full production environment & security checklist |
| [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md) | Supabase database, auth & storage configuration |

---

## 🤝 Contributing

This is a private commercial project. If you have access and want to contribute:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit your changes: `git commit -m "feat: add your feature"`
3. Push: `git push origin feature/your-feature`
4. Open a Pull Request against `main`

---

<div align="center">

Made with ❤️ by **[Hameed Shaik](https://github.com/hameedshaikdev)** · © 2025 Asmalabel

</div>
