# कला Bazaar Nepal (Kala Bazaar Nepal)

A production-ready multi-vendor e-commerce marketplace connecting Nepali artisans with customers across Nepal.

## 🏪 About

Kala Bazaar Nepal is a dedicated multi-vendor marketplace that connects local Nepali artisans with customers across Nepal. The platform focuses exclusively on authentic handmade products - from pottery and wood crafts to Mithila art, Thanka paintings, jewelry, and traditional textiles.

Unlike generic marketplaces, Kala Bazaar is designed to preserve Nepal's culture, empower local artisans, and provide customers with a trusted platform to discover unique handmade creations.

## ✨ Features

### For Customers
- Browse authentic handmade Nepali products
- Advanced search and filtering
- Secure checkout (eSewa, Khalti, COD)
- Order tracking and history
- Product reviews and ratings
- Wishlist management
- Seller store profiles

### For Sellers
- Free online store setup
- Product management dashboard
- Inventory management
- Order management
- Revenue analytics
- Withdrawal requests
- Store customization

### For Administrators
- Platform analytics dashboard
- Seller verification
- User management
- Product moderation
- Order management
- Commission management
- Content management

## 🛠 Tech Stack

### Frontend
- **React 19** with Vite
- **Tailwind CSS v4** for styling
- **React Router DOM** for navigation
- **Axios** for API calls
- **Framer Motion** for animations
- **React Hot Toast** for notifications
- **Lucide React / React Icons** for icons

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Cloudinary** for image uploads
- **Multer** for file handling
- **Helmet** for security headers

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/Reetu-Dhakal/KalaBazzar.git
cd KalaBazzar
```

2. Install Backend Dependencies
```bash
cd backend
npm install
```

3. Configure Backend Environment
```bash
# Edit backend/.env with your values:
PORT=5000
MONGODB_URI=mongodb://localhost:27017/kalabazaar
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
```

4. Install Frontend Dependencies
```bash
cd frontend
npm install
```

5. Start Development Servers

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## 📁 Project Structure

```
KalaBazzar/
├── backend/
│   ├── config/           # Database configuration
│   ├── controllers/      # Route controllers
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── categoryController.js
│   │   └── adminController.js
│   ├── middleware/        # Express middleware
│   │   ├── auth.js       # JWT authentication
│   │   ├── upload.js     # File upload
│   │   └── errorHandler.js
│   ├── models/           # Mongoose models
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── Category.js
│   │   ├── Coupon.js
│   │   └── Withdrawal.js
│   ├── routes/           # Express routes
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   ├── categories.js
│   │   └── admin.js
│   ├── uploads/          # Uploaded files
│   ├── server.js         # Entry point
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   │   ├── layout/   # Navbar, Footer
│   │   │   ├── ui/       # UI primitives
│   │   │   ├── home/     # Homepage sections
│   │   │   └── product/  # Product components
│   │   ├── context/      # React contexts
│   │   │   ├── AuthContext.jsx
│   │   │   └── CartContext.jsx
│   │   ├── pages/        # Route pages
│   │   │   ├── HomePage.jsx
│   │   │   ├── Shop.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── BecomeSeller.jsx
│   │   │   ├── About.jsx
│   │   │   └── Contact.jsx
│   │   ├── utils/        # Utilities
│   │   │   └── axios.js
│   │   ├── hooks/        # Custom hooks
│   │   ├── App.jsx       # Main app with routes
│   │   ├── main.jsx      # Entry point
│   │   └── index.css     # Tailwind + custom styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## 🎨 Design System

- **Primary**: #6E1E1E (Deep maroon)
- **Secondary**: #C89B3C (Gold)
- **Background**: #FBEED3 (Warm cream)
- **Text**: #3A2A1F (Dark brown)
- **Typography**: Cormorant Garamond (headings) + Poppins (body)

## 🔌 API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update profile
- `PUT /api/auth/password` - Update password
- `POST /api/auth/become-seller` - Apply as seller

### Products
- `GET /api/products` - List products (with filters)
- `GET /api/products/:slug` - Get product details
- `POST /api/products` - Create product (seller)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/products/:id/reviews` - Add review

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/me` - Get user orders
- `GET /api/orders/seller/me` - Get seller orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - List users
- `PUT /api/admin/verify-seller/:id` - Verify seller
- `GET /api/admin/orders` - List all orders
- `GET /api/admin/withdrawals` - List withdrawals

## 👥 User Roles

1. **Customer** - Browse, shop, review products
2. **Seller** - Create store, manage products, fulfill orders
3. **Admin** - Platform management, seller verification, analytics

## 💳 Payment Methods
- Cash on Delivery (COD)
- eSewa (coming soon)
- Khalti (coming soon)

---

Built with ❤️ for Nepali artisans