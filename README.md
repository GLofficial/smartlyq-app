awa# SmartlyQ Unified React App

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
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Toasts | Sonner |
| Linting | Biome |

## Progress Tracker

### Pages Built: 55 native React pages

#### User-Facing (38 pages)
| Section | Pages | Status |
|---|---|---|
| Auth | Login, Signup, Reset | Working |
| Dashboard | Main dashboard with stats | Working |
| Social Media | Dashboard, Create Post (12 platform previews), Manage Posts, Calendar, Comments, Inbox, Analytics, Accounts | Working |
| Chatbot | List, Create (4-step wizard), Analytics, Templates, Live Agent, Settings | Working |
| AI Tools | Templates, Image Generator, Video Generator, Audio, Articles | Working |
| Ad Manager | Dashboard | Working |
| Integrations | Hub with OAuth popup flow | Working |
| Billing | Overview with plan/credits/transactions | Working |
| Workspace | Overview + Members | Working |
| Media Library | Grid with type filter + pagination | Working |
| Account | Profile save + Password change | Working |
| History | Paginated document list | Working |
| Agency | Tenant list | Working |
| Whitelabel | Tenant management | Working |
| Labels | CRUD with color picker | Working |
| Post Queues | List | Working |
| Reports | Overview + Platform breakdown | Working |
| Scheduled Reports | List | Working |
| URL Shortener | Create + List with click stats | Working |
| Brands | Grid with logos | Working |
| Business Groups | List | Working |
| Developer | API keys + docs | Working |

#### Admin Panel (17 pages)
| Page | Status |
|---|---|
| Dashboard | Working |
| Users (searchable, paginated) | Working |
| Plans | Working |
| Pricing (API pricing table) | Working |
| Subscriptions | Working |
| Transactions | Working |
| Templates | Working |
| Assistants | Working |
| Blogs | Working |
| CMS Pages | Working |
| AI Captain Traces (paginated) | Working |
| AI Captain Knowledge Base | Working |
| AI Captain Skills | Working |
| Reports (stats) | Working |
| Support (tickets) | Working |
| Whitelabel (tenants) | Working |
| Monitoring (system health) | Working |
| Billing Debug (user lookup) | Working |
| Settings (12 tabs, proper field types) | Working |

### PHP Backend

#### Controllers (app/Controller/)
| File | Methods | Purpose |
|---|---|---|
| SpaBootstrapController.php | bootstrap, login, signup, reset, refreshToken, workspaces, workspaceSwitch, dashboard, socialHub, socialPosts | Core auth + data |
| SpaSocialController.php | accounts, calendar, comments, inbox, analytics, createPost | Social media |
| SpaChatbotController.php | list, analytics, templates, liveAgent, createData, save, getSettings, saveSettings | Chatbot |
| SpaGeneralController.php | integrations, billing, workspace, media, history, account, accountUpdate, accountPassword, deletePost, deleteChatbot | General pages |
| SpaToolsController.php | templates, images, articles, videos, adManager, agency | AI tools |
| SpaAdminController.php | dashboard, users, plans, subscriptions, transactions, whitelabel | Admin core |
| Spa/AdminSettingsController.php | get, save, tabs | Admin settings |
| Spa/AdminPagesController.php | pricing, blogs, pages, templates, assistants, support, reports | Admin content |
| Spa/AdminAiCaptainController.php | traces, knowledgeBase, skills | Admin AI Captain |
| Spa/AdminMonitoringController.php | monitoring, billingDebug | Admin system |
| Spa/LabelsController.php | list, save, delete | Labels CRUD |
| Spa/QueuesController.php | list | Post queues |
| Spa/ReportsController.php | overview, scheduled | Reports |
| Spa/UrlShortenerController.php | list, create | URL shortener |
| Spa/BrandsController.php | list | Brands |
| Spa/BusinessesController.php | list | Business groups |
| Spa/DeveloperController.php | list | Developer API keys |
| Spa/SpaAuthTrait.php | (trait) | Shared JWT auth |

#### Total: ~60 API endpoints

### Known Issues / TODO
- Create Post: needs rich text editor (TipTap), media upload, Canva integration
- Calendar: needs week/day/list views, drag-drop rescheduling
- Captain/Video Editor/Presentations: embedded as iframes (separate apps)
- Design quality: functional but needs polish to match PHP app quality
- Some admin pages are read-only (no edit/create/delete actions yet)

### Architecture Notes
- `Route::post()` in PHP registers for BOTH GET and POST — use different paths for save endpoints
- Sidebar config in `sidebar-nav-config.ts`, sections toggle in `sidebar-section.tsx`
- Settings field definitions in `settings-field-config.ts` (type, label, options per tab)
- All files under 500 lines
- One component per file, one API file per domain

## PHP Backend Files (in `smartlyq` repo)

All SPA-related PHP files created/modified for the React frontend.
These live in the main `smartlyq` repo, NOT in `smartlyq-app`.

### New Files (20 files, 3,720 lines total)

```
smartlyq/
├── app/
│   ├── Controller/
│   │   ├── SpaBootstrapController.php       # 846 lines — bootstrap, login, signup, reset, token, workspaces, dashboard, social hub/posts
│   │   ├── SpaSocialController.php          # 457 lines — accounts, calendar, comments, inbox, analytics, createPost (triggers publish engine)
│   │   ├── SpaGeneralController.php         # 431 lines — integrations, billing, workspace, media, history, account, accountUpdate, password, deletePost, deleteChatbot
│   │   ├── SpaChatbotController.php         # 392 lines — list, analytics, templates, liveAgent, createData, save (triggers training), settings
│   │   ├── SpaToolsController.php           # 291 lines — templates, images, articles, videos, adManager, agency
│   │   ├── SpaAdminController.php           # 284 lines — dashboard, users, plans, subscriptions, transactions, whitelabel
│   │   └── Spa/                             # Focused controllers (use SpaAuthTrait)
│   │       ├── SpaAuthTrait.php             #  89 lines — shared JWT auth, CORS, response helpers
│   │       ├── AdminSettingsController.php  # 136 lines — settings get/save/tabs (12 tabs with field definitions)
│   │       ├── AdminPagesController.php     # 150 lines — pricing, blogs, pages, templates, assistants, support, reports
│   │       ├── AdminAiCaptainController.php # 105 lines — traces, knowledgeBase, skills
│   │       ├── AdminMonitoringController.php#  89 lines — monitoring, billingDebug
│   │       ├── LabelsController.php         #  71 lines — list, save, delete
│   │       ├── UrlShortenerController.php   #  65 lines — list, create
│   │       ├── ReportsController.php        #  63 lines — overview, scheduled
│   │       ├── QueuesController.php         #  33 lines — list
│   │       ├── DeveloperController.php      #  33 lines — list
│   │       ├── BrandsController.php         #  32 lines — list
│   │       └── BusinessesController.php     #  31 lines — list
│   └── Route/
│       └── Spa.php                          # 122 lines — all /api/spa/* route definitions (~60 endpoints)
│
└── docker/
    └── nginx/
        ├── default.conf                     # Modified: added /next/ location block for React SPA
        └── smartlyq-react.conf              # Production Nginx config (for cutover)
```

### Modified Files (2 files)

```
smartlyq/
├── app/
│   ├── Controller/
│   │   └── Controller.php                   # Added wantsJson() + JSON mode for redirect() (5 lines)
│   └── Route/
│       └── Api.php                          # Added: require_once Spa.php (1 line)
```

### Cutover Scripts

```
smartlyq/
└── scripts/
    ├── cutover-react.sh                     # Switch Nginx from PHP to React as default
    └── rollback-react.sh                    # Revert to PHP frontend
```

## Complete File Tree (113 source files)

```
src/
├── main.tsx                              # Entry point
├── app.tsx                               # Root component
├── routes.tsx                            # All route definitions
├── index.css                             # Global styles + CSS variables
├── vite-env.d.ts
│
├── api/                                  # TanStack Query hooks (one per domain)
│   ├── admin.ts                          # Admin dashboard
│   ├── admin-ai-captain.ts              # AI Captain traces/kb/skills
│   ├── admin-monitoring.ts              # Monitoring + billing debug
│   ├── admin-pages.ts                   # Pricing/blogs/pages/templates/assistants/support/reports
│   ├── admin-settings.ts               # Settings read/write
│   ├── brands.ts                        # Brand voices
│   ├── businesses.ts                    # Business groups
│   ├── chatbot.ts                       # Chatbot CRUD + analytics
│   ├── dashboard.ts                     # Dashboard stats
│   ├── developer.ts                     # API keys
│   ├── general.ts                       # Integrations/billing/workspace/media/history/account
│   ├── labels.ts                        # Post labels CRUD
│   ├── queues.ts                        # Post queues
│   ├── reports.ts                       # Reports + scheduled reports
│   ├── social.ts                        # Social hub/posts/calendar/comments/inbox/analytics
│   ├── tools.ts                         # Templates/images/articles/videos/ad-manager/agency
│   └── url-shortener.ts                 # URL shortener CRUD
│
├── components/
│   ├── shared/
│   │   ├── auth-guard.tsx               # Route protection (redirect to login)
│   │   └── iframe-bridge.tsx            # Legacy PHP page embed (chatbot edit only)
│   ├── shell/
│   │   ├── header.tsx                   # Top bar: credits, plan, theme, user
│   │   ├── sidebar.tsx                  # Main sidebar with workspace switcher
│   │   ├── sidebar-nav-config.ts        # Navigation structure definition
│   │   └── sidebar-section.tsx          # Collapsible section component
│   └── ui/
│       ├── button.tsx                   # shadcn Button
│       ├── card.tsx                     # shadcn Card
│       └── input.tsx                    # shadcn Input
│
├── hooks/                               # (reserved for custom hooks)
│
├── layouts/
│   ├── admin-layout.tsx                 # Admin panel: sidebar + outlet
│   ├── app-layout.tsx                   # Main app: sidebar + header + outlet
│   └── auth-layout.tsx                  # Auth: centered card
│
├── lib/
│   ├── api-client.ts                    # Fetch wrapper with JWT + 401 refresh
│   ├── cn.ts                            # clsx + twMerge utility
│   ├── constants.ts                     # API paths, route paths, storage keys
│   ├── query-client.ts                  # TanStack Query config
│   └── types.ts                         # Shared TypeScript interfaces
│
├── pages/
│   ├── account/account-page.tsx         # Profile + password change
│   ├── ad-manager/ad-manager-page.tsx   # Campaign list with stats
│   ├── admin/                           # 19 admin pages
│   │   ├── admin-assistants-page.tsx
│   │   ├── admin-billing-debug-page.tsx
│   │   ├── admin-blogs-page.tsx
│   │   ├── admin-cms-pages-page.tsx
│   │   ├── admin-dashboard-page.tsx
│   │   ├── admin-kb-page.tsx
│   │   ├── admin-monitoring-page.tsx
│   │   ├── admin-plans-page.tsx
│   │   ├── admin-pricing-page.tsx
│   │   ├── admin-reports-page.tsx
│   │   ├── admin-settings-page.tsx
│   │   ├── admin-skills-page.tsx
│   │   ├── admin-subscriptions-page.tsx
│   │   ├── admin-support-page.tsx
│   │   ├── admin-templates-page.tsx
│   │   ├── admin-traces-page.tsx
│   │   ├── admin-transactions-page.tsx
│   │   ├── admin-users-page.tsx
│   │   ├── admin-whitelabel-page.tsx
│   │   └── settings-field-config.ts     # Field definitions per settings tab
│   ├── agency/agency-page.tsx
│   ├── ai/                              # AI tools (5 pages)
│   │   ├── article-generator-page.tsx
│   │   ├── audio-page.tsx
│   │   ├── image-generator-page.tsx
│   │   ├── templates-page.tsx
│   │   └── video-generator-page.tsx
│   ├── analyze/                         # Reports (2 pages)
│   │   ├── reports-page.tsx
│   │   └── scheduled-reports-page.tsx
│   ├── auth/                            # Auth (3 pages)
│   │   ├── login-page.tsx
│   │   ├── reset-page.tsx
│   │   └── signup-page.tsx
│   ├── billing/billing-page.tsx
│   ├── captain/captain-page.tsx         # AI Captain iframe embed
│   ├── chatbot/                         # Chatbot (6 pages)
│   │   ├── chatbot-analytics-page.tsx
│   │   ├── chatbot-create-page.tsx
│   │   ├── chatbot-list-page.tsx
│   │   ├── chatbot-settings-page.tsx
│   │   ├── chatbot-templates-page.tsx
│   │   └── live-agent-page.tsx
│   ├── connect/                         # Connect tools (2 pages)
│   │   ├── developer-page.tsx
│   │   └── url-shortener-page.tsx
│   ├── dashboard/dashboard-page.tsx
│   ├── history/history-page.tsx
│   ├── integrations/integrations-page.tsx
│   ├── media/media-library-page.tsx
│   ├── misc/not-found-page.tsx
│   ├── presentations/presentations-page.tsx
│   ├── social/                          # Social media (12+ pages)
│   │   ├── analytics-page.tsx
│   │   ├── calendar-page.tsx
│   │   ├── comments-page.tsx
│   │   ├── create-post-editor.tsx
│   │   ├── create-post-page.tsx
│   │   ├── inbox-page.tsx
│   │   ├── labels-page.tsx
│   │   ├── manage-posts-page.tsx
│   │   ├── platform-icon.tsx
│   │   ├── previews/                    # 12 platform live previews
│   │   │   ├── bluesky-preview.tsx
│   │   │   ├── facebook-preview.tsx
│   │   │   ├── google-business-preview.tsx
│   │   │   ├── instagram-preview.tsx
│   │   │   ├── linkedin-preview.tsx
│   │   │   ├── pinterest-preview.tsx
│   │   │   ├── preview-panel.tsx
│   │   │   ├── reddit-preview.tsx
│   │   │   ├── telegram-preview.tsx
│   │   │   ├── threads-preview.tsx
│   │   │   ├── tiktok-preview.tsx
│   │   │   ├── twitter-preview.tsx
│   │   │   ├── types.ts
│   │   │   └── youtube-preview.tsx
│   │   ├── queues-page.tsx
│   │   └── social-dashboard-page.tsx
│   ├── video-editor/video-editor-page.tsx
│   ├── whitelabel/whitelabel-page.tsx
│   └── workspace/
│       ├── brands-page.tsx
│       ├── businesses-page.tsx
│       └── workspace-page.tsx
│
├── providers/
│   ├── app-providers.tsx                # Compose all providers
│   ├── auth-provider.tsx                # JWT bootstrap on mount
│   └── tenant-provider.tsx              # CSS variable injection
│
└── stores/
    ├── auth-store.ts                    # JWT, user, plan
    ├── tenant-store.ts                  # White-label branding
    ├── ui-store.ts                      # Sidebar, theme
    └── workspace-store.ts               # Active workspace
```
