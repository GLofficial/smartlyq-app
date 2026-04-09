# SmartlyQ Unified React App

Unified React SPA replacing the PHP Bootstrap frontend. Live at `app.smartlyq.com/next/`.

## Stack

| Layer | Technology |
|---|---|
| Build | Vite 6 + SWC |
| Framework | React 19 + TypeScript 5.9 |
| UI | shadcn/ui (Radix + Tailwind v4) |
| Routing | React Router 7 |
| Server State | TanStack React Query 5 |
| Local State | Zustand 5 |
| Icons | Lucide React |
| Toasts | Sonner |
| Linting | Biome |

## Stats

| Metric | Count |
|---|---|
| Source files | **143** |
| Page components | **87** |
| API hook files | **24** |
| Routes | **~85** |
| PHP controllers | **30** (4,717 lines) |
| API endpoints | **100** |

All PHP files under 500 lines. All React files under 300 lines. Zero dead code. Zero placeholders.

---

## Feature Status — All Wired to Real APIs

### CREATE Section (12 pages)
| Feature | Backend | Edit? |
|---|---|---|
| AI Captain | Embedded iframe | — |
| Templates | PHP API | View |
| Image Generator | OpenAI DALL-E | Generate + Gallery |
| Video Generator | Pollo.ai API | Generate + Gallery |
| Text to Audio | OpenAI TTS | Generate + Player |
| Audio to Text | Routes to audio | — |
| Content Rewriter | GPT-4o-mini | Rewrite |
| Article Generator | PHP API | View |
| Articles List | PHP API | View |
| Editor | GPT-4o-mini (4 actions) | Improve/Shorten/Expand/Fix |
| Chat | GPT-4o-mini conversations | Send + Receive |
| Data Analyst | OpenAI Assistants + Vector Stores | Create + Ask |

### PUBLISH Section (9 pages)
| Feature | Backend | Edit? |
|---|---|---|
| Create Post | PHP → posting engine (12 previews) | Create/Draft/Schedule |
| Content Calendar | PHP API | View |
| Manage Posts | PHP API | View + Filter |
| Post Queues | PHP API | View |
| Bulk Scheduler | Routes to queues | — |
| Inbox (DMs) | PHP API | View |
| Comments | PHP API | View + Reply |
| Labels | PHP API | Create/Edit/Delete |
| Social Accounts | OAuth popup | Connect/Disconnect |

### ANALYZE (4 pages), Integration Insights (6 pages), Ad Manager (1), Connect (4), Workspace (4), Other (8)
All wired to real PHP APIs with data flowing.

### Admin Panel (19 pages)
| Feature | Backend | Edit? |
|---|---|---|
| Dashboard | PHP API | View |
| Users | PHP API (search, paginated) | View |
| Plans | PHP API (full 110+ column matrix, 7 section tabs) | View |
| Pricing | PHP API (3 tabs: Globals editable, Models with inline edit, API Endpoints) | **Full Edit** |
| Subscriptions | PHP API | View |
| Transactions | PHP API | View |
| Templates | PHP API (131 templates) | View |
| Assistants | PHP API | View |
| Blogs | PHP API | View |
| CMS Pages | PHP API | View |
| AI Captain Traces | PHP API (paginated) | View |
| AI Captain KB | PHP API | View |
| AI Captain Skills | PHP API | View |
| Reports | PHP API | View |
| Support | PHP API | View |
| Whitelabel | PHP API | View |
| Monitoring | PHP API (DB size, jobs, PHP) | View |
| Billing Debug | PHP API (user lookup) | View |
| Settings | PHP API (12 tabs, proper field types) | **Full Edit** |

### Post Previews (12 platforms)
Facebook, Instagram, LinkedIn, Twitter/X, TikTok, YouTube, Pinterest, Threads, Bluesky, Reddit, Google Business, Telegram

---

## PHP Backend (in `smartlyq` repo)

### Controllers (30 files, 4,717 lines — all under 500)

```
smartlyq/app/Controller/
├── SpaBootstrapController.php       # 413 — bootstrap, workspaces
├── SpaSocialController.php          # 457 — social accounts, calendar, comments, inbox, analytics, createPost
├── SpaGeneralController.php         # 431 — integrations, billing, workspace, media, history, account
├── SpaChatbotController.php         # 392 — chatbot CRUD, analytics, templates, live agent, settings
├── SpaToolsController.php           # 291 — AI templates, images, articles, videos, ad manager, agency
├── SpaAdminController.php           # 284 — admin dashboard, users, plans, subscriptions, transactions
└── Spa/
    ├── SpaAuthTrait.php             #  89 — shared JWT auth
    ├── AuthController.php           # 211 — login, signup, reset, token refresh
    ├── DashboardController.php      #  82 — dashboard stats
    ├── SocialHubController.php      # 103 — social hub + posts listing
    ├── GenerateController.php       # 258 — image gen, rewrite, TTS, editor assist, chat create, comment reply
    ├── VideoGenController.php       # 111 — Pollo.ai video generation
    ├── AnalystController.php        # 171 — OpenAI Assistants + Vector Stores
    ├── ChatController.php           # 148 — conversations, messages, send, assistants
    ├── ContentController.php        #  75 — chat list, articles list, plans
    ├── IntegrationInsightsController.php # 102 — ads, google analytics, woocommerce
    ├── BillingController.php        # 102 — overview, payments, subscriptions, transactions
    ├── AdminSettingsController.php  # 136 — 12-tab settings
    ├── AdminPagesController.php     # 145 — pricing, blogs, pages, templates, assistants, support, reports
    ├── AdminAiCaptainController.php # 105 — traces, KB, skills
    ├── AdminMonitoringController.php#  89 — monitoring, billing debug
    ├── AdminPricingController.php   # 156 — globals (editable), models (344 with inline edit), endpoints
    ├── AdminPlansController.php     #  38 — full plan data (110+ columns)
    ├── LabelsController.php         #  71 — CRUD
    ├── UrlShortenerController.php   #  65 — list + create
    ├── ReportsController.php        #  63 — overview + scheduled
    ├── QueuesController.php         #  33
    ├── DeveloperController.php      #  33
    ├── BrandsController.php         #  32
    └── BusinessesController.php     #  31
```

### Routes: `Spa.php` — 100 endpoints
### Nginx: `default.conf` (modified), `smartlyq-react.conf` (cutover)
### Scripts: `cutover-react.sh`, `rollback-react.sh`
### Modified: `Controller.php` (+5 lines), `Api.php` (+1 line)

---

## React File Tree (143 files)

```
src/
├── main.tsx, app.tsx, routes.tsx, index.css
├── api/                   24 files (one per domain)
│   admin.ts, admin-ai-captain.ts, admin-monitoring.ts, admin-pages.ts,
│   admin-pricing.ts, admin-settings.ts, analyst.ts, brands.ts, businesses.ts,
│   chat.ts, chatbot.ts, content.ts, dashboard.ts, developer.ts, general.ts,
│   generate.ts, integration-insights.ts, labels.ts, queues.ts, reports.ts,
│   social.ts, tools.ts, url-shortener.ts, video-gen.ts
├── components/
│   ├── shared/   auth-guard, iframe-bridge
│   ├── shell/    header, sidebar, sidebar-nav-config, sidebar-section
│   └── ui/       button, card, input
├── layouts/      admin-layout, app-layout, auth-layout
├── lib/          api-client, cn, constants, query-client, types
├── providers/    app-providers, auth-provider, tenant-provider
├── stores/       auth-store (with credits), tenant-store, ui-store, workspace-store
└── pages/        87 components
    ├── admin/    19 pages + settings-field-config + admin-plans-config
    ├── ai/       9 pages (templates, generators, rewriter, editor, analyst, articles)
    ├── social/   12 pages + previews/ (12 platform previews)
    ├── chatbot/  6 pages
    ├── integrations/ 4 pages (hub, ads insights, google, woocommerce)
    ├── chat/     1 page (full conversation UI with send/receive)
    ├── auth/     3 pages
    └── [12 more] account, billing, plans, dashboard, history, media, workspace, etc.
```

---

## Architecture Notes

- `Route::post()` in PHP registers for BOTH GET and POST — use `/save` or `/edit` suffix for writes
- **NEVER guess DB schema** — always `DESCRIBE tablename` first (learned the hard way)
- Sidebar config: `sidebar-nav-config.ts` + collapsible `sidebar-section.tsx`
- Settings: `settings-field-config.ts`, Plans: `admin-plans-config.ts` — config-driven rendering
- `subscriptions.status` is INT (1=active), NOT VARCHAR — `status='active'` matches `status=0` in MySQL
- `workspaces` table has NO `slug` column
- `pricing` table (344 rows) has model input/output costs — NOT the `models` table
- All files under 500 lines, one component per file, one API file per domain
- OAuth uses popup window (user stays in React app)
- Captain/Video Editor/Presentations embedded as iframes
- Cutover NOT automated — user decides when
