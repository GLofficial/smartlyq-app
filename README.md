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
