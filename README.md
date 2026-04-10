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
| Icons | Lucide React |
| Toasts | Sonner |
| Linting | Biome |

## Stats

| Metric | Count |
|---|---|
| PHP SPA controllers | **45+** |
| API endpoints | **~235** |
| React API hook files | **40+** |
| React pages | **90+** |
| Source files | **180+** |

All PHP files under 500 lines. All React files under 500 lines.

---

## API Endpoints — Complete

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

Features: inline preview modal (video player, image viewer, PDF iframe, audio player), drag-and-drop upload, grid/list view, Move to folders, Buy Extra Storage dialog, Pollo.ai video expiration badges.

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
- **Whitelabel**: Dynamic branding (colors, logo, favicon) via bootstrap API + tenant-provider.
- **Admin bypass**: Platform admins (role=1) bypass tenant workspace filters.

---

## Key Features

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
- Whitelabel tenant overrides
- User avatar in sidebar + header

---

## File Structure

```
smartlyq/app/Controller/Spa/      # 45+ PHP controllers + 3 traits
smartlyq/app/Route/Spa.php        # ~235 routes
smartlyq-app/src/api/             # 40+ React Query hook files
smartlyq-app/src/pages/           # 90+ page components
smartlyq-app/src/pages/media/     # media-library-page, sidebar, preview-modal
smartlyq-app/src/components/ui/   # button, card, input, rich-editor
```

---

## Deployment

- **PHP backend**: Auto-deploys to AWS Lightsail via GitHub Actions on push to main
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
