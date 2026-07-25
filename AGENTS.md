# KalaBazzar — Agent Instructions

## Repo state
- Complete marketplace rebuild from scratch — backend (Express/MongoDB/TypeScript) + frontend (React 19/TypeScript/Vite 6/Tailwind v4).
- Run `mongod` before starting backend.

## Stack
- **Backend:** Express + MongoDB (Mongoose) + TypeScript, JWT access/refresh tokens, HTTP-only cookies, Cloudinary, Multer, Helmet, express-validator, Nodemailer
- **Frontend:** React 19 + TypeScript + Vite 6 + Tailwind CSS v4 (`@tailwindcss/vite` plugin), React Router v7, TanStack Query v5, Axios, React Hook Form + Zod, Framer Motion, Recharts, Lucide React, react-hot-toast
- **TypeScript throughout, no test framework, no CI**

## Quick start
```bash
cd backend && npm install && npm run dev    # API on :5000 (tsx watch)
# separate terminal:
cd frontend && npm install && npm run dev   # UI on :5173, proxies /api -> :5000
# seed data:
cd backend && npm run seed
```

## Commands
| Directory | Command | Purpose |
|-----------|---------|---------|
| `backend/` | `npm run dev` | Start with tsx watch |
| `backend/` | `npm run build` | TypeScript compile |
| `backend/` | `npm start` | Production start |
| `backend/` | `npm run seed` | Seed database |
| `frontend/` | `npm run dev` | Vite dev server |
| `frontend/` | `npm run build` | TypeScript + Vite build |
| `frontend/` | `npm run lint` | oxlint — must pass before commits |

## Architecture
### Backend (`backend/src/`)
- `server.ts` — entrypoint, connects DB, starts Express
- `app.ts` — Express app setup, middleware, route mounting (18 route groups)
- `config/` — DB connection, Cloudinary config, constants (enums)
- `models/` — 16 Mongoose models (User, SellerProfile, Product, Category, Craft, Region, Collection, Order, Review, Cart, Wishlist, Story, Notification, Banner, HomepageSettings, Coupon)
- `middleware/` — auth (authenticate, authorize, optionalAuth), validation (express-validator), upload (multer), errorHandler, rateLimiter
- `controllers/` — 17 controllers (auth, seller, product, order, cart, wishlist, review, category, craft, region, story, notification, admin, upload, coupon, banner, homepage, collection)
- `services/` — emailService (Nodemailer)
- `routes/` — 18 route files mounted in app.ts
- `validators/` — express-validator schemas (auth, seller, product, order, category, craft, region)
- `utils/` — ApiError, ApiResponse, tokenGenerator, pagination, helpers

### Frontend (`frontend/src/`)
- `main.tsx` — React mount, QueryClientProvider, all providers (Auth, Notification, Cart, Wishlist), ErrorBoundary, Toaster
- `App.tsx` — 30+ React.lazy routes wrapped in Suspense
- `lib/api.ts` — Axios instance, auto-JWT Bearer header, 401 refresh interceptor
- `lib/utils.ts` — cn(), formatCurrency(), formatDate(), truncateText()
- `types/index.ts` — Complete TypeScript type definitions
- `context/` — AuthContext, NotificationContext (30s polling), CartContext (debounced updateQuantity), WishlistContext (move-to-cart/clear)
- `hooks/` — usePageTitle (SEO), useRecentlyViewed (localStorage, max 8 items)
- `pages/` — Home, Login, Register, ForgotPassword, ResetPassword, Shop, ProductDetail, CartPage, WishlistPage, RecentlyViewed, Checkout, OrderSuccess, OrdersPage, OrderDetail, OrderInvoice, ProfilePage, SellerApplication, SellerDashboard, SellerProducts, SellerProductForm, SellerOrders, SellerEarnings, SellerSettings, StorePage, CategoryPage, AdminDashboard, AdminSellers, AdminCoupons, AdminOrders, AdminReviews, AdminUsers, About, Contact, FAQ, Privacy, Terms, NotFound
- `components/ui/` — Button, Card, Input, Badge, Skeleton
- `components/layout/` — Layout, Navbar, Footer, CartDrawer, NotificationBell, AdminLayout
- `components/auth/` — ProtectedRoute, AdminRoute
- `components/ProductCard.tsx` — Reusable product card
- `components/QuickViewModal.tsx` — Product quick view modal
- `components/ErrorBoundary.tsx` — React class-based error boundary

### Auth flow
- JWT access token (15m) + refresh token (7d, HTTP-only cookie)
- `POST /api/auth/register`, `POST /api/auth/login` → receive accessToken in body + refreshToken cookie
- Axios interceptor auto-attaches `Bearer` token from `localStorage('token')`
- On 401: interceptor calls `/api/auth/refresh` using cookie, stores new accessToken, retries
- Roles: customer → seller → admin

### Seller verification core flow
1. Customer fills `/seller/apply` form (3-step: personal info, craft details, verification path)
2. Verification paths: social media links, marketplace profiles, or offline artisan (workshop photos + craft story)
3. Admin reviews at `/admin/sellers`
4. Admin approves → user role upgraded to `seller`, `isVerifiedArtisan: true`, approval email sent
5. Seller can create/publish/manage products in dashboard, view orders, update settings, view earnings, add tracking

### Payment gateways
- Khalti: initiate → redirect → verify (stub services)
- eSewa: initiate → callback → verify (stub services)
- COD: no gateway call, paymentStatus stays 'Pending'

## Complete Feature Inventory

### Auth & Users
- Register with password strength indicator (animated bar + label)
- Login, logout, profile edit (name, phone), change password
- Forgot/reset password via email token
- Address manager (add/edit/delete/set-default) on profile page
- Admin users page with search by name/email/role

### Products
- Full CRUD for sellers (create/edit/publish/unpublish/remove) with react-hook-form + zod
- Product variants with name, SKU, price, inventory
- Published products with search + autocomplete (300ms debounce)
- Category, craft, region, price-range filter + sort
- Pagination (server-side)
- Featured products on homepage, related products on detail
- Product quick view modal (image gallery, add-to-cart, wishlist)
- Analytics: view count, purchase count, wishlist count
- Stock badges — "Out of Stock" (red), "Low Stock" (amber), discount % badges

### Product Detail
- Image gallery with thumbnail selector
- Share button — Facebook share, WhatsApp share, copy link
- Wishlist toggle, recently viewed tracking (localStorage, 8 items)
- Quantity selector, material badges, story-behind-product section
- Reviews with star rating + submission form + helpful voting (toggle)
- Shipping info section
- View count increment on mount

### Cart
- Add/update (400ms debounced)/remove/clear
- Cart slide-out drawer from right with items, qty controls, subtotal, checkout button
- Coupon code validation and application
- Count badge in navbar

### Checkout
- Saved address selection (radio) + manual entry form
- Coupon validation (min purchase, usage limits, expiry, %/fixed)
- COD / Khalti / eSewa payment method selection
- Order notes textarea (delivery instructions)
- Redirects to `/order-success/:id` on completion

### Orders
- Customer order list with status filter buttons
- Order detail with 5-step status timeline (pending→confirmed→processing→shipped→delivered)
- Cancel with reason modal
- Printable invoice page (`/orders/:id/invoice`) with print styles
- Tracking number displayed on detail page

### Seller Dashboard
- Stats cards (products, orders, sales, rating)
- Revenue bar chart (Recharts, 30-day daily data)
- Low stock alerts card (stock ≤ 5)
- Product CRUD table with edit/publish/unpublish/remove
- Orders table with status dropdown + tracking number input
- Multi-step seller application form with verification paths
- Earnings page with total earnings/orders/avg, paginated order history
- Settings page — store name, logo, bio, craft story, payout info, QR code uploads, open/close toggle

### Admin Dashboard
- Stats cards (users, sellers, products, orders, revenue) with charts
- Pending seller approval (approve/reject with reason modal)
- Coupon CRUD (create/edit/toggle/delete with form)
- Orders management — status filter + inline status dropdown + search
- Reviews management — table with star rating, delete action
- Users management — table with role/status badges, search filter
- AdminLayout with collapsible sidebar navigation

### Public Pages
- Home — hero banner, features grid, category grid, featured products, recently viewed, testimonials, artisan CTA
- Shop — full filtering/sorting, pagination, product grid
- About, Contact (with form), FAQ (accordion), Privacy, Terms
- Store page — artisan info + product grid
- Category page with products
- Recently viewed — full page grid with clear button
- Wishlist page with move-to-cart

### Notifications
- Backend CRUD endpoints (`/api/notifications`)
- NotificationContext auto-polls every 30s
- NotificationBell in navbar with dropdown (mark-read/delete/mark-all-read)
- Unread count badge

### Email Notifications (Nodemailer, SMTP env vars)
- Welcome email on registration
- Email verification
- Order confirmation on creation
- Order status change notification
- Seller application received
- Seller approval/rejection notification
- Password reset email
- New review notification

### SEO
- `usePageTitle` hook sets `document.title` + `<meta name="description">` per route
- Dynamic descriptions from product data on detail page

### UX / Polish
- Loading skeletons
- Toast notifications (react-hot-toast)
- Empty state messages with CTAs
- Error boundary catches uncaught React errors
- Custom 404 page with popular links
- Password strength indicator on registration
- Code splitting — all 30+ pages React.lazy loaded
- Framer Motion page transitions and animations
- Responsive design throughout

## Tailwind v4 config approach
- No `tailwind.config.js` — Tailwind v4 uses `@tailwindcss/vite` plugin and `@theme` CSS directives in `index.css`.
  Do NOT generate a JS-based config file.

## Design tokens (from index.css)
- Primary: `#6E1E1E`, Secondary: `#C89B3C`, Background: `#FBEED3`, Text: `#3A2A1F`
- Fonts: Cormorant Garamond (headings), Poppins (body)