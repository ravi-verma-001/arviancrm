# Arvian Marketing CRM & Agency Management System

**Arvian Marketing CRM** is a production-oriented, full-stack CRM and digital agency operations management platform built for **Arvian Marketing**. It centralizes leads pipeline management, scheduled follow-up reminders in the Asia/Kolkata timezone, internal Meta Ads performance tracking, dedicated client campaign workspaces, Instagram monthly content calendars, role-based employee directories, attendance logs, strict salary privacy, finance & billing, and business intelligence analytics.

---

## 1. Technology Stack Architecture

- **Frontend & Server**: Next.js 14 (App Router, Server Actions & Route Handlers), React 18, TypeScript (Strict).
- **Styling & UI**: Tailwind CSS, Lucide React icons, Responsive Collapsible Sidebar, Keyboard shortcuts (`⌘K` / `Ctrl+K` Global Search).
- **Database & ORM**: 
  - **Local Zero-Config Run**: SQLite (`file:./dev.db`) managed via Prisma ORM for immediate offline execution without external database dependencies.
  - **Production / Supabase**: PostgreSQL schema with Row-Level Security (RLS) policies and indexes provided in `prisma/supabase_schema.sql` and `prisma/schema.prisma`.
- **Authentication & Security**: HTTP-only JWT session cookies, bcrypt password hashing, server-side authorization role guards, and database-level salary privacy.
- **Data Exchange**: Client/Server XLSX & CSV import wizard with duplicate detection, CSV streaming export, printable reports.
- **Timezone**: Defaulted to `Asia/Kolkata` (IST) across all dates, scheduled follow-ups, and attendance timestamps.
- **Currency**: Indian Rupee (`INR` / `₹`) with formatted currency strings and zero-denominator protected division for advertising metrics (`CPC`, `CPL`, `CTR`, `ROAS`).

---

## 2. Default Seed Accounts & Role Switcher

The database is seeded with real Arvian Marketing digital agency data. A **One-Click Role Switcher** is embedded in the login screen and top navigation header to test different permission perspectives:

| Role | Employee ID | Name | Email | Password | Access Privileges |
|---|---|---|---|---|---|
| **Super Admin / Owner** | `ARV-OWNER-001` | Aarav Sharma | `admin@arvianmarketing.com` | `admin123` | Full agency access, payroll, financial reports, all clients, audit logs |
| **Sales Executive** | `ARV-EMP-101` | Rahul Sharma | `rahul@arvianmarketing.com` | `password123` | Assigned leads, follow-up queue, qualification, personal KPIs |
| **Sales Executive** | `ARV-EMP-102` | Priya Patel | `priya@arvianmarketing.com` | `password123` | Assigned leads, follow-up queue, qualification, personal KPIs |
| **Sales Executive** | `ARV-EMP-103` | Amit Verma | `amit@arvianmarketing.com` | `password123` | Assigned leads, follow-up queue, qualification, personal KPIs |
| **Sales Executive** | `ARV-EMP-104` | Neha Gupta | `neha@arvianmarketing.com` | `password123` | Assigned leads, follow-up queue, qualification, personal KPIs |
| **Graphic Designer** | `ARV-EMP-201` | Arjun Mehta | `arjun@arvianmarketing.com` | `password123` | Creative briefs, ad assets, content design tasks, version history |
| **Social Media Manager**| `ARV-EMP-301` | Sneha Rao | `sneha@arvianmarketing.com` | `password123` | Instagram content calendar, captions, hashtags, approval pipeline |
| **Meta Ads Manager** | `ARV-EMP-401` | Karan Malhotra | `karan@arvianmarketing.com` | `password123` | Ad campaign tracking, budgets, CPC/CPL metrics, audience targeting |

---

## 3. Local Setup & Quickstart

### Prerequisites
- Node.js (v18.17+ or v20+)
- npm (v9+ or v10+)

### Step-by-Step Installation

1. **Clone or enter the project directory**:
   ```bash
   cd ArvianCRM
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

4. **Initialize Database Schema**:
   Push the schema to create the local SQLite database and generate the Prisma Client:
   ```bash
   npm run db:push
   ```

5. **Seed the Agency Database**:
   Populates realistic Arvian Marketing campaigns, 40 workflow leads, client accounts, calendar items, and attendance logs:
   ```bash
   npm run db:seed
   ```

6. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

7. **Run Automated Verification Tests**:
   Executes automated tests verifying Workflows A through I:
   ```bash
   npm test
   ```

---

## 4. Environment Variables Reference

See `.env.example`:

```env
# Database Connection (Default SQLite for local; PostgreSQL/Supabase for production)
DATABASE_URL="file:./dev.db"

# JWT Secret for Session Authentication (minimum 32 characters)
JWT_SECRET="arvian_super_secret_jwt_key_2026_marketing_crm_secure"

# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Agency Defaults
DEFAULT_AGENCY_NAME="Arvian Marketing"
DEFAULT_TIMEZONE="Asia/Kolkata"
DEFAULT_CURRENCY="INR"

# Meta Marketing API (Optional - Manual entry fallback is active by default)
META_APP_ID=""
META_APP_SECRET=""
META_ACCESS_TOKEN=""

# WhatsApp Business Cloud API (Optional - Manual click-to-chat active by default)
WHATSAPP_PHONE_NUMBER_ID=""
WHATSAPP_ACCESS_TOKEN=""

# Transactional Email SMTP (Optional - In-app notification center is active by default)
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
```

---

## 5. Production PostgreSQL & Supabase Deployment

### Using Supabase:
1. Create a project at [supabase.com](https://supabase.com).
2. Copy your PostgreSQL Connection String (Transaction Pooler or Direct) from **Project Settings > Database**.
3. In `prisma/schema.prisma`, update the datasource:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. Update `DATABASE_URL` in your `.env` or production environment variables.
5. Apply the migration and Row-Level Security policies:
   - Run `npx prisma db push` OR
   - Run the provided SQL migration file `prisma/supabase_schema.sql` in the Supabase SQL Editor.
6. Run `npm run db:seed` to seed the initial accounts.

---

## 6. Modules & Implemented Features

### Module 1: Lead Management CRM (`/leads`)
- Complete lead profiles: Contact Name, Phone, Email, Company, Industry, City, Website, Instagram, Source, Priority, Services Multi-Select, Marketing Budget.
- Lead Qualification Section: Previous Meta Ads experience (Yes/No/Unknown), previous daily/monthly ad budgets, campaign results, customer requirements, objections.
- Views: **Table View**, **Card View**, and **Kanban Pipeline Board** (`New`, `Contacted`, `Interested`, `Qualified`, `Follow-up Required`, `Won`, `Lost`).
- Pre-submission **Duplicate Detection** engine checking normalized phone digits (`slice(-10)`) and email with confirmation dialog.
- Lead detail drawer with complete activity history log.

### Module 2: Follow-up Management & Reminders (`/follow-ups`)
- Scheduled follow-ups stored with exact date & time in `Asia/Kolkata` IST.
- Multi-attempt workflow tracking (#1, #2, #3, #4+).
- Configurable reminder intervals (30 min, 15 min, 5 min, at scheduled time).
- One-click **Call** (`tel:`) and **WhatsApp** direct chat integration with pre-filled greeting message.
- Separate queues for **Today's Calls**, **Upcoming**, **Overdue**, and **Completed**.
- Server-side scheduled reminder checker endpoint (`/api/reminders/check`) that creates in-app notifications.

### Module 3: Guided Import / Export Center (`/import-export`)
- 4-Step Guided Import Wizard:
  1. Upload CSV or paste raw text (with "Load Sample Data" helper).
  2. Column mapping and duplicate detection against existing database records.
  3. Pre-import validation report showing valid, duplicate, and invalid rows.
  4. Batch commit with summary report and audit logging.
- Instant CSV export for Leads, Clients, and Invoices with permission verification.

### Module 4: Internal Meta Ads Campaign Tracker (`/campaigns`)
- Agency's own lead generation ad sets, creatives, headlines, copy, and landing page URLs.
- Mathematical metric safety: Handles zero impressions, zero clicks, and zero spend by returning `"N/A"` instead of `Infinity` or `NaN`.
- **Daily Lead Distribution Matrix (Workflow B Verification)**:
  - Exact cross-tabulation table of Employees (rows) x Campaigns (columns).
  - Verifies 4 sales telecallers handling 10 campaign-attributed leads each (40 total leads).
  - Preserves source campaign attribution independently of employee re-assignment.

### Module 5 & 6: Client Management & Dedicated Workspaces (`/clients`, `/clients/[id]`)
- One-click conversion from won lead to paying client, preserving lead ID and sales history.
- Financial separation: Distinct fields for **Monthly Agency Service Retainer Fee** vs **Client Ad Spend Budget**.
- Dedicated client workspaces featuring:
  - **Meta Ads Creative Tracker**: Creative statuses (`Brief Pending`, `In Progress`, `Internal Review`, `Client Approval Pending`, `Approved`, `Revision Required`), version numbering, and revision notes.
  - **Instagram Content Calendar**: Post types (`Reel`, `Carousel`, `Static Post`, `Story`), captions, hashtags, and approval advances.
  - **Client Retainer Projects & Deliverables**.
  - **Invoices & Billing History**.

### Module 7: Instagram & Social Media Calendar (`/content-calendar`)
- Monthly visual publication calendar.
- Filter by client account, platform (`Instagram`, `Facebook`, `LinkedIn`), and post status.
- Schedule new posts with captions, hooks, and hashtags.

### Module 8: Employee Directory (`/employees`)
- Staff directory with employee IDs (`ARV-EMP-101`), departments, designations, and contact info.
- Role-specific performance metrics (Telecaller leads/calls, Designer tasks, SMM posts).
- **Strict Salary Privacy**: Salary records are strictly excluded from general employee APIs and payloads.

### Module 9 & 10: Projects & Task Management (`/projects`)
- Client deliverables and internal marketing sprints.
- Kanban task board with checklist items (toggle done/undone), completion percentage (`0%` to `100%`), and priority badges.
- "Generate Monthly Sprint" template generator for recurring client packages without overwriting history.

### Module 11: Finance & Invoices (`/finance`)
- Client invoices with amount, received, outstanding, due date, and payment status (`PAID`, `PENDING`, `OVERDUE`).
- Agency operating expenses categorized by Salaries, Coworking, Advertising, Software Subscriptions, and Utilities.
- Financial clarity: Distinguishes invoiced revenue from realized bank receipts, showing net operating profit.
- Strictly restricted to Agency Super Admin (403 Forbidden for other roles).

### Module 12: Payroll & Salary Privacy (`/payroll`)
- Access-controlled payroll view strictly guarded for Super Admin.
- Returns `403 Forbidden` and renders an access-denied security banner if accessed by non-admin roles.
- Tracks base salary, allowances, deductions, net pay, and payroll period.

### Module 13: Centralized Notification Center (Header)
- In-app notification bell with live unread badge and dropdown.
- Scheduled follow-up alerts, task assignments, and approval updates.
- Server-side background scan runner triggered automatically or via cron.

### Module 14: Global Search Dialog (`⌘K` / `Ctrl+K`)
- Instant search across Leads, Clients, Campaigns, Tasks, and Employees.
- Direct jump navigation to matching records.

### Module 15: Agency Analytics & Reports (`/reports`)
- Visual lead conversion funnel (Total Leads -> Contacted -> Qualified -> Proposals -> Converted).
- Campaign spend vs leads, average CPL, and client retention by service.

### Module 16: Admin Settings & Integrations (`/settings`)
- Agency profile, timezone (`Asia/Kolkata`), currency (`INR`).
- Truthful status cards for Meta Marketing API, WhatsApp Business API, and SMTP Email.
- Real administrative audit logs viewer.
- Safe **"Reset Demo Dataset"** button to restore standard evaluation data.

---

## 7. Automated Acceptance Criteria Tests (Section 27)

To execute the automated test suite, run:
```bash
npm test
```

### Verified Workflows:
1. **Workflow A (Lead Management)**: Admin creates lead -> Telecaller assigned -> Telecaller qualifies Meta Ads exp & daily budget -> Follow-up #1 scheduled -> Outcome logged -> Follow-up #2 scheduled. *(PASS)*
2. **Workflow B (Four-Employee Lead Reporting)**: 4 telecallers verified -> Exactly 10 leads assigned per telecaller from internal campaigns -> 40 total leads confirmed -> Campaign attribution preserved independently of employee assignment. *(PASS)*
3. **Workflow C (Client Onboarding)**: Lead converted to client -> Data preserved -> Services selected -> Initial onboarding project and tasks generated. *(PASS)*
4. **Workflow D (Social Media Calendar)**: Post created -> Client approval requested -> Revision recorded -> Approved & scheduled. *(PASS)*
5. **Workflow E (Campaign Metrics & Zero-Division Safety)**: CPL, CPC, CTR, and ROAS calculations verified -> Zero-denominators return `"N/A"` instead of `Infinity`. *(PASS)*
6. **Workflow F & H (Permissions & Salary Privacy)**: Super Admin accesses salaries -> General employee query strictly omits salary fields -> Non-admin receives `403 Forbidden`. *(PASS)*
7. **Workflow G (Import & Duplicate Detection)**: Normalized phone and email digits correctly match duplicates and strip formatting. *(PASS)*
8. **Workflow I (Scheduled Reminders & Notifications)**: Due follow-up generates persistent in-app notification for the assigned employee. *(PASS)*

---

## 8. Deployment Guide

### Deploying to Vercel
1. Push the code to your GitHub repository.
2. Import the project into [Vercel](https://vercel.com).
3. Set the Environment Variables:
   - `DATABASE_URL`: Your Supabase PostgreSQL Connection URI.
   - `JWT_SECRET`: A secure 32+ character random secret.
   - `NEXT_PUBLIC_APP_URL`: Your production domain.
4. Set Build Command: `prisma generate && next build`.
5. Deploy.

---

## 9. Known Limitations & Production Roadmap

1. **Meta Marketing API**: The system provides full manual tracking mode and campaign structure. Direct OAuth sync requires Meta Business App Review and token approval.
2. **WhatsApp Business Cloud API**: Telecallers currently use direct one-click WhatsApp web/desktop links (`wa.me`). Automated outbound webhook triggers can be connected once WhatsApp Cloud API credentials are provided.
3. **PDF Generator**: Native client-side printable tables and CSV exports are active; PDF layout export can be styled via `@react-pdf/renderer` or browser print styles.
