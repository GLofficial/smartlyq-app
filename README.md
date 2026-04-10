# SmartlyQ Unified React App

Unified React SPA replacing the PHP Bootstrap frontend. Live at `app.smartlyq.com/next/`.

## Stack

| Layer | Technology |
|---|---|
| Build | Vite 6 + SWC |
| Framework | React 19 + TypeScript 5.9 |
| UI | shadcn/ui (Radix + Tailwind v4) + TipTap (rich editor) |
| Routing | React Router 7 |
| Server State | TanStack React Query 5 |
| Local State | Zustand 5 |
| Charts | Recharts 2 |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Toasts | Sonner |
| Dates | date-fns + react-day-picker |
| Linting | Biome |

## Stats

| Metric | Count |
|---|---|
| PHP SPA controllers | **47+** |
| API endpoints | **~260** |
| React API hook files | **41+** |
| React pages | **96+** |
| Source files | **200+** |
| UI components | **18** |

All PHP files under 500 lines. All React files under 500 lines.

---

## API Endpoints — Complete

### CRM / Sales (NEW)
| Endpoints | Controller |
|---|---|
| stages: list (auto-seed), save (full replace in transaction) | `CrmController` |
| deals: list (paginated, filterable by stage), get (with comms + project), save, delete (cascade), share-token | `CrmController` |
| contacts: list (paginated, searchable, filterable by status), get (with linked deals), save, delete | `CrmController` |
| contact-deal: link, unlink (junction table) | `CrmController` |
| communications: add, delete (deal activity timeline) | `CrmController` |
| projects: list (paginated, with item counts), save, delete (cascade items) | `CrmController` |
| content-items: save, delete, quick status update | `CrmController` |
| tasks: list (paginated, filterable by status), save, delete, timer increment | `CrmController` |
| dashboard: aggregated KPIs (pipeline value, won revenue, by-stage breakdown, task stats, recent activity) | `CrmController` |
| public preview: GET by share token (no JWT), approve/revert content items | `CrmPublicController` |

### Billing & Subscriptions
| Endpoints | Controller |
|---|---|
| overview, payments, subscriptions, transactions, checkout (Stripe), cancel | `BillingController` |

### Admin
| Endpoints | Controller |
|---|---|
| credits adjust, status toggle, role change, plan assign, delete | `AdminUsersController` |
| get, save (100+ column whitelist), soft delete, duplicate | `AdminPlansController` |
| subscription cancel, transaction refund, template toggle, whitelabel license toggle, assistant delete | `AdminActionsController` |
| blogs/pages CRUD (rich editor), image upload | `AdminPagesController` |
| settings (12 tabs), pricing (globals, models, endpoints) | `AdminSettingsController`, `AdminPricingController` |

### Social Media
| Endpoints | Controller |
|---|---|
| OAuth start (JWT-signed state), callback (code exchange + upsert) | `SocialOAuthController` |
| list (with token health), disconnect, reconnect, sync | `SocialAccountsController` |
| edit, delete, approve, reject, retry, comment reply, inbox reply | `SocialPostsController` |
| CSV import, batch create, accounts, scheduled list | `BulkSchedulerController` |

### AI Generation
| Endpoints | Controller |
|---|---|
| image (DALL-E + multi-provider), rewrite, TTS, editor-assist — all with billing | `AiGenerateController` |

### Account & User
| Endpoints | Controller |
|---|---|
| avatar upload/delete, account delete, API key list/create/revoke | `AccountController` |

### Media Library
| Endpoints | Controller |
|---|---|
| list (paginated, filterable, searchable), upload (R2), delete, rename, move, storage quota + pricing | `MediaLibraryController` |
| folders: list, create, delete | `MediaFoldersController` |

### Content & Workspace
| Endpoints | Controller |
|---|---|
| documents: list (full-text search), rename, delete | `DocumentsController` |
| workspace members: list, invite (email), cancel invite, remove, role change | `WorkspaceMembersController` |
| brands: list, get, save (voice presets), delete | `BrandsController` |
| business groups: list, get, save, archive, add/remove assets | `BusinessGroupsController` |
| labels: list, save, delete | `LabelsController` |
| URL shortener: list, create, edit, delete | `UrlShortenerController` |

### Chatbot
| Endpoints | Controller |
|---|---|
| embed code, training upload/delete (R2), FAQs, domains, website scraping | `ChatbotDeployController` |
| list, analytics, templates, live agent, settings, save, delete | `SpaChatbotController` |

### Campaigns & Reports
| Endpoints | Controller |
|---|---|
| campaigns: list, get, save, soft delete, toggle active | `CampaignsController` |
| custom reports CRUD, scheduled reports CRUD | `CustomReportsController` |

### Developer API Portal
| Endpoints | Controller |
|---|---|
| overview, webhooks CRUD, wallet transactions | `DeveloperPortalController` |

### External Apps
| Endpoints | Controller |
|---|---|
| presentations JWT redirect, video editor JWT token + projects | `ExternalAppsController` |

### Security Traits
- `SpaRateLimitTrait` — Redis-backed per-user rate limiting
- `SpaBillingTrait` — BillingContext + credits balance + plan lookup
- `requireAdminRole()` — shared in `SpaAuthTrait`

---

## CRM / Sales Module

Full-featured CRM integrated into the React app with PHP backend.

### Database (8 tables + 2 columns)

| Table | Purpose |
|---|---|
| `crm_pipeline_stages` | Customizable pipeline stages per workspace (auto-seeds 7 defaults) |
| `crm_deals` | Deals with client info, value, stage, notes, share_token |
| `crm_deal_communications` | Activity timeline per deal (sender, message, date) |
| `crm_contacts` | Contacts with status, tags (JSON), initials |
| `crm_contact_deals` | Junction table linking contacts ↔ deals (many-to-many) |
| `crm_projects` | Content deliverables, optionally linked to a deal |
| `crm_content_items` | Individual content pieces within a project (type, status, sort_order) |
| `crm_tasks` | Tasks with priority, subtasks (JSON), tags (JSON), timer, linked deal/contact |
| `plans.crm_access` | Plan gating column (default: enabled for all) |
| `crm_deals.share_token` | Public preview token (32-char hex, unique) |

### Pages (6 pages, 10 components)

| Page | Route | Features |
|---|---|---|
| **Overview** | `/my/crm` | KPI cards (pipeline value, won revenue, overdue tasks), area chart, pie chart, recent activity |
| **Pipeline** | `/my/crm/pipeline` | Kanban board with drag-drop deals between stages, stage management dialog, new deal dialog |
| **Deliverables** | `/my/crm/projects` | Sortable table, search, status filter, create/edit/delete projects, content items with reorder |
| **Contacts** | `/my/crm/contacts` | Table with multi-field search, status/tag filters, detail sheet with edit/tags/linked deals |
| **Tasks** | `/my/crm/tasks` | 3-column kanban (To Do/In Progress/Done), drag-drop, timer, subtasks, bulk operations |
| **Client Preview** | `/my/crm/preview/:dealId` | Public content approval page (works with share token for external clients) |

### Components

| Component | File | Purpose |
|---|---|---|
| `kanban-board.tsx` | Pipeline orchestrator | Stage columns, drag-drop, selected deal panel |
| `deal-card.tsx` | Kanban card | Client avatar, value, content progress bar |
| `deal-detail.tsx` | Right panel | Deal info, project attach, communications, add activity |
| `new-deal-dialog.tsx` | Create dialog | Client name/email/company, value, stage, project picker |
| `pipeline-header.tsx` | Header bar | Pipeline value, deal counts, manage stages button |
| `stage-manager.tsx` | Settings dialog | Drag-reorder, rename, add/delete stages |
| `contact-detail-sheet.tsx` | Detail sheet | Contact info, edit form, status, tags, linked deals |
| `task-card.tsx` | Task card | Priority badge, overdue indicator, timer, subtasks |
| `task-detail-sheet.tsx` | Detail sheet | Timer, status/priority, subtasks, tags, linked items |
| `edit-project-content.tsx` | Project editor | Rename, content items list with reorder, add items |

### API Hooks (`src/api/crm.ts`)

22 React Query hooks:
- **Stages**: `useCrmStages`, `useCrmStagesSave`
- **Deals**: `useCrmDeals`, `useCrmDealGet`, `useCrmDealSave` (optimistic kanban updates), `useCrmDealDelete`
- **Contacts**: `useCrmContacts`, `useCrmContactGet`, `useCrmContactSave`, `useCrmContactDelete`
- **Links**: `useCrmContactLinkDeal`, `useCrmContactUnlinkDeal`
- **Communications**: `useCrmCommunicationAdd`, `useCrmCommunicationDelete`
- **Projects**: `useCrmProjects`, `useCrmProjectSave`, `useCrmProjectDelete`
- **Content Items**: `useCrmContentItemSave`, `useCrmContentItemDelete`, `useCrmContentItemStatus`
- **Tasks**: `useCrmTasks`, `useCrmTaskSave`, `useCrmTaskDelete`, `useCrmTaskTimer`
- **Dashboard**: `useCrmDashboard`

### Backend Features
- **Pagination**: All list endpoints support `?page=&limit=` with total/pages in response
- **Share token**: Generate a public preview link for clients (no auth needed)
- **Stage auto-seed**: First access creates 7 default stages per workspace
- **Cascade deletes**: Deals cascade to communications + junction; Projects cascade to content items
- **Plan gating**: `crm_access` column on plans table (default true, configurable via admin)

---

## Sidebar Navigation

GHL-inspired sidebar with:
- **Expandable menu items**: Icon + label + chevron, sub-items with left border line
- **Sales submenu**: Overview, Pipeline, Deliverables, Contacts, Tasks
- **Workspace switcher**: Floating panel (portalled), search, pin/unpin (persisted), colored avatars
- **Search** (`Cmd+K`): Centered command palette modal with ESC, keyboard navigation
- **Quick Actions** (lightning bolt): 10 actions (Create Post, AI Captain, New Contact, New Deal, etc.)
- **Collapsed mode**: Icons only, tooltips, floating panels still work

### Navigation Groups

| Group | Icon | Items |
|---|---|---|
| Dashboard | LayoutDashboard | Dashboard |
| Sales | Briefcase | Overview, Pipeline, Deliverables, Contacts, Tasks |
| Create | Sparkles | AI Captain, Assistant, Templates, Image/Video/Audio gen, etc. (16 items) |
| Publish | PenSquare | Create Post, Calendar, Manage Posts, Queues, Inbox, Comments, Labels (9 items) |
| Analyze | BarChart3 | Analytics, Reports, Ad insights for 4 platforms, Google Analytics, WooCommerce (10 items) |
| Ad Manager | Megaphone | Dashboard, Campaigns, Ad Sets, Ads, Creatives, Audiences, etc. (9 items) |
| Connect | Plug | Integrations, URL Shortener, Canva |
| Automate | Bot | Chatbot, Templates, Analytics, History, Live Agent, Settings |
| Workspace | Building2 | Overview, Members, Brands, Business Groups, Media Library, Developer API, Billing |
| Whitelabel | Globe | Settings, Agency, Billing, Reports |
| Admin | Shield | 19 items (users, plans, pricing, subscriptions, etc.) |

---

## UI Components (18)

All in `src/components/ui/`:

| Component | Source |
|---|---|
| `button.tsx` | CVA variants (default, destructive, outline, secondary, ghost, link) |
| `card.tsx` | Card, CardHeader, CardTitle, CardDescription, CardContent |
| `input.tsx` | Standard input with ring focus |
| `textarea.tsx` | Multi-line input |
| `label.tsx` | Radix Label |
| `badge.tsx` | CVA variants (default, secondary, destructive, outline) |
| `dialog.tsx` | Radix Dialog (Dialog, Content, Header, Footer, Title, Description, Close) |
| `alert-dialog.tsx` | Radix AlertDialog (Action, Cancel, Content, etc.) |
| `sheet.tsx` | Radix Dialog side panel (top/bottom/left/right) |
| `select.tsx` | Radix Select (Trigger, Content, Item, ScrollButtons) |
| `popover.tsx` | Radix Popover |
| `checkbox.tsx` | Radix Checkbox with check indicator |
| `separator.tsx` | Radix Separator (horizontal/vertical) |
| `progress.tsx` | Radix Progress with translateX indicator |
| `table.tsx` | HTML table components (Table, Header, Body, Row, Head, Cell) |
| `calendar.tsx` | react-day-picker with buttonVariants styling |
| `confirm-dialog.tsx` | Reusable confirmation dialog with ConfirmProvider |
| `rich-editor.tsx` | TipTap rich text editor |

---

## Services Reused (NOT rewritten)

| Service | Purpose |
|---|---|
| `ChargeService` | Credit burn/refund/grant, idempotency, ledger |
| `AiExecutionService` | AI model gating, key resolution |
| `AIGatewayService` | Provider transport (OpenAI, Anthropic, xAI, etc.) |
| `SocialAccountsService` | OAuth upsert, disconnect, token refresh, sync |
| `SocialPostService` | Post CRUD, validation, platform routing |
| `S3Uploader` | R2/S3 file upload/delete |
| `StorageQuotaService` | Storage limit enforcement |
| `ApiKeyService` | API key generation (SHA256 hashed) |
| `Gateway/Stripe` | Checkout sessions, subscription cancel |
| `BillingContext` + `BillingContextResolver` | Per-request billing authorization |
| `PlanLimitPolicy` | NULL=unlimited, 0=disabled, >0=cap semantics |
| `TenantWalletService` | Multi-tenant credit wallets |
| `RedisService` | Rate limiting, caching |
| `Helper` | sendMail, slug, baseURL, uploadToR2, encryptDecrypt |

---

## Architecture

```
React App (smartlyq-app)
  ↓ JWT Bearer token
PHP SPA Controllers (app/Controller/Spa/*.php)
  ↓ Call existing services
Services (app/Service/*.php) + Gateway (app/Gateway/*.php)
  ↓
Database (MariaDB) + R2 (Cloudflare) + Redis + ClickHouse
```

- **Auth**: JWT (HS256) via `SpaAuthTrait`. No sessions, no CSRF.
- **Rate limiting**: `SpaRateLimitTrait` — Redis-backed, per-user, per-action.
- **Billing**: `SpaBillingTrait` — builds `BillingContext` from JWT, resolves plan/credits.
- **OAuth**: JWT-signed state tokens for social platforms (no sessions).
- **External apps**: Video editor + presentations embedded via JWT iframe.
- **Whitelabel**: Dynamic branding (colors, logo, favicon) via bootstrap API + tenant-provider. Uses `var(--color)` CSS variables throughout for runtime theming.
- **Admin bypass**: Platform admins (role=1) bypass tenant workspace filters.
- **CRM public preview**: Share token auth (no JWT) for client-facing content approval.

---

## Key Features

### CRM / Sales Pipeline
- Kanban pipeline with drag-drop deals between customizable stages
- Contact management with tags, status, linked deals
- Task board with timer, subtasks, bulk operations, recurrence
- Content deliverables with project management and approval workflow
- Client preview page with public share token (no login required)
- Dashboard with KPIs, charts (Recharts), and activity feed
- Full pagination on all list endpoints

### Media Library (full parity with Bootstrap)
- Grid + list view with type filters (All/Images/Videos/Audio/Docs)
- Inline preview: video player, image viewer, PDF iframe, audio player
- Drag & drop upload (shows on Upload click)
- Collections/folders sidebar with create/delete
- Move to folder context menu
- Storage quota bar (used/limit) + Buy Extra Storage dialog
- Pollo.ai video expiration badges (14-day rule)
- Rename, download, delete per file

### Admin Panel
- Users: search, paginate, credits adjust, status toggle, role change, plan assign, delete
- Plans: full CRUD with 100+ column editor, duplicate, soft delete
- Billing: Stripe checkout + subscription cancel
- Blogs/Pages: rich text editor (TipTap) with image upload
- Settings: 12 tabs, field-type-aware editor
- Subscriptions/Transactions: cancel + refund actions

### Social Media
- OAuth connect for 12 platforms via JWT-signed state
- Post management: approve, reject, retry failed, delete
- Comment reply, inbox DM reply
- Bulk scheduler with CSV import

### Branding
- Dynamic favicon, logo, colors from bootstrap API
- Whitelabel tenant overrides via `var(--sq-*)` CSS variables
- User avatar in sidebar + header

---

## File Structure

```
smartlyq/app/Controller/Spa/         # 47+ PHP controllers + 3 traits
smartlyq/app/Route/Spa.php           # ~260 routes
smartlyq/database/migrations/        # SQL migration files (YYYY_MM_DD_NNN_*.sql)

smartlyq-app/src/api/                # 41+ React Query hook files
smartlyq-app/src/api/crm.ts          # 22 CRM hooks (stages, deals, contacts, tasks, etc.)
smartlyq-app/src/pages/              # 96+ page components
smartlyq-app/src/pages/crm/          # 6 CRM pages + 10 sub-components
smartlyq-app/src/components/ui/      # 18 shadcn/ui components
smartlyq-app/src/components/shell/   # sidebar, header, workspace-switcher, sidebar-search
smartlyq-app/src/stores/             # 5 Zustand stores (auth, tenant, workspace, ui, crm-ui)
smartlyq-app/src/lib/                # utilities (api-client, cn, constants, types, crm-data)
smartlyq-app/src/providers/          # auth-provider, tenant-provider, app-providers
smartlyq-app/src/layouts/            # app-layout, auth-layout, admin-layout
```

---

## Deployment

- **PHP backend**: Auto-deploys to AWS Lightsail via GitHub Actions on push to main
- **Migrations**: Run manually after push: `ssh -i SmartlyqKey.pem ubuntu@52.58.35.213 "docker exec smartlyq_php php scripts/run_migrations.php"`
- **React app**: Build locally → SCP to `/var/www/smartlyq-app/` → clean old assets first
- Served by Nginx under `/next/` path prefix
- **Important**: Always clean `/var/www/smartlyq-app/assets/` before deploying to avoid stale chunk accumulation
- Permissions: `ubuntu:www-data` with `755`

## Rules

- Every file ≤ 500 lines (PHP + TSX)
- `DB::select/insert/update/delete` (prepared) preferred over `DB::query` (raw)
- Never guess DB schema — `DESCRIBE tablename` first
- `tsc --noEmit` must pass before every commit
- Never add Co-Authored-By trailers to commits
- Clean server assets before each deploy (`rm -rf /var/www/smartlyq-app/assets/*`)
- Route order matters: specific routes BEFORE general catch-all routes in Spa.php
- All CRM queries scoped by `user_id + workspace_id` for data isolation
- Tags and subtasks stored as JSON columns (not separate tables)
- Use `var(--color)` CSS variables everywhere (whitelabel compatibility)
