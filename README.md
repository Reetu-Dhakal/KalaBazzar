# Kala Bazaar Nepal

A production-ready multi-vendor marketplace connecting Nepali artisans with customers across Nepal. Built with Express/MongoDB backend and React 19 + Vite 6 + Tailwind v4 frontend.

## Features

### For Customers
- Browse authentic handmade Nepali products by category, region, or artisan store
- Advanced search with autocomplete, filters (price, category, region), and sort
- Product quick view, image lightbox (keyboard nav), share buttons
- Cart slide-out drawer with debounced quantity updates
- Secure checkout — COD, Khalti, eSewa with coupon validation
- Order tracking with 5-step timeline + printable invoice
- Product reviews with star rating + helpful voting
- Recently viewed tracking, wishlist with move-to-cart
- Address manager (add/edit/delete/set-default)

### For Sellers
- Role-distinct auth (seller/login, seller/register)
- Seller application → admin approval flow
- Onboarding checklist (profile → product → payout)
- Dashboard with stats, revenue chart, low-stock alerts
- Product CRUD (create/edit/publish/unpublish/delete)
- Order management with status updates + tracking number
- Store settings: name, bio, craft story, specialization, open/close toggle
- Payout info with QR code uploads (Bank, eSewa, Khalti)
- Seller feed for posting updates
- Earnings page with history

### For Admins
- Admin login at `/admin/login`
- Dashboard with platform-wide stats
- Seller approval/rejection
- Coupon CRUD (create/edit/toggle/delete)
- Orders management with status filters + inline updates
- Reviews management with delete
- Users management with search and role/status badges

## Tech Stack

### Frontend
- **React 19** + **Vite 6** with `@tailwindcss/vite` plugin
- **Tailwind CSS v4** (no config file — `@theme` directives in CSS)
- **React Router v7** with lazy-loaded routes (30+ pages)
- **TanStack Query v5** (ready for advanced data fetching)
- **Axios** with 401 refresh token interceptor
- **Shadcn/UI**-style primitives (Button, Card, Input, Badge, Skeleton)
- **react-hot-toast**, **Recharts**, **Lucide React**

### Backend
- **Node.js** + **Express** with modular route/controller/service layers
- **MongoDB** + **Mongoose** (12 models)
- **JWT** access tokens (15m) + refresh tokens (7d, HTTP-only cookie)
- **Cloudinary** + **Multer** for image uploads
- **express-validator** for input validation
- **Helmet** for security headers
- **Nodemailer** for email notifications (order confirm, status change, password reset, seller approval)

## Quick Start

```bash
# 1. Clone
git clone https://github.com/Reetu-Dhakal/KalaBazzar.git
cd KalaBazzar

# 2. Backend
cd backend
cp .env.example .env    # edit with your MongoDB URI, JWT secret, Cloudinary keys
npm install
npm run dev             # API on :5000

# 3. Frontend (separate terminal)
cd frontend
npm install
npm run dev             # UI on :5173, proxies /api -> :5000

# 4. Seed database
node backend/src/seed.js
```

### Test Credentials

| Role     | Email                   | Password      |
|----------|-------------------------|---------------|
| Admin    | admin@kalabazaar.com    | Admin123!     |
| Seller   | hari@example.com        | Seller123!    |
| Customer | sita@example.com        | Customer1!    |

## Project Structure

```
KalaBazzar/
├── backend/
│   └── src/
│       ├── config/         # DB, Cloudinary, constants
│       ├── controllers/    # 15 controllers (auth, seller, product, order, etc.)
│       ├── middleware/     # auth, validate, upload, error, rateLimiter
│       ├── models/         # 12 Mongoose models
│       ├── routes/         # 16 route groups mounted in app.js
│       ├── services/       # Business logic (auth, seller, product, payment, cloudinary)
│       ├── utils/          # ApiError, ApiResponse, asyncHandler, generateToken, pagination, sendEmail
│       ├── validators/     # express-validator schemas
│       ├── app.js          # Express app setup + middleware + route mounting
│       ├── seed.js         # Database seed script
│       └── server.js       # Entry point
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── auth/       # ProtectedRoute, AdminRoute
│       │   ├── layout/     # Layout, Navbar, Footer, CartDrawer, BackToTop, etc.
│       │   ├── seller/     # SellerOnboardingChecklist
│       │   └── ui/         # Button, Card, Input, Badge, Skeleton, Spinner
│       ├── context/        # Auth, Cart, Wishlist, Notification
│       ├── hooks/          # usePageTitle, useRecentlyViewed
│       ├── pages/          # 30+ lazy-loaded route pages
│       └── services/       # Axios instance with JWT interceptor
├── AGENTS.md
└── README.md
```

## Design System

- **Primary:** `#6E1E1E` — Deep maroon
- **Secondary:** `#C89B3C` — Gold
- **Background:** `#FBEED3` — Warm cream
- **Text:** `#3A2A1F` — Dark brown

## Key Routes

| Route | Access |
|-------|--------|
| `/` | Public landing page |
| `/shop`, `/product/:slug`, `/category/:slug`, `/region/:slug`, `/artisan/:slug` | Guest-browsable |
| `/cart`, `/wishlist`, `/checkout`, `/orders`, `/profile` | Customer only |
| `/seller/login`, `/seller/register` | Standalone auth (no layout) |
| `/seller/dashboard`, `/seller/feed`, `/seller/earnings`, `/seller/settings` | Seller only |
| `/admin/login` | Standalone |
| `/admin/dashboard`, `/admin/coupons`, `/admin/orders`, `/admin/reviews`, `/admin/users` | Admin only |

## Payment Gateways

- **COD** — no gateway call
- **Khalti** — initiate → redirect → verify (stubs)
- **eSewa** — initiate → callback → verify (stubs)
