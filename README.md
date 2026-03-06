# Bilfora — Invoicing SaaS for the Saudi Market

A full-stack invoicing platform built for Arabic-speaking freelancers and SMBs in Saudi Arabia. Supports multi-type invoice generation, client management, payment tracking, and business analytics — with ZATCA e-invoicing compliance groundwork in place.

> **Status:** Beta MVP — core invoicing flow is production-functional. See [Roadmap](#roadmap) for planned features.

---

## Features

| Area | Status |
|---|---|
| Invoice creation (standard, simplified, credit note) | Done |
| Client management (CRUD, filtering, bulk actions) | Done |
| Payment tracking (manual recording, auto status update) | Done |
| Dashboard with revenue charts and overdue alerts | Done |
| Analytics with KPI cards and Excel export | Done |
| PDF invoice generation (Puppeteer + HTML template) | Done |
| Invoice settings (VAT, CR number, IBAN, brand color) | Done |
| Multi-tenant data isolation via Supabase RLS | Done |
| Arabic RTL UI throughout | Done |
| Email notifications | Planned |
| Online payment gateway (Stripe / Moyasar) | Planned |
| ZATCA compliance & QR code signing | Planned |

---

## Tech Stack

**Frontend**
- [Next.js 15](https://nextjs.org/) (App Router, Server Actions)
- [React 19](https://react.dev/) + TypeScript
- [TailwindCSS v4](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/)
- [Framer Motion](https://www.framer.com/motion/) for animations
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) for validation
- [TanStack Query](https://tanstack.com/query) for data fetching
- [Recharts](https://recharts.org/) for analytics charts

**Backend**
- [Supabase](https://supabase.com/) — PostgreSQL, Auth, RLS, Edge Functions
- Server Actions for mutations
- [Puppeteer Core](https://pptr.dev/) + [@sparticuz/chromium](https://github.com/Sparticuz/chromium) for PDF generation
- [Upstash Redis](https://upstash.com/) for rate limiting

**Infra / Monitoring**
- [Vercel](https://vercel.com/) for deployment
- [Sentry](https://sentry.io/) for error tracking
- [Vercel Analytics](https://vercel.com/analytics)

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Next.js App                        │
│                                                         │
│  ┌──────────────┐   ┌──────────────┐   ┌────────────┐  │
│  │  Landing Page│   │  Dashboard   │   │  API Routes│  │
│  │  (Arabic RTL)│   │  (App Router)│   │  /pdf      │  │
│  └──────────────┘   └──────┬───────┘   └─────┬──────┘  │
│                            │                 │          │
│                    ┌───────▼─────────────────▼──────┐  │
│                    │       Server Actions            │  │
│                    │  invoices · payments · clients  │  │
│                    └───────────────┬────────────────┘  │
└────────────────────────────────────┼────────────────────┘
                                     │
                    ┌────────────────▼────────────────┐
                    │           Supabase               │
                    │                                  │
                    │  PostgreSQL  │  Auth  │  RLS     │
                    │  ─────────────────────────────   │
                    │  invoices    │  clients          │
                    │  invoice_items│ payments         │
                    │  invoice_settings│ profiles      │
                    └─────────────────────────────────┘
```

---

## Project Structure

```
src/
├── app/
│   ├── dashboard/          # All authenticated pages
│   │   ├── page.tsx        # Dashboard home (charts, stats)
│   │   ├── invoices/       # Invoice list + detail
│   │   ├── clients/        # Client management
│   │   ├── analytics/      # Revenue analytics + Excel export
│   │   └── settings/       # Invoice settings, notifications
│   └── page.tsx            # Landing page
├── actions/                # Server actions (invoices, payments, clients)
├── components/
│   ├── InvoiceCreationModal.tsx   # Main invoice creation flow
│   ├── invoice/            # Invoice detail components
│   ├── dashboard/          # Dashboard UI
│   ├── analytics/          # Charts and KPI cards
│   ├── payments/           # Payment recording modal
│   └── pdf/                # PDF renderers
├── hooks/                  # useDashboardData, useClients, etc.
├── services/               # invoice-service (data fetching logic)
├── lib/
│   ├── schemas/            # Zod validation schemas
│   └── pdf/templates/      # HTML invoice template for PDF
├── config/
│   └── features.ts         # Feature flags (IS_ZATCA_ENABLED, etc.)
└── types/                  # TypeScript definitions
supabase/
├── migrations/             # 30+ ordered SQL migrations
└── functions/              # Edge functions (feedback, etc.)
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com/) project
- (Optional) [Upstash Redis](https://upstash.com/) for rate limiting

### 1. Clone & install

```bash
git clone https://github.com/your-username/bilfora.git
cd bilfora
npm install
```

### 2. Configure environment variables

Create a `.env.local` file at the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional — rate limiting
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Optional — error monitoring
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
```

### 3. Apply database migrations

Using the Supabase CLI:

```bash
npx supabase db push
```

Or run the files in `supabase/migrations/` in order via the Supabase SQL editor.

### 4. Run locally

```bash
npm run dev
```

Visit `http://localhost:3000`.

---

## Key Design Decisions

**Multi-tenant security via RLS**
Every table has Row Level Security policies that scope all reads/writes to `auth.uid()`. Server actions additionally enforce ownership with explicit `user_id` filters as a defense-in-depth measure.

**Server Actions over API routes**
Mutations use Next.js Server Actions for type safety end-to-end. The only API routes are for PDF generation, which requires streaming a binary response.

**PDF generation strategy**
Invoices are rendered as HTML with the same CSS used in the web UI, then converted to PDF via Puppeteer + Chromium. This ensures pixel-accurate output without maintaining a separate template library.

**Feature flags**
`src/config/features.ts` controls in-development features (e.g. `IS_ZATCA_ENABLED`). This keeps the codebase clean during beta without breaking existing flows.

---

## Roadmap

**v0.2 — Notifications**
- [ ] Integrate Resend for transactional email
- [ ] Invoice-sent confirmation emails
- [ ] Overdue payment reminders

**v0.3 — Online Payments**
- [ ] Stripe or Moyasar payment links on invoices
- [ ] Webhook handler for auto-status updates
- [ ] Payment receipt generation

**v0.4 — ZATCA Compliance**
- [ ] Enable `IS_ZATCA_ENABLED` flag
- [ ] Cryptographic QR code signing (TLV encoding already implemented)
- [ ] B2B / B2C invoice type enforcement
- [ ] Government reporting integration

**v1.0 — Production**
- [ ] SMS notifications (Twilio or local provider)
- [ ] Customer-facing invoice payment portal
- [ ] Subscription billing for SaaS tiers

---

## License

MIT
