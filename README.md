# Kala Bazaar Nepal

A production-ready multi-vendor marketplace connecting Nepali artisans with customers across Nepal. Built with TypeScript, Express/MongoDB backend and React 19 + Vite 6 + Tailwind v4 frontend.

## Features

### For Customers
- Browse authentic handmade Nepali products by category, region, or artisan store
- Advanced search with autocomplete, filters (price, category, region), and sort
- Product quick view, image lightbox, share buttons
- Cart slide-out drawer with debounced quantity updates
- Secure checkout — COD, Khalti, eSewa with coupon validation
- Order tracking with 5-step timeline + printable invoice
- Product reviews with star rating + helpful voting
- Recently viewed tracking, wishlist with move-to-cart
- Address manager (add/edit/delete/set-default)

### For Sellers
- Seller application with 3 verification paths (social media, marketplace, offline artisan)
- Admin approval flow with email notifications
- Dashboard with stats, revenue chart, low-stock alerts
- Product CRUD (create/edit/publish/unpublish/delete) with variants
- Order management with status updates + tracking number
- Store settings: name, bio, craft story, specialization, open/close toggle
- Payout info with QR code uploads (Bank, eSewa, Khalti)
- Earnings page with history

### For Admins
- Dashboard with platform-wide stats and charts
- Seller approval/rejection with reason
- Coupon CRUD (create/edit/toggle/delete)
- Orders management with status filters + inline updates
- Reviews management with delete
- Users management with search and role/status badges

## Tech Stack

### Frontend
- **React 19** + **TypeScript** + **Vite 6** with `@tailwindcss/vite` plugin
- **Tailwind CSS v4** (no config file — `@theme` directives in CSS)
- **React Router v7** with lazy-loaded routes (30+ pages)
- **TanStack Query v5** for data fetching
- **Axios** with 401 refresh token interceptor
- **React Hook Form** + **Zod** for form validation
- **Framer Motion** for animations
- **Recharts** for charts
- **Lucide React** for icons
- **react-hot-toast** for notifications

### Backend
- **Node.js** + **Express** + **TypeScript** with modular route/controller/service layers
- **MongoDB** + **Mongoose** (16 models)
- **JWT** access tokens (15m) + refresh tokens (7d, HTTP-only cookie)
- **Cloudinary** + **Multer** for image uploads
- **express-validator** for input validation
- **Helmet** for security headers
- **Nodemailer** for email notifications

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
cd backend
npm run seed
```

### Environment Variables

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/kala-bazaar
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
CLIENT_URL=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# SMTP (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
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
│       ├── config/         # DB, Cloudinary, constants (enums)
│       ├── controllers/    # 17 controllers (auth, seller, product, order, etc.)
│       ├── middleware/      # auth, validation, upload, error handler, rate limiter
│       ├── models/         # 16 Mongoose models
│       ├── routes/         # 18 route groups
│       ├── services/       # email service
│       ├── utils/          # ApiError, ApiResponse, tokenGenerator, pagination, helpers
│       ├── validators/     # express-validator schemas
│       ├── app.ts          # Express app setup + middleware + route mounting
│       ├── seed.ts         # Database seed script
│       └── server.ts       # Entry point
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── auth/       # ProtectedRoute, AdminRoute
│       │   ├── layout/     # Layout, Navbar, Footer, CartDrawer, NotificationBell, AdminLayout
│       │   └── ui/         # Button, Card, Input, Badge, Skeleton
│       ├── context/        # Auth, Cart, Wishlist, Notification providers
│       ├── hooks/          # usePageTitle, useRecentlyViewed
│       ├── lib/            # api (Axios), utils (cn, formatCurrency)
│       ├── pages/          # 30+ lazy-loaded route pages
│       └── types/          # TypeScript type definitions
├── AGENTS.md
└── README.md
```

## Design System

- **Primary:** `#6E1E1E` — Deep maroon
- **Secondary:** `#C89B3C` — Gold
- **Background:** `#FBEED3` — Warm cream
- **Text:** `#3A2A1F` — Dark brown
- **Fonts:** Cormorant Garamond (headings) + Poppins (body)

## Key Routes

| Route | Access |
|-------|--------|
| `/` | Public landing page |
| `/shop`, `/product/:slug` | Guest-browsable |
| `/cart`, `/wishlist`, `/checkout`, `/orders`, `/profile` | Customer only |
| `/seller/apply`, `/seller/dashboard`, `/seller/products`, `/seller/orders`, `/seller/earnings`, `/seller/settings` | Seller only |
| `/admin/dashboard`, `/admin/sellers`, `/admin/coupons`, `/admin/orders`, `/admin/reviews`, `/admin/users` | Admin only |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/products` | Get products (paginated, filterable) |
| GET | `/api/products/featured` | Get featured products |
| POST | `/api/sellers/apply` | Apply as seller |
| POST | `/api/orders` | Create order |
| GET | `/api/cart` | Get cart |
| POST | `/api/cart/items` | Add to cart |

## Payment Gateways

- **COD** — no gateway call, paymentStatus stays 'Pending'
- **Khalti** — initiate → redirect → verify (stubs)
- **eSewa** — initiate → callback → verify (stubs)
