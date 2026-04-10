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

## Stats (after Sprint 4)

| Metric | Count |
|---|---|
| PHP SPA controllers | **42** |
| API endpoints | **~220** |
| React API hook files | **38** |
| React pages | **90+** |
| Source files | **170+** |

All PHP files under 500 lines. All React files under 500 lines.

---

## API Endpoints — All 4 Sprints

### Sprint 1: Billing, Admin Actions, Security

| Category | Endpoints | Controller |
|---|---|---|
| **Billing** | overview, payments, subscriptions, transactions, checkout (Stripe), cancel | `BillingController` |
| **Admin Users** | credits adjust, status toggle, role change, plan assign, delete | `AdminUsersController` |
| **Admin Plans** | get, save (100+ column whitelist), soft delete, duplicate | `AdminPlansController` |

**Security traits:** `SpaRateLimitTrait` (Redis rate limiting), `SpaBillingTrait` (BillingContext + credits), `requireAdminRole()` in `SpaAuthTrait`.

### Sprint 2: Social OAuth & Post Actions

| Category | Endpoints | Controller |
|---|---|---|
| **Social OAuth** | start (JWT-signed state), callback (code exchange + upsert) | `SocialOAuthController` |
| **Social Accounts** | list (with token health), disconnect, reconnect, sync | `SocialAccountsController` |
| **Post Actions** | edit, delete, approve, reject, retry, comment reply | `SocialPostsController` |
| **Bulk Scheduler** | accounts, CSV import, batch create, scheduled list | `BulkSchedulerController` |

### Sprint 3: AI, Account, Media, Workspace

| Category | Endpoints | Controller |
|---|---|---|
| **AI Generation** | image (DALL-E), rewrite, TTS, editor-assist — all with billing | `AiGenerateController` |
| **Account** | avatar upload/delete, account delete, API key list/create/revoke | `AccountController` |
| **Media Library** | list (paginated), upload (R2), delete, rename, move | `MediaLibraryController` |
| **Media Folders** | list, create, delete | `MediaFoldersController` |
| **Documents** | list (full-text search), rename, delete | `DocumentsController` |
| **Workspace Members** | list, invite (with email), cancel invite, remove, role change | `WorkspaceMembersController` |

### Sprint 4: Chatbot, Campaigns, Business, Developer, Reports, External Apps

| Category | Endpoints | Controller |
|---|---|---|
| **Chatbot Deploy** | embed code, training upload/delete (R2), FAQs, domains | `ChatbotDeployController` |
| **Campaigns** | list, get, save, soft delete, toggle active | `CampaignsController` |
| **Business Groups** | list, get, save, archive, add/remove assets | `BusinessGroupsController` |
| **Developer Portal** | overview, webhooks CRUD, wallet transactions | `DeveloperPortalController` |
| **Custom Reports** | custom reports CRUD, scheduled reports CRUD | `CustomReportsController` |
| **External Apps** | presentations JWT redirect, video editor token + projects | `ExternalAppsController` |

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
- **OAuth**: JWT-signed state tokens (no sessions).
- **External apps**: Video editor + presentations via JWT redirect/iframe.
- **Whitelabel**: Dynamic branding (colors, logo, favicon) via bootstrap API + tenant-provider.

---

## File Structure

```
smartlyq/app/Controller/Spa/      # 42 PHP controllers + 3 traits
smartlyq/app/Route/Spa.php        # ~220 routes
smartlyq-app/src/api/             # 38 React Query hook files
smartlyq-app/src/pages/           # 90+ page components
smartlyq-app/src/components/ui/   # button, card, input, rich-editor
```

---

## Deployment

- **PHP backend**: Auto-deploys to AWS Lightsail on push to main
- **React app**: GitHub Actions builds + SCP to `/var/www/smartlyq-app/` on server
- Served by Nginx under `/next/` path prefix
- Cutover scripts available: `cutover-react.sh` / `rollback-react.sh`

## Rules

- Every file ≤ 500 lines (PHP + TSX)
- `DB::select/insert/update/delete` (prepared) preferred over `DB::query` (raw)
- Never guess DB schema — `DESCRIBE tablename` first
- `tsc --noEmit` must pass before every commit
- Never add Co-Authored-By trailers to commits
