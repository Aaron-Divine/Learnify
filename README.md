# Learnify — Online Learning Platform (Phase 1)

**Learnify** is a modern, Udemy-style online learning web application built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**. It enables course instructors to upload courses and price them natively in world currencies without forced conversions.

---

## 🎨 Brand & Color Palette

Sampled directly from the official Learnify logo:

| Token | Hex Value | Usage |
| :--- | :--- | :--- |
| **Deep Navy** | `#081536` / `#050E26` | Dark mode primary background & card surfaces |
| **Electric Cyan** | `#0BB9FE` / `#13E4FF` | Primary brand accent (buttons, links, active states, glowing icons) |
| **Violet / Purple** | `#8B5CF6` / `#A855F7` | Secondary accent (badges, gradients, interactive borders) |
| **Coral Orange** | `#FF8A3D` / `#FFAC42` | Highlight accent (pricing display, alert badges, star accents) |
| **Light Surface** | `#F8FAFC` / `#FFFFFF` | Light mode background and card surfaces |
| **Soft Off-White** | `#F8FAFC` | High-contrast body typography on dark backgrounds |

### Theme System
- **Dark/Light Mode Toggle**: Persisted via `localStorage` with system preference detection and smooth transitions.
- **Logo Integration**:
  - Displays the dark logo in dark mode (`/logo-dark.png`)
  - Displays the light logo in light mode (`/logo-light.png`)
  - Dynamic vector component (`<LearnifyLogo />`) with theme-adaptive typography ("Learn" in white on dark, deep navy on light; "ify" in electric cyan) and glowing graduation-cap book mark.
- **Subtle Gradient Glow**: `linear-gradient(135deg, #0BB9FE 0%, #8B5CF6 50%, #FF8A3D 100%)` applied to hero headers, CTA buttons, and play overlays.

---

## 🚀 Key Features Built in Phase 1

### 1. Admin Portal (`/admin`)
- **Protected Access & Role-Based Guard**:
  - Direct navigation to `/admin` is guarded. Unauthenticated users are redirected to the admin authentication screen.
  - No public "Admin" links are exposed on viewer-facing pages (navbar, hero, or footer).
  - Easy-to-configure admin account via `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables.
  - Active admin session badge with one-click **Sign Out**.
- **Add New Course Form**:
  1. **Course title** (required, with validation)
  2. **Course summary / description** (required, multi-line auto-wrapping textarea)
  3. **Instructor Interledger Testnet Wallet Address** (required, test wallet format `$ilp.interledger-test.dev/(input)` where the instructor enters their wallet username)
  4. **Thumbnail / showcase image** (required, drag-and-drop / file picker, image type validation for JPEG, PNG, WebP, 10MB limit, image preview)
  5. **Course video upload** (required, real-time animated percentage progress bar `0% → 100%`, format validation for MP4, WebM, MOV, 250MB limit, and clear error messages)
  6. **Currency dropdown** (required, supported currencies: **COP, PKR, PEB, EGG, CAD, SGD, MXN, GBP, ZAR, EUR, USD**, displaying country flags, currency symbols, and ISO codes)
  7. **Price input** (required, numeric input with positive number validation `> 0`)
- **Form validation, loading spinners, and toast notifications** (success, warning, error).
- **Manage Courses Table**:
  - Displays all courses with thumbnail preview, title, Interledger testnet wallet address, formatted price with native currency symbol, date added, and direct storefront link.
  - **Edit Course**: Interactive modal to update title, summary, wallet address, price, currency, or media URLs.
  - **Delete Course**: Confirmation modal with instant catalog refresh.

### 2. Viewer-Facing Pages (Public)
- **Landing / Home Page (`/`)**:
  - Clean public navigation (no admin buttons).
  - Hero section featuring the Learnify brand emblem, inspiring headline, and trust metrics.
  - **Live Search Bar**: Real-time filtering across course titles and descriptions.
  - **Currency Filter Chips**: Instant filtering by currency (**ALL, USD, EUR, GBP, CAD, SGD, MXN, COP, ZAR, PKR, PEB, EGG**).
  - **Course Card Grid**: High-contrast cards with showcase thumbnail, hover zoom, currency code badge, 2-line description clamp, and price displayed in original currency with accent color (`#FF8A3D`).
- **Course Details Page (`/course/[id]`)**:
  - **Pre-Playback Showcase Area**: Large thumbnail preview with centered glowing Play button overlay.
  - **Video Player**: Clicking the play button launches the HTML5 video player for smooth streaming.
  - **Full Course Details**: Full summary, published date, syllabus checklist, and currency badge.
  - **Purchase Box**: Sticky sidebar card displaying exact price in original currency.
  - **"Buy Now / Enroll" Button**: Placeholder button displaying a "Payments coming soon" modal for Phase 2 (the instructor's test wallet is kept private from public users and handled securely on the backend/admin portal).

### 3. Architecture & Cloud Storage
- **Course Database Schema**:
  ```typescript
  interface Course {
    id: string;
    title: string;
    summary: string;
    thumbnail_url: string;
    video_url: string;
    currency_code: string;
    price: number;
    wallet_address: string; // e.g. $ilp.interledger-test.dev/(username)
    created_at: string;
    updated_at: string;
  }
  ```
- **Cloud File Storage**:
  - Ready for **Supabase Storage** (or S3/Cloudinary) via `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
  - Seamless local file fallback in `public/uploads` with full progress reporting so the app works out-of-the-box locally without third-party setup.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ (tested on Node 20 and Node 24)
- npm or pnpm

### 1. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your admin credentials in `.env.local`:
```env
# Admin Account Configuration
ADMIN_EMAIL=admin@learnify.com
ADMIN_PASSWORD=learnify2026!

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional Cloud File Storage & DB (Supabase)
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build & Start
```bash
npm run build
npm run start
```

---

## 🔐 Admin Login Credentials
- **URL**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Default Email**: `admin@learnify.com` (or value of `ADMIN_EMAIL`)
- **Default Password**: `learnify2026!` (or value of `ADMIN_PASSWORD`)

---

## 📁 Project Structure
```text
Learnify/
├── public/
│   ├── logo-dark.png         # Cropped dark mode logo asset
│   ├── logo-light.png        # Light mode logo asset
│   ├── learnify-brand.jpg    # Original brand master artwork
│   └── uploads/              # Local storage for uploaded thumbnails & videos
├── data/
│   └── courses.json          # Persistent local storage with initial seed courses
├── src/
│   ├── app/
│   │   ├── admin/page.tsx    # Admin upload form & course management table
│   │   ├── course/[id]/page.tsx # Course details & video player
│   │   ├── api/
│   │   │   ├── auth/route.ts # Admin auth session endpoint
│   │   │   ├── courses/route.ts # Courses API (GET, POST)
│   │   │   ├── courses/[id]/route.ts # Single course API (GET, PUT, DELETE)
│   │   │   └── upload/route.ts # Cloud/local media upload with progress
│   │   ├── globals.css       # Theme tokens, CSS variables, gradients
│   │   ├── layout.tsx        # Root layout with theme provider
│   │   └── page.tsx          # Public storefront & search/filter grid
│   ├── components/
│   │   ├── CourseCard.tsx    # Course card with thumbnail & currency price
│   │   ├── CourseDetailsClient.tsx # Video player & enrollment UI
│   │   ├── Footer.tsx        # Footer with supported currencies & links
│   │   ├── LearnifyLogo.tsx  # Dynamic dark/light adaptive logo component
│   │   ├── Navbar.tsx        # Navigation header with search & theme toggle
│   │   ├── ThemeProvider.tsx # Dark/light theme context & persistence
│   │   ├── ThemeToggle.tsx   # Smooth theme switcher button
│   │   └── Toast.tsx         # Notification toast container
│   ├── lib/
│   │   ├── currencies.ts     # 24+ world currencies with symbols & formatting
│   │   └── db.ts             # Course repository (Supabase + local fallback)
│   └── types/
│       └── index.ts          # TypeScript schemas
├── .env.example
├── .env.local
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```
