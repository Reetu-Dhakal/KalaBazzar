# KalaBazzar — Agent Instructions

## Repo state
- All source files are deleted from working tree. Run `git restore .` to recover them before working.

## Stack
- **Backend:** Express + MongoDB (Mongoose), JWT auth, Cloudinary image upload, Multer, Helmet
- **Frontend:** React 19 + Vite 8, Tailwind CSS v4, React Router v7, Axios, Framer Motion, react-hot-toast, react-icons
- **Validation (BE):** express-validator (already installed) — do not add Zod/Joi
- **Missing deps (install when needed):** react-hook-form, recharts

## Quick start
```bash
git restore .
cd backend && npm install && npm run dev    # API on :5000
# separate terminal:
cd frontend && npm install && npm run dev   # UI on :5173, proxies /api -> :5000
```

## Commands
| Directory | Command | Purpose |
|-----------|---------|---------|
| `backend/` | `npm run dev` | Start with nodemon |
| `backend/` | `npm start` | Production start |
| `frontend/` | `npm run dev` | Vite dev server |
| `frontend/` | `npm run build` | Vite production build |
| `frontend/` | `npm run lint` | oxlint (React + Oxc plugins) |
| `frontend/` | `npm run preview` | Preview production build |

## Architecture
- **Entrypoints:** `backend/server.js` (Express app), `frontend/src/main.jsx` (React mount)
- **Routing (FE):** `App.jsx` wraps `<AuthProvider>` + `<CartProvider>`, renders 11 routes
- **API client:** `frontend/src/utils/axios.js` — base URL `/api`, auto-injects JWT from `localStorage('token')`, redirects to `/login` on 401
- **Auth:** JWT via `Bearer` header, stored in localStorage
- **Backend routes:** `/api/auth`, `/api/products`, `/api/orders`, `/api/categories`, `/api/admin`, `/api/health`
- **User roles:** Customer → Seller → Admin

## Linting
- Uses `oxlint` (not ESLint). Config at `frontend/.oxlintrc.json` — enables `react/rules-of-hooks` and `react/only-export-components`.

## No tests or typecheck
- No test framework, no TypeScript, no CI workflows.

## Tailwind v4 config approach
- No `tailwind.config.js` — Tailwind v4 uses `@theme` CSS directives in `index.css`.
  Do NOT generate a JS-based config file.

## Design tokens (from README)
- Primary: `#6E1E1E`, Secondary: `#C89B3C`, Background: `#FBEED3`, Text: `#3A2A1F`
