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
| PHP SPA controllers | **50** |
| API endpoints | **~280** |
| React pages + components | **100+** |
| CRM files (pages + components) | **19** |
| UI components | **18** |
| Database migrations | **55+** |

All PHP files under 500 lines. All React files under 500 lines.

---

## CRM / Sales Module — Complete

Full-featured CRM integrated into the React app with PHP backend. Built from the [deal-flow-connect](https://github.com/GLofficial/deal-flow-connect) prototype, extended with real API, database, import/export, soft deletes, and public preview.

### Database Tables (8 tables + 3 added columns)

| Table | Columns | Purpose |
|---|---|---|
| `crm_pipeline_stages` | workspace_id, stage_key, label, color, sort_order | Customizable pipeline stages per workspace (auto-seeds 7 defaults on first access) |
| `crm_deals` | user_id, workspace_id, client_name/email/company, value (DECIMAL 12,2), stage, next_action_date, notes, **share_token** | Deals with client info and public preview token |
| `crm_deal_communications` | deal_id, user_id, workspace_id, message, sender, comm_date | Activity timeline per deal |
| `crm_contacts` | user_id, workspace_id, **first_name**, **last_name**, name, initials, email, company, phone, role, status (ENUM), tags (JSON), last_contacted_at, **deleted_at** | Contacts with soft delete support |
| `crm_contact_deals` | contact_id, deal_id | Junction table (many-to-many) |
| `crm_projects` | user_id, workspace_id, deal_id (nullable), name | Content projects optionally linked to a deal |
| `crm_content_items` | project_id, user_id, workspace_id, title, type (ENUM), status (ENUM), word_count, content, sort_order | Individual content pieces within a project |
| `crm_tasks` | user_id, workspace_id, title, description, status/priority (ENUMs), due_date, linked_deal_id, linked_contact_id, tags (JSON), subtasks (JSON), recurrence (ENUM), time_tracked_minutes | Tasks with timer, subtasks, linked items |
| `plans.crm_access` | TINYINT(1) DEFAULT 1 | Plan gating column |

### Migrations (5 files)

| File | What it does |
|---|---|
| `2026_04_10_001_create_crm_tables.sql` | Creates all 8 CRM tables |
| `2026_04_10_002_add_crm_deal_share_token.sql` | Adds `share_token VARCHAR(64)` + unique index to crm_deals |
| `2026_04_10_003_add_crm_plan_column.sql` | Adds `crm_access TINYINT(1)` to plans table |
| `2026_04_10_004_split_contact_name_fields.sql` | Adds `first_name`, `last_name` to crm_contacts + backfill |
| `2026_04_10_005_add_crm_contacts_deleted_at.sql` | Adds `deleted_at DATETIME` + index for soft deletes |

### PHP Controllers (3 files, 35 routes)

| Controller | File | Methods | Purpose |
|---|---|---|---|
| `CrmController` | `app/Controller/Spa/CrmController.php` | 27 | Stages, deals, contacts, projects, content items, tasks, dashboard |
| `CrmContactOpsController` | `app/Controller/Spa/CrmContactOpsController.php` | 6 | CSV import preview/execute, export, deleted list, restore, permanent delete |
| `CrmPublicController` | `app/Controller/Spa/CrmPublicController.php` | 2 | Public preview (no JWT) + approve content items via share token |

### API Endpoints (35 total)

| Method | Route | Description |
|---|---|---|
| GET | `/api/spa/crm/dashboard` | Aggregated KPIs (pipeline value, won revenue, by-stage, tasks, activity) |
| GET | `/api/spa/crm/stages` | Get stages (auto-seeds 7 defaults per workspace) |
| POST | `/api/spa/crm/stages/save` | Replace all stages (transactional delete + re-insert) |
| GET | `/api/spa/crm/deals` | List deals (paginated, `?stage=` filter) |
| GET | `/api/spa/crm/deals/get` | Single deal + communications + project + content items |
| POST | `/api/spa/crm/deals/save` | Create/update deal (partial updates supported for drag-drop) |
| POST | `/api/spa/crm/deals/delete` | Delete deal + cascade communications |
| POST | `/api/spa/crm/deals/share-token` | Generate 32-char hex share token for public preview |
| GET | `/api/spa/crm/contacts` | List contacts (paginated, `?status=&search=`) with deal count + total value |
| GET | `/api/spa/crm/contacts/get` | Single contact + linked deal IDs |
| POST | `/api/spa/crm/contacts/save` | Create/update contact (auto-computes name + initials from first/last) |
| POST | `/api/spa/crm/contacts/delete` | Soft delete (sets deleted_at, preserves deal links for restore) |
| POST | `/api/spa/crm/contacts/link-deal` | Link contact ↔ deal |
| POST | `/api/spa/crm/contacts/unlink-deal` | Unlink contact ↔ deal |
| POST | `/api/spa/crm/contacts/import/preview` | Upload CSV, return headers + 5 preview rows + auto-mapping suggestions |
| POST | `/api/spa/crm/contacts/import/execute` | Batch import with column mapping, create-only or create-and-update, dedup by email/phone/both |
| GET | `/api/spa/crm/contacts/export` | Stream CSV download (respects status/search filters) |
| GET | `/api/spa/crm/contacts/deleted` | List soft-deleted contacts (paginated) |
| POST | `/api/spa/crm/contacts/restore` | Restore single or bulk (set deleted_at = NULL) |
| POST | `/api/spa/crm/contacts/permanent-delete` | Hard delete (only from trash) + cascade junction |
| POST | `/api/spa/crm/communications/add` | Add deal activity note |
| POST | `/api/spa/crm/communications/delete` | Delete activity entry |
| GET | `/api/spa/crm/projects` | List projects (paginated) with item counts + linked deal name |
| GET | `/api/spa/crm/projects/get` | Single project + content items array |
| POST | `/api/spa/crm/projects/save` | Create/update project (deal_id=0 means unlink) |
| POST | `/api/spa/crm/projects/delete` | Delete project + cascade content items |
| POST | `/api/spa/crm/content-items/save` | Create/update content item |
| POST | `/api/spa/crm/content-items/delete` | Delete content item |
| POST | `/api/spa/crm/content-items/status` | Quick status update (for preview page approve/publish) |
| GET | `/api/spa/crm/tasks` | List tasks (paginated, `?status=` filter) |
| POST | `/api/spa/crm/tasks/save` | Create/update task (partial updates for drag-drop, subtasks/tags as JSON) |
| POST | `/api/spa/crm/tasks/delete` | Delete task |
| POST | `/api/spa/crm/tasks/timer` | Increment time_tracked_minutes |
| GET | `/api/spa/crm/public/preview` | Public preview by share token (no JWT, returns project + content items only) |
| POST | `/api/spa/crm/public/approve` | Public approve/revert content item by share token |

### React Pages (6 pages)

| Page | File | Route | Features |
|---|---|---|---|
| **Overview** | `crm-dashboard-page.tsx` | `/my/crm` | KPI cards, pipeline value area chart, deal distribution pie chart, tasks due this week, overdue tasks, recent activity feed, quick stats |
| **Pipeline** | `crm-pipeline-page.tsx` | `/my/crm/pipeline` | Kanban board with drag-drop deals between customizable stages, deal detail side panel, stage management, new deal dialog |
| **Projects** | `crm-projects-page.tsx` | `/my/crm/projects` | Sortable table (name/items/created), search, clickable rows to edit, create/edit/delete projects with content item management |
| **Contacts** | `crm-contacts-page.tsx` | `/my/crm/contacts` | Table with multi-field search, status filter, first/last name, detail sheet with tags/status/edit, import/export/restore buttons |
| **Tasks** | `crm-tasks-page.tsx` | `/my/crm/tasks` | 3-column kanban (To Do/In Progress/Done), drag-drop, timer, subtasks, bulk select/delete, priority filter |
| **Client Preview** | `crm-preview-page.tsx` | `/my/crm/preview/:dealId` | Public content approval page with approve/request changes per item |

### React Components (13 files in `pages/crm/components/`)

| Component | File | Purpose |
|---|---|---|
| `kanban-board.tsx` | Pipeline orchestrator | Stage columns, drag-drop, deal detail panel, stage manager, new deal dialog |
| `deal-card.tsx` | Kanban deal card | Client avatar (hue-hashed), name, company, value, project name, next action date |
| `deal-detail.tsx` | Deal side panel | Client info, value, notes, project card (switch/unlink), content items, activity log with add note, delete deal with confirmation |
| `new-deal-dialog.tsx` | Create deal dialog | Client name/email/company, value, stage selector, notes. Double-submit prevention. |
| `pipeline-header.tsx` | Pipeline header bar | Pipeline value, active/total deal counts, Stages button, New Deal button |
| `stage-manager.tsx` | Stage settings dialog | Drag-reorder stages, inline rename, add new, delete stages |
| `contact-detail-sheet.tsx` | Contact detail sheet | Contact info, edit form (first/last name), status buttons, tag management (add/remove), linked deals |
| `contact-import-dialog.tsx` | CSV import wizard | 4-step: select object → upload CSV + mode/dedup → map columns (auto-suggestions) → verify + import with results |
| `deleted-contacts-dialog.tsx` | Restore deleted dialog | Table of soft-deleted contacts with restore + permanent delete (confirmation) |
| `task-card.tsx` | Task kanban card | Priority badge, overdue indicator, due date, subtask count, linked contact/deal, tags |
| `task-detail-sheet.tsx` | Task detail sheet | Timer (start/stop), status/priority/recurrence selects, due date picker, subtasks (add/toggle/remove), tags, linked deal/contact |
| `project-edit-dialog.tsx` | Project edit dialog | Rename project, content items list with status dropdowns, add new items (title + type), remove items |
| `edit-project-content.tsx` | Content item editor | Reusable content items list with status select, reorder, remove |

### React API Hooks (`src/api/crm.ts` — 485 lines, 29 hooks/functions)

| Category | Hooks |
|---|---|
| **Stages** | `useCrmStages`, `useCrmStagesSave` |
| **Deals** | `useCrmDeals`, `useCrmDealGet`, `useCrmDealSave` (optimistic kanban), `useCrmDealDelete` |
| **Contacts** | `useCrmContacts`, `useCrmContactGet`, `useCrmContactSave`, `useCrmContactDelete` |
| **Contact Links** | `useCrmContactLinkDeal`, `useCrmContactUnlinkDeal` |
| **Contact Ops** | `useCrmContactImportPreview`, `useCrmContactImportExecute`, `exportCrmContacts`, `useCrmDeletedContacts`, `useCrmContactRestore`, `useCrmContactPermanentDelete` |
| **Communications** | `useCrmCommunicationAdd`, `useCrmCommunicationDelete` |
| **Projects** | `useCrmProjects`, `useCrmProjectGet`, `useCrmProjectSave`, `useCrmProjectDelete` |
| **Content Items** | `useCrmContentItemSave`, `useCrmContentItemDelete`, `useCrmContentItemStatus` |
| **Tasks** | `useCrmTasks`, `useCrmTaskSave`, `useCrmTaskDelete`, `useCrmTaskTimer` |
| **Dashboard** | `useCrmDashboard` |

### CRM Data & Types (`src/lib/crm-data.ts`)

Types: `Deal`, `Contact`, `CrmTask`, `SmartlyQProject`, `ContentItem`, `StageConfig`, `Subtask`, `TaskStatus`, `TaskPriority`, `TaskRecurrence`

Helpers: `formatCurrency`, `getDealsForStage`, `getContentProgress`

Config: `TASK_STATUS_CONFIG`, `TASK_STATUS_ORDER`, `PRIORITY_CONFIG`, `DEFAULT_STAGE_COLORS`

### CRM Store (`src/stores/crm-store.ts` — UI-only)

Minimal Zustand store for UI selection state only (all data lives in React Query cache):
- `selectedDealId`, `selectedContactId`, `selectedTaskId`

---

## API Endpoints — All Modules

### CRM / Sales
See detailed CRM section above (35 endpoints across 3 controllers).

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

## Sidebar Navigation

GHL-inspired sidebar with expandable menus, workspace switcher, search, and quick actions.

| Group | Icon | Items |
|---|---|---|
| Dashboard | LayoutDashboard | Dashboard |
| Sales | Briefcase | Overview, Pipeline, Projects, Contacts, Tasks |
| Create | Sparkles | AI Captain, Assistant, Captain Boards, Templates, Image/Video/Audio gen, etc. (16 items) |
| Publish | PenSquare | Create Post, Calendar, Manage Posts, Queues, Inbox, Comments, Labels (9 items) |
| Analyze | BarChart3 | Analytics, Reports, Ad insights (4 platforms), Google Analytics, WooCommerce (10 items) |
| Ad Manager | Megaphone | Dashboard, Campaigns, Ad Sets, Ads, Creatives, Audiences, etc. (9 items) |
| Connect | Plug | Integrations, URL Shortener, Canva |
| Automate | Bot | Chatbot, Templates, Analytics, History, Live Agent, Settings |
| Workspace | Building2 | Overview, Members, Brands, Business Groups, Media Library, Developer API, Billing |
| Whitelabel | Globe | Settings, Agency, Billing, Reports |
| Admin | Shield | 19 items (users, plans, pricing, subscriptions, etc.) |

### Sidebar Shell Components (`src/components/shell/`)

| File | Purpose |
|---|---|
| `sidebar.tsx` | Main sidebar layout with logo, workspace, search, nav, user info |
| `sidebar-nav-config.ts` | Navigation groups + items config with `NavItem.children` support |
| `sidebar-section.tsx` | Renders nav groups with expandable submenus (icon + label + chevron) |
| `sidebar-search.tsx` | Search bar (Cmd+K command palette modal) + Quick Actions (lightning bolt panel) |
| `workspace-switcher.tsx` | GHL-style floating workspace panel with search, pin/unpin, colored avatars |
| `header.tsx` | Top header bar |

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
- **Whitelabel**: Dynamic branding via bootstrap API + tenant-provider. Uses `var(--color)` CSS variables for runtime theming.
- **Admin bypass**: Platform admins (role=1) bypass tenant workspace filters.
- **CRM public preview**: Share token auth (no JWT) for client-facing content approval.
- **CRM pipeline stages**: Scoped by `workspace_id` only (shared across workspace users).
- **Soft deletes**: Contacts use `deleted_at` column; other entities use hard delete.

---

## File Structure

```
smartlyq/                                    # PHP backend (app.smartlyq.com)
├── app/Controller/Spa/
│   ├── CrmController.php                    # 27 CRM methods (stages, deals, contacts, projects, tasks, dashboard)
│   ├── CrmContactOpsController.php          # 6 methods (CSV import/export, soft delete ops)
│   ├── CrmPublicController.php              # 2 methods (public preview + approve, no JWT)
│   ├── SpaAuthTrait.php                     # JWT auth, CORS, response helpers
│   ├── SpaRateLimitTrait.php                # Redis rate limiting
│   ├── SpaBillingTrait.php                  # Billing context
│   └── ... (47 more controllers)
├── app/Route/Spa.php                        # ~280 routes (35 CRM)
└── database/migrations/
    ├── 2026_04_10_001_create_crm_tables.sql
    ├── 2026_04_10_002_add_crm_deal_share_token.sql
    ├── 2026_04_10_003_add_crm_plan_column.sql
    ├── 2026_04_10_004_split_contact_name_fields.sql
    └── 2026_04_10_005_add_crm_contacts_deleted_at.sql

smartlyq-app/                                # React frontend
├── src/api/
│   └── crm.ts                               # 29 React Query hooks (485 lines)
├── src/lib/
│   ├── crm-data.ts                          # Types + helpers (no mock data)
│   └── cn.ts, api-client.ts, types.ts, constants.ts, query-client.ts
├── src/stores/
│   └── crm-store.ts                         # UI-only (selectedDealId, etc.)
├── src/pages/crm/
│   ├── crm-dashboard-page.tsx               # Overview with KPIs + charts
│   ├── crm-pipeline-page.tsx                # Renders KanbanBoard
│   ├── crm-projects-page.tsx                # Projects table + edit dialog
│   ├── crm-contacts-page.tsx                # Contacts table + import/export/restore
│   ├── crm-tasks-page.tsx                   # Task kanban board
│   ├── crm-preview-page.tsx                 # Client preview page
│   └── components/
│       ├── kanban-board.tsx                  # Pipeline kanban orchestrator
│       ├── deal-card.tsx                     # Deal kanban card
│       ├── deal-detail.tsx                   # Deal side panel (info, project, activity, delete)
│       ├── new-deal-dialog.tsx               # Create deal dialog
│       ├── pipeline-header.tsx               # Pipeline header bar
│       ├── stage-manager.tsx                 # Stage settings dialog
│       ├── contact-detail-sheet.tsx          # Contact detail + edit + tags
│       ├── contact-import-dialog.tsx         # 4-step CSV import wizard
│       ├── deleted-contacts-dialog.tsx       # Restore deleted contacts
│       ├── task-card.tsx                     # Task kanban card
│       ├── task-detail-sheet.tsx             # Task detail + timer + subtasks
│       ├── project-edit-dialog.tsx           # Project edit with content items
│       └── edit-project-content.tsx          # Reusable content items editor
├── src/components/shell/
│   ├── sidebar.tsx                          # Main sidebar layout
│   ├── sidebar-nav-config.ts               # Nav groups with children support
│   ├── sidebar-section.tsx                  # Expandable nav sections
│   ├── sidebar-search.tsx                   # Cmd+K search + quick actions
│   └── workspace-switcher.tsx              # GHL-style workspace panel
├── src/components/ui/                       # 18 shadcn/ui components
├── src/providers/                           # auth, tenant, app providers
├── src/layouts/                             # app, auth, admin layouts
└── src/routes.tsx                           # All route definitions
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
- All CRM queries scoped by `user_id + workspace_id` (stages by `workspace_id` only)
- Tags and subtasks stored as JSON columns (not separate tables)
- Use `var(--color)` CSS variables everywhere (whitelabel compatibility)
- Pipeline stages scoped by workspace_id only (shared across workspace users, NOT per-user)
- Contacts use soft delete (`deleted_at`); deals/tasks/projects use hard delete
- `ownerWhere('alias')` helper for JOIN queries to avoid ambiguous column errors
