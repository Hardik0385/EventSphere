# EventSphere – Serverless Event Management Platform

> A production-style Serverless Event Management System built on Cloudflare Workers, Pages, and D1 (Serverless Relational SQLite) for Cloud Computing laboratory demonstrations and academic evaluations.

---

## 1. Project Overview

Traditional event management applications often depend on continuously running servers (e.g. Node.js/Express on EC2 or VPS), introducing ongoing infrastructure maintenance and idle hosting expenses. **EventSphere** demonstrates how serverless edge computing eliminates dedicated application servers while guaranteeing:
- **Zero Idle Server Costs:** Scaled automatically to zero when inactive.
- **Sub-5ms Cold Starts:** Powered by Cloudflare V8 engine isolates.
- **Atomic Capacity Enforcement:** Relational SQLite locking on Cloudflare D1 prevents race conditions and overbooking.
- **Cryptographic Admission Verification:** QR tickets verified on-site with duplicate check-in prevention.
- **Real-Time Edge Analytics:** Aggregated directly from database queries with Recharts dashboards.

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 + Vite + TypeScript | High-performance Single Page Application (SPA) |
| **Styling** | Tailwind CSS | SaaS dashboard layout, responsive design, dark/light theme |
| **Backend** | Cloudflare Workers + Hono | Edge serverless REST API framework |
| **Database** | Cloudflare D1 (SQLite) | Managed serverless relational SQL database |
| **Authentication** | Web Crypto PBKDF2 + JWT | Workers-compatible password hashing & session management |
| **Validation** | Zod | Runtime request body schema validation |
| **QR Code** | `qrcode` | Opaque digital admission ticket generation |
| **Analytics** | Recharts | Live capacity and registration trend visualizations |
| **Icons** | Lucide React | Modern iconography |
| **Hosting** | Cloudflare Pages + Workers | 100% free-tier compatible serverless deployment |

---

## 3. Monorepo Project Structure

```text
event-sphere/
├── apps/
│   ├── web/                     # React.js + Vite + Tailwind CSS frontend
│   │   ├── src/
│   │   │   ├── components/      # EventCard, Navbar, Footer, QrCodeViewer, Modals
│   │   │   ├── context/         # AuthContext, ThemeContext, ToastContext
│   │   │   ├── lib/             # api.ts (Fetch client with cookie/header token handling)
│   │   │   ├── pages/
│   │   │   │   ├── public/      # Landing, ExploreEvents, EventDetails, Login, Register, About
│   │   │   │   ├── participant/ # Dashboard, MyRegistrations, MyTickets, ProfileSettings
│   │   │   │   ├── organizer/   # Dashboard, CreateEvent, ManageEvents, Registrations, Analytics, VerifyTickets
│   │   │   │   ├── admin/       # Dashboard, UserManagement, EventManagement
│   │   │   │   └── cloud/       # CloudArchitecturePage (Live 5-step demonstration module)
│   │   │   └── App.tsx          # Client-side routing with role-based guards
│   │   └── package.json
│   │
│   └── worker/                  # Cloudflare Workers serverless backend (Hono)
│       ├── src/
│       │   ├── lib/             # Web Crypto PBKDF2, HMAC-SHA256 JWT, Audit logging
│       │   ├── middleware/      # authMiddleware, requireRole, optionalAuth
│       │   ├── routes/          # auth, events, registrations, tickets, analytics, admin, health
│       │   └── index.ts         # Central Hono router, CORS, centralized error handling
│       ├── test/                # Automated Vitest integration test suite with in-memory D1
│       ├── wrangler.jsonc       # Cloudflare Workers & D1 database binding config
│       └── package.json
│
├── packages/
│   └── shared/                  # Shared TypeScript types, interfaces & Zod schemas
│       ├── src/index.ts
│       └── package.json
│
├── migrations/
│   ├── 0001_initial_schema.sql  # Users, Events, Registrations, CheckIns, AuditLogs tables
│   └── 0002_seed_data.sql       # Initial demo accounts, sample events, verified tickets
│
├── docs/
│   └── CLOUD_COMPUTING_EVALUATION.md # 6-part academic evaluation document + 25 Viva Q&As
│
├── package.json                 # Monorepo workspaces definition & build scripts
├── README.md                    # Setup, deployment & architectural documentation
└── .env.example                 # Environment configuration template
```

---

## 4. Quick Start (Local Development)

### Prerequisites
- Node.js version 20+ (Node v24 recommended)
- npm version 10+
- Git

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd "Cloud computing"
npm install
```

### 2. Build the Shared Package
```bash
npm run build:shared
```

### 3. Initialize the Local Cloudflare D1 Database
Apply schema migrations and sample seed data to your local Wrangler state:
```bash
# Apply schema and initial seed data locally
npx wrangler d1 migrations apply DB --local --config=apps/worker/wrangler.jsonc
```

### 4. Start the Serverless Backend Worker
In a terminal window:
```bash
npm run dev:worker
```
*The Cloudflare Worker will start at `http://localhost:8787`.*  
Verify edge health by visiting: `http://localhost:8787/api/health`

### 5. Start the React Frontend Application
In a second terminal window:
```bash
npm run dev:web
```
*The Vite application will start at `http://localhost:5173`.*

---

## 5. Seed Demonstration Accounts

For ease of university testing and evaluation, the seed migration populates demo credentials (all password: `password123`):

| Role | Email | Password | Access Capabilities |
|---|---|---|---|
| **System Admin** | `admin@eventsphere.cloud` | `password123` | Platform-wide stats, user role management, event moderation, audit logs |
| **Organizer** | `organizer@eventsphere.cloud` | `password123` | Event creation, capacity management, attendee CSV export, QR check-in |
| **Participant** | `participant@eventsphere.cloud` | `password123` | Event registration, digital QR ticket generation, profile settings |

> **Evaluator Tip:** The login page (`/login`) includes 1-click quick-fill buttons for Admin, Organizer, and Participant.

---

## 6. Running Automated Tests & Typechecks

EventSphere includes an automated Vitest integration test suite testing the real SQLite schema, constraints, unique indexes, password hashing, and capacity race conditions:

```bash
# Run the automated test suite
npm run test --workspace=@eventsphere/worker

# Run full TypeScript checks across all packages
npm run typecheck
```

---

## 7. Cloudflare Production Deployment Guide

Deploying to Cloudflare requires a free Cloudflare account:

### Step 1: Login to Cloudflare via Wrangler CLI
```bash
npx wrangler login
```

### Step 2: Create Remote Cloudflare D1 Database
```bash
npx wrangler d1 create eventsphere-db
```
*Wrangler will output your database ID (e.g. `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).*  
Copy this ID into `apps/worker/wrangler.jsonc` under `d1_databases[0].database_id`.

### Step 3: Apply Migrations to Remote D1
```bash
npx wrangler d1 migrations apply DB --remote --config=apps/worker/wrangler.jsonc
```

### Step 4: Deploy the Cloudflare Worker API
```bash
cd apps/worker
npx wrangler deploy
```
*Cloudflare will output your public Worker URL (e.g. `https://eventsphere-api.<your-subdomain>.workers.dev`).*

### Step 5: Deploy Frontend to Cloudflare Pages
```bash
# Build the production frontend bundle
cd ../web
npm run build

# Deploy the dist folder to Cloudflare Pages
npx wrangler pages deploy dist --project-name=eventsphere-web
```

---

## 8. Academic Evaluation Documentation

For university laboratory grading, comprehensive answers to 25 viva questions, service model comparisons (IaaS, PaaS, SaaS, FaaS), and a 5-minute presentation script, refer to:
👉 [docs/CLOUD_COMPUTING_EVALUATION.md](file:///c:/Users/Hardik%20Agrawal/Desktop/Cloud%20computing/docs/CLOUD_COMPUTING_EVALUATION.md)
