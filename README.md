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
| Source files | **141** |
| Page components | **87** |
| API hook files | **23** |
| Routes | **~80** |
| PHP controllers | **27** (4,404 lines) |
| API endpoints | **93** |

All PHP files under 500 lines. All React files under 300 lines. Zero dead code. Zero placeholders.

---

## Feature Status — All Wired to Real APIs

### CREATE Section
| Feature | Backend | Status |
|---|---|---|
| AI Captain | Embedded iframe (separate app) | LIVE |
| Templates | PHP API → DB | LIVE |
| Image Generator | OpenAI DALL-E API | LIVE |
| Video Generator | Pollo.ai API | LIVE |
| Text to Audio | OpenAI TTS API | LIVE |
| Audio to Text | Routes to audio page | LIVE |
| Content Rewriter | GPT-4o-mini | LIVE |
| Article Generator | PHP API → DB | LIVE |
| Articles List | PHP API → DB | LIVE |
| Editor | GPT-4o-mini (improve/shorten/expand/fix) | LIVE |
| Chat | GPT-4o-mini conversations | LIVE |
| Data Analyst | OpenAI Assistants + Vector Stores | LIVE |

### PUBLISH Section
| Feature | Backend | Status |
|---|---|---|
| Create Post | PHP → social posting engine (12 platform previews) | LIVE |
| Content Calendar | PHP API → DB | LIVE |
| Manage Posts | PHP API with status filters + pagination | LIVE |
| Post Queues | PHP API → DB | LIVE |
| Bulk Scheduler | Routes to queues | LIVE |
| Inbox (DMs) | PHP API → DB | LIVE |
| Comments | PHP API + inline reply (saves to DB) | LIVE |
| Labels | PHP API full CRUD (create/edit/delete) | LIVE |
| Social Accounts | OAuth popup flow | LIVE |

### ANALYZE Section
| Feature | Backend | Status |
|---|---|---|
| Analytics | PHP API with period selector | LIVE |
| Reports | PHP API with platform breakdown | LIVE |
| Custom Reports | PHP API | LIVE |
| Scheduled Reports | PHP API | LIVE |

### Integration Insights
| Feature | Backend | Status |
|---|---|---|
| Facebook Ads | PHP API → ad accounts | LIVE |
| Google Ads | PHP API → ad accounts | LIVE |
| TikTok Ads | PHP API → ad accounts | LIVE |
| LinkedIn Ads | PHP API → ad accounts | LIVE |
| Google Analytics | PHP API → properties | LIVE |
| WooCommerce | PHP API → stores | LIVE |

### CONNECT Section
| Feature | Backend | Status |
|---|---|---|
| Integrations Hub | OAuth popup (user stays in app) | LIVE |
| Chatbot (6 pages) | PHP API → training via Flask | LIVE |
| URL Shortener | PHP API full CRUD | LIVE |
| Developer (API keys) | PHP API | LIVE |

### Other
| Feature | Backend | Status |
|---|---|---|
| Dashboard | PHP API (credits, stats, recent) | LIVE |
| Billing | PHP API (plan, transactions) | LIVE |
| Account | PHP API (profile save, password change) | LIVE |
| Workspace + Members | PHP API | LIVE |
| Media Library | PHP API with type filter | LIVE |
| Plans (pricing grid) | PHP API → billing redirect | LIVE |
| Brands | PHP API | LIVE |
| Business Groups | PHP API | LIVE |
| History | PHP API with pagination | LIVE |
| Agency | PHP API | LIVE |
| Whitelabel | PHP API | LIVE |
| Video Editor | Embedded iframe (separate app) | LIVE |
| Presentations | Embedded iframe (separate app) | LIVE |

### Admin Panel (19 pages)
| Feature | Backend | Status |
|---|---|---|
| Dashboard | PHP API (user/post/revenue stats) | LIVE |
| Users | PHP API (search, paginated) | LIVE |
| Plans | PHP API | LIVE |
| Pricing | PHP API (API pricing table) | LIVE |
| Subscriptions | PHP API | LIVE |
| Transactions | PHP API | LIVE |
| Templates | PHP API | LIVE |
| Assistants | PHP API | LIVE |
| Blogs | PHP API | LIVE |
| CMS Pages | PHP API | LIVE |
| AI Captain Traces | PHP API (paginated) | LIVE |
| AI Captain KB | PHP API | LIVE |
| AI Captain Skills | PHP API | LIVE |
| Reports | PHP API | LIVE |
| Support | PHP API | LIVE |
| Whitelabel | PHP API | LIVE |
| Monitoring | PHP API (DB size, jobs, PHP version) | LIVE |
| Billing Debug | PHP API (user lookup) | LIVE |
| Settings | PHP API (12 tabs, proper field types) | LIVE |

### Post Previews (12 platforms)
Facebook, Instagram, LinkedIn, Twitter/X, TikTok, YouTube, Pinterest, Threads, Bluesky, Reddit, Google Business, Telegram

---

## PHP Backend (in `smartlyq` repo)

### Controllers (27 files, 4,404 lines — all under 500)

```
smartlyq/app/Controller/
├── SpaBootstrapController.php       # 395 lines — bootstrap, workspaces
├── SpaSocialController.php          # 457 lines — social accounts, calendar, comments, inbox, analytics, createPost
├── SpaGeneralController.php         # 431 lines — integrations, billing, workspace, media, history, account
├── SpaChatbotController.php         # 392 lines — chatbot CRUD, analytics, templates, live agent, settings
├── SpaToolsController.php           # 291 lines — AI templates, images, articles, videos, ad manager, agency
├── SpaAdminController.php           # 284 lines — admin dashboard, users, plans, subscriptions, transactions
└── Spa/
    ├── SpaAuthTrait.php             #  89 lines — shared JWT auth (used by all Spa/ controllers)
    ├── AuthController.php           # 207 lines — login, signup, reset, token refresh
    ├── DashboardController.php      #  82 lines — dashboard stats
    ├── SocialHubController.php      # 103 lines — social hub + posts listing
    ├── GenerateController.php       # 258 lines — image gen, rewrite, TTS, editor assist, chat create, comment reply
    ├── VideoGenController.php       # 111 lines — Pollo.ai video generation
    ├── AnalystController.php        # 171 lines — OpenAI Assistants + Vector Stores
    ├── ChatController.php           # 148 lines — conversations, messages, send, assistants
    ├── ContentController.php        #  75 lines — chat list, articles list, plans
    ├── IntegrationInsightsController.php # 102 lines — ads, google analytics, woocommerce
    ├── AdminSettingsController.php  # 136 lines — 12-tab settings
    ├── AdminPagesController.php     # 150 lines — pricing, blogs, pages, templates, assistants, support, reports
    ├── AdminAiCaptainController.php # 105 lines — traces, KB, skills
    ├── AdminMonitoringController.php#  89 lines — monitoring, billing debug
    ├── LabelsController.php         #  71 lines — CRUD
    ├── UrlShortenerController.php   #  65 lines — list + create
    ├── ReportsController.php        #  63 lines — overview + scheduled
    ├── QueuesController.php         #  33 lines
    ├── DeveloperController.php      #  33 lines
    ├── BrandsController.php         #  32 lines
    └── BusinessesController.php     #  31 lines
```

### Routes + Config
- `app/Route/Spa.php` — 93 endpoints
- `docker/nginx/default.conf` — /next/ location block
- `docker/nginx/smartlyq-react.conf` — production cutover config
- `scripts/cutover-react.sh` + `rollback-react.sh`

### Modified (2 files, minimal)
- `Controller.php` — `wantsJson()` (5 lines)
- `Route/Api.php` — `require Spa.php` (1 line)

---

## React File Tree (141 files)

```
src/
├── main.tsx, app.tsx, routes.tsx, index.css
├── api/                   23 files (one per domain)
│   admin.ts, admin-ai-captain.ts, admin-monitoring.ts, admin-pages.ts,
│   admin-settings.ts, analyst.ts, brands.ts, businesses.ts, chat.ts,
│   chatbot.ts, content.ts, dashboard.ts, developer.ts, general.ts,
│   generate.ts, integration-insights.ts, labels.ts, queues.ts,
│   reports.ts, social.ts, tools.ts, url-shortener.ts, video-gen.ts
├── components/
│   ├── shared/            auth-guard, iframe-bridge
│   ├── shell/             header, sidebar, sidebar-nav-config, sidebar-section
│   └── ui/                button, card, input
├── layouts/               admin-layout, app-layout, auth-layout
├── lib/                   api-client, cn, constants, query-client, types
├── providers/             app-providers, auth-provider, tenant-provider
├── stores/                auth-store, tenant-store, ui-store, workspace-store
└── pages/                 87 components
    ├── admin/             19 pages + settings-field-config
    ├── ai/                9 pages (templates, generators, rewriter, editor, analyst, articles)
    ├── social/            12 pages + previews/ (12 platform previews)
    ├── chatbot/           6 pages
    ├── integrations/      4 pages (hub, ads insights, google, woocommerce)
    ├── chat/              1 page (full conversation UI)
    ├── auth/              3 pages
    └── [12 more dirs]     account, billing, plans, dashboard, history, media, workspace, etc.
```

---

## Architecture Notes

- `Route::post()` in PHP registers for BOTH GET and POST — use `/save` suffix for writes
- Sidebar: `sidebar-nav-config.ts` + collapsible `sidebar-section.tsx`
- Settings: `settings-field-config.ts` defines field type/label/options per tab
- All files under 500 lines, one component per file, one API file per domain
- OAuth uses popup window (user stays in React app)
- Captain/Video Editor/Presentations embedded as iframes (separate apps)
- Cutover NOT automated — user decides when to switch from `/next/` to `/`
