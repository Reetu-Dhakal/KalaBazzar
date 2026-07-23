# KalaBazzar — Agent Instructions

## Repo state
- Complete marketplace rebuild from scratch — backend (Express/MongoDB) + frontend (React 19/Vite 6/Tailwind v4).
- Run `mongod` before starting backend.

## Stack
- **Backend:** Express + MongoDB (Mongoose), JWT access/refresh tokens, HTTP-only cookies, Cloudinary, Multer, Helmet, express-validator, Nodemailer
- **Frontend:** React 19 + Vite 6 + Tailwind CSS v4 (`@tailwindcss/vite` plugin), React Router v7, TanStack Query v5, Axios, Shadcn/UI (Radix primitives), react-hot-toast, Recharts, Lucide React
- **No TypeScript, no test framework, no CI**

## Quick start
```bash
cd backend && npm install && npm run dev    # API on :5000
# separate terminal:
cd frontend && npm install && npm run dev   # UI on :5173, proxies /api -> :5000
# seed data:
node backend/src/seed.js
```

## Commands
| Directory | Command | Purpose |
|-----------|---------|---------|
| `backend/` | `npm run dev` | Start with nodemon |
| `backend/` | `npm start` | Production start |
| `backend/` | `node src/seed.js` | Seed database |
| `frontend/` | `npm run dev` | Vite dev server |
| `frontend/` | `npm run build` | Vite production build |
| `frontend/` | `npm run lint` | oxlint — must pass before commits |

## Architecture
### Backend (`backend/src/`)
- `server.js` — entrypoint, connects DB + Cloudinary, starts Express
- `app.js` — Express app setup, middleware, route mounting (18 route groups)
- `config/` — DB connection, Cloudinary config, constants
- `models/` — User, SellerProfile, Product, Order, Review, Cart, Wishlist, Notification, Category, Region, Coupon, Transaction
- `middleware/` — auth (authenticate, authorize, optionalAuth), validate, upload (multer), error handler, rate limiter
- `controllers/` — auth, address, seller, product, order, review, cart, wishlist, notification, category, payment, coupon, admin
- `services/` — auth, seller, product, payment (Khalti/eSewa), cloudinary (upload)
- `routes/` — `/api/auth`, `/api/addresses`, `/api/products`, `/api/sellers`, `/api/orders`, `/api/categories`, `/api/regions`, `/api/cart`, `/api/wishlist`, `/api/reviews`, `/api/notifications`, `/api/payment`, `/api/coupons`, `/api/upload`, `/api/admin`, `/api/health`
- `validators/` — express-validator schemas for auth, seller, product
- `utils/` — ApiError, ApiResponse, asyncHandler, generateToken, pagination, sendEmail (nodemailer with SMTP env vars)

### Frontend (`frontend/src/`)
- `main.jsx` — React mount, TanStack Query, all providers (Auth, Notification, Cart, Wishlist), ErrorBoundary wrapper, Toaster
- `App.jsx` — 30+ React.lazy routes wrapped in Suspense spinner
- `services/api.js` — Axios instance, auto-JWT Bearer header, 401 refresh interceptor
- `context/` — AuthContext, NotificationContext (30s polling), CartContext (debounced updateQuantity), WishlistContext (move-to-cart/clear)
- `hooks/` — usePageTitle (SEO), useRecentlyViewed (localStorage, max 8 items)
- `pages/` — Home, Login, Register, ForgotPassword, ResetPassword, About, Contact, FAQ, Privacy, Terms, Shop, ProductDetail, CartPage, WishlistPage, RecentlyViewed, Checkout, OrderSuccess, OrdersPage, OrderDetail, OrderInvoice, ProfilePage, SellerApplication, SellerDashboard, SellerEarnings, SellerSettings, StorePage, CategoryPage, AdminDashboard, AdminCoupons, AdminOrders, AdminReviews, AdminUsers, NotFound
- `components/ui/` — Button, Input, Card (CardHeader/CardContent/CardTitle/CardDescription), Label, Badge, Skeleton, Spinner, ProductSkeleton (ProductGridSkeleton, ProductCardSkeleton) — shadcn-style wrappers
- `components/layout/` — Layout, Navbar, Footer, BackToTop, NotificationBell, ImageLightbox, CancelOrderModal, CartDrawer + CartDrawerProvider, ShareButton, QuickViewModal
- `components/auth/` — ProtectedRoute, AdminRoute
- `components/ErrorBoundary.jsx` — React class-based error boundary with refresh/home fallback

### Auth flow
- JWT access token (15m) + refresh token (7d, HTTP-only cookie)
- `POST /api/auth/register`, `POST /api/auth/login` → receive accessToken in body + refreshToken cookie
- Axios interceptor auto-attaches `Bearer` token from `localStorage('token')`
- On 401: interceptor calls `/api/auth/refresh` using cookie, stores new accessToken, retries
- Roles: customer → seller → admin

### Seller verification core flow
1. Customer fills `/seller/apply` form (district, craft story, verification path)
2. Admin reviews at `/admin/dashboard` (pending sellers list)
3. Admin approves → user role upgraded to `seller`, `isVerifiedArtisan: true`, approval email sent
4. Seller can create/publish/manage products in dashboard, view orders, update settings, view earnings, add tracking

### Payment gateways
- Khalti: initiate → redirect → verify (stub services)
- eSewa: initiate → callback → verify (stub services)
- COD: no gateway call

## Complete Feature Inventory

### Auth & Users
- Register with password strength indicator (animated bar + label)
- Login, logout, profile edit (name, phone), change password
- Forgot/reset password via email token
- Address manager (add/edit/delete/set-default) on profile page
- Admin users page with search by name/email/role

### Products
- Full CRUD for sellers (create/edit/publish/unpublish/remove)
- Published products with search + autocomplete (300ms debounce)
- Category, region, price-range filter + sort (newest/price/rating/popular)
- Pagination (server-side), grid/list toggle
- Featured products on homepage, related products on detail
- Product quick view modal from shop cards (image gallery, add-to-cart, wishlist)
- Sold count tracking — `numSold` incremented on order, displayed on cards
- View counter — `POST /products/:id/view` on detail page mount, "X views" badge
- Stock badges — "Out of Stock" (red), "Low Stock" (amber), discount % badges
- Category product counts in shop filter dropdown

### Product Detail
- Image lightbox gallery (keyboard nav, prev/next, dot indicators, counter)
- Share button — Facebook share, WhatsApp share, copy link
- Wishlist toggle, recently viewed tracking (localStorage, 8 items)
- Quantity selector, material badges, story-behind-product section
- Reviews with star rating + submission form + helpful voting (👍 toggle)
- Shipping info section, authenticated/secure badges

### Cart
- Add/update (400ms debounced, optimistic local update)/remove/clear
- Cart slide-out drawer — slide-in panel from right with items, qty controls, subtotal, checkout button
- Count badge in navbar, free-shipping threshold

### Checkout
- Saved address selection (radio) + manual entry form
- Coupon validation (min purchase, usage limits, expiry, %/fixed)
- COD / Khalti / eSewa payment method selection
- Order notes textarea (delivery instructions)
- Redirects to `/order-success/:id` on completion

### Orders
- Customer order list with status filter buttons
- Order detail with 5-step status timeline (pending→confirmed→processing→shipped→delivered)
- Cancel with reason modal (CancelOrderModal component)
- Printable invoice page (`/orders/:id/invoice`) with print styles
- Tracking number displayed on detail page

### Seller Dashboard
- Stats cards (products, orders, sales, rating)
- Revenue bar chart (Recharts, 30-day daily data)
- Low stock alerts card (stock ≤ 5, amber warning)
- Product CRUD table with edit/publish/unpublish/remove
- Orders table with status dropdown + tracking number input
- Earnings page (`/seller/earnings`) — total earnings/orders/avg, paginated order history
- Settings page — store name, bio, craft story, specialization, payout info, open/close toggle

### Admin Dashboard
- Stats cards (users, sellers, products, orders, revenue)
- Pending seller approval (approve/reject with confirmation)
- Coupon CRUD (create/edit/toggle/delete with form)
- Orders management — status filter + inline status dropdown + search by ID/name/email
- Reviews management — table with star rating, delete action
- Users management — table with role/status badges, search filter
- Quick actions sidebar with links to all admin pages

### Public Pages
- Home — hero banner, features grid, category grid, featured products, recently viewed, testimonial section, artisan CTA
- Shop — full filtering/sorting, grid/list toggle, quick view, sold count
- About, Contact (with form), FAQ (accordion), Privacy, Terms
- Store page — artisan info + product grid
- Category page — server-side pagination
- Recently viewed — full page grid with clear button

### Notifications
- Backend CRUD endpoints (`/api/notifications`)
- NotificationContext auto-polls every 30s
- NotificationBell in navbar with dropdown (mark-read/delete/mark-all-read)
- Unread count badge

### Email Notifications (Nodemailer, SMTP env vars)
- Order confirmation on creation
- Order status change notification
- Seller approval notification (triggered on admin approve)
- Password reset email

### SEO
- `usePageTitle` hook sets `document.title` + `<meta name="description">` per route
- Dynamic descriptions from product data on detail page

### UX / Polish
- Loading skeletons (ProductGridSkeleton, ProductCardSkeleton)
- BackToTop floating button (scroll > 400px)
- Toast notifications (react-hot-toast, dark theme)
- Lazy loading on all `<img>` tags
- Empty state messages with CTAs
- Cancel order modal instead of browser `confirm()`
- Error boundary catches uncaught React errors
- Custom 404 page with popular links
- Password strength indicator on registration
- Code splitting — all 30+ pages React.lazy loaded
- All components/code free of lint warnings

## Tailwind v4 config approach
- No `tailwind.config.js` — Tailwind v4 uses `@tailwindcss/vite` plugin and `@theme` CSS directives in `index.css`.
  Do NOT generate a JS-based config file.

## Design tokens (from README)
- Primary: `#6E1E1E`, Secondary: `#C89B3C`, Background: `#FBEED3`, Text: `#3A2A1F`
