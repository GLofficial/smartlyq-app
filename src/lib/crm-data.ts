// ---------------------------------------------------------------------------
// Deal-Flow CRM — Static data, types & helpers
// ---------------------------------------------------------------------------

export type DealStage = string;

export interface StageConfig {
  label: string;
  color: string;
}

export interface ContentItem {
  id: string;
  title: string;
  type: "seo-article" | "social-post" | "ad-copy" | "blog-post";
  status: "queued" | "generating" | "draft" | "approved" | "published";
  wordCount?: number;
  content?: string;
}

export interface SmartlyQProject {
  id: string;
  name: string;
  items: ContentItem[];
}

export interface Deal {
  id: string;
  clientName: string;
  clientEmail: string;
  clientCompany: string;
  value: number;
  stage: DealStage;
  nextActionDate: string;
  notes: string;
  project?: SmartlyQProject;
  createdAt: string;
  communicationHistory: { date: string; message: string; from: string }[];
}

export interface Contact {
  id: string;
  name: string;
  initials: string;
  email: string;
  company: string;
  phone: string;
  role: string;
  status: "active" | "prospect" | "inactive";
  notes: string;
  linkedDealIds: string[];
  createdAt: string;
}

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface TaskRecurrence {
  frequency: "daily" | "weekly" | "biweekly" | "monthly";
  nextDate: string;
}

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface CrmTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  linkedDealId?: string;
  linkedContactId?: string;
  tags: string[];
  subtasks: Subtask[];
  recurrence?: TaskRecurrence;
  timeTrackedMinutes: number;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Stage configuration
// ---------------------------------------------------------------------------

export const DEFAULT_STAGE_COLORS = [
  "220 14% 46%",
  "38 80% 50%",
  "200 80% 50%",
  "280 50% 55%",
  "20 80% 55%",
  "152 60% 40%",
  "0 50% 55%",
  "168 60% 40%",
  "330 60% 50%",
  "60 70% 45%",
];

export const STAGE_CONFIG: Record<DealStage, StageConfig> = {
  lead:       { label: "Lead",           color: "220 14% 46%" },
  proposal:   { label: "Proposal Sent",  color: "38 80% 50%" },
  drafting:   { label: "AI Drafting",    color: "200 80% 50%" },
  review:     { label: "Client Review",  color: "280 50% 55%" },
  revisions:  { label: "Revisions",      color: "20 80% 55%" },
  published:  { label: "Published/Won",  color: "152 60% 40%" },
  closed:     { label: "Closed/Lost",    color: "0 50% 55%" },
};

export const STAGE_ORDER: DealStage[] = [
  "lead",
  "proposal",
  "drafting",
  "review",
  "revisions",
  "published",
  "closed",
];

// ---------------------------------------------------------------------------
// Task-status & priority configuration
// ---------------------------------------------------------------------------

export const TASK_STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; color: string }
> = {
  todo:        { label: "To Do",       color: "#6b7280" },
  in_progress: { label: "In Progress", color: "var(--primary)" },
  done:        { label: "Done",        color: "hsl(152 60% 40%)" },
};

export const TASK_STATUS_ORDER: TaskStatus[] = [
  "todo",
  "in_progress",
  "done",
];

export const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; className: string }
> = {
  low:    { label: "Low",    className: "text-gray-500 bg-gray-100 border-gray-200" },
  medium: { label: "Medium", className: "text-gray-700 bg-gray-100 border-gray-200" },
  high:   { label: "High",   className: "text-orange-600 bg-orange-50 border-orange-200" },
  urgent: { label: "Urgent", className: "text-red-600 bg-red-50 border-red-200" },
};

// ---------------------------------------------------------------------------
// Mock deals
// ---------------------------------------------------------------------------

export const MOCK_DEALS: Deal[] = [
  {
    id: "deal-1",
    clientName: "Maria Gonzalez",
    clientEmail: "maria@brightvine.co",
    clientCompany: "Brightvine Co",
    value: 4800,
    stage: "drafting",
    nextActionDate: "2026-04-14",
    notes: "Client wants SEO-focused blog posts for their new SaaS product launch. Prefers a conversational tone.",
    createdAt: "2026-03-20",
    project: {
      id: "proj-1",
      name: "Brightvine Launch Content",
      items: [
        {
          id: "ci-1",
          title: "Why SaaS Onboarding Matters",
          type: "seo-article",
          status: "approved",
          wordCount: 1450,
          content: "In the competitive SaaS landscape, onboarding is the first impression...",
        },
        {
          id: "ci-2",
          title: "Product Hunt Launch Post",
          type: "social-post",
          status: "draft",
          wordCount: 280,
          content: "We're live on Product Hunt! After 18 months of building...",
        },
        {
          id: "ci-3",
          title: "Google Ads — Trial Signup",
          type: "ad-copy",
          status: "generating",
          wordCount: undefined,
          content: undefined,
        },
        {
          id: "ci-4",
          title: "5 Metrics Every SaaS Founder Should Track",
          type: "blog-post",
          status: "queued",
          wordCount: undefined,
          content: undefined,
        },
        {
          id: "ci-5",
          title: "LinkedIn Thought Leadership #1",
          type: "social-post",
          status: "approved",
          wordCount: 320,
          content: "Most SaaS companies spend 5x more acquiring customers than retaining them...",
        },
      ],
    },
    communicationHistory: [
      { date: "2026-03-20", message: "Initial call — Maria needs 5 content pieces for April launch.", from: "You" },
      { date: "2026-03-22", message: "Sent content brief for approval.", from: "You" },
      { date: "2026-03-23", message: "Brief approved. Prefers conversational tone, not corporate.", from: "Maria Gonzalez" },
      { date: "2026-04-01", message: "First draft of SEO article delivered.", from: "You" },
      { date: "2026-04-03", message: "Loved the article! Minor tweaks requested on intro paragraph.", from: "Maria Gonzalez" },
    ],
  },
  {
    id: "deal-2",
    clientName: "James Whitfield",
    clientEmail: "james@peakmedia.io",
    clientCompany: "Peak Media",
    value: 12500,
    stage: "review",
    nextActionDate: "2026-04-11",
    notes: "Large quarterly retainer. Q2 campaign covers paid ads, social content, and two long-form articles.",
    createdAt: "2026-02-15",
    project: {
      id: "proj-2",
      name: "Peak Media Q2 Campaign",
      items: [
        {
          id: "ci-6",
          title: "Meta Ads — Summer Collection",
          type: "ad-copy",
          status: "approved",
          wordCount: 150,
          content: "Summer is calling. Discover our new collection designed for...",
        },
        {
          id: "ci-7",
          title: "Instagram Carousel — Behind the Scenes",
          type: "social-post",
          status: "draft",
          wordCount: 200,
          content: "Slide 1: Ever wonder what goes into a photoshoot?...",
        },
        {
          id: "ci-8",
          title: "The Future of Retail Media Networks",
          type: "seo-article",
          status: "generating",
          wordCount: undefined,
          content: undefined,
        },
        {
          id: "ci-9",
          title: "How Peak Media Grew 300% in 12 Months",
          type: "blog-post",
          status: "published",
          wordCount: 2100,
          content: "When we started Peak Media, we had three clients and a shared WeWork desk...",
        },
      ],
    },
    communicationHistory: [
      { date: "2026-02-15", message: "Signed Q2 retainer agreement.", from: "James Whitfield" },
      { date: "2026-03-01", message: "Kick-off call. Discussed content calendar for April–June.", from: "You" },
      { date: "2026-03-15", message: "First batch of ad copy delivered.", from: "You" },
      { date: "2026-04-02", message: "Case study published. James wants revisions on Instagram copy.", from: "James Whitfield" },
    ],
  },
  {
    id: "deal-3",
    clientName: "Anika Patel",
    clientEmail: "anika@leafandstone.com",
    clientCompany: "Leaf & Stone Design",
    value: 2200,
    stage: "lead",
    nextActionDate: "2026-04-15",
    notes: "Interior design studio looking for blog content and Pinterest-optimized posts. Early stage — needs nurturing.",
    createdAt: "2026-04-05",
    project: undefined,
    communicationHistory: [
      { date: "2026-04-05", message: "Inbound lead from website contact form.", from: "Anika Patel" },
      { date: "2026-04-07", message: "Sent introductory email with portfolio link.", from: "You" },
    ],
  },
  {
    id: "deal-4",
    clientName: "Tom Eriksson",
    clientEmail: "tom@nordichealthlabs.se",
    clientCompany: "Nordic Health Labs",
    value: 7300,
    stage: "proposal",
    nextActionDate: "2026-04-12",
    notes: "Health-tech startup expanding to US market. Needs localized content strategy and FDA-compliant ad copy.",
    createdAt: "2026-03-28",
    project: undefined,
    communicationHistory: [
      { date: "2026-03-28", message: "Discovery call — Tom needs US market content for Q3 launch.", from: "You" },
      { date: "2026-04-01", message: "Sent proposal with three package options.", from: "You" },
      { date: "2026-04-05", message: "Tom is reviewing with his co-founder. Expects decision by April 12.", from: "Tom Eriksson" },
    ],
  },
  {
    id: "deal-5",
    clientName: "Rachel Kim",
    clientEmail: "rachel@momentumfit.com",
    clientCompany: "Momentum Fitness",
    value: 3600,
    stage: "published",
    nextActionDate: "2026-04-20",
    notes: "Blog relaunch complete. All content published. Follow up for Q3 retainer upsell.",
    createdAt: "2026-01-10",
    project: {
      id: "proj-3",
      name: "Momentum Fitness Blog Relaunch",
      items: [
        {
          id: "ci-10",
          title: "10 At-Home Workouts That Actually Work",
          type: "blog-post",
          status: "published",
          wordCount: 1800,
          content: "You don't need a gym membership to get in shape...",
        },
        {
          id: "ci-11",
          title: "Nutrition Myths Debunked by Science",
          type: "seo-article",
          status: "published",
          wordCount: 2200,
          content: "From detox teas to keto everything, the fitness industry loves a good myth...",
        },
        {
          id: "ci-12",
          title: "Instagram Reel Script — Morning Routine",
          type: "social-post",
          status: "published",
          wordCount: 150,
          content: "[Hook] Think you need 2 hours for a morning routine? Think again...",
        },
      ],
    },
    communicationHistory: [
      { date: "2026-01-10", message: "Signed blog relaunch package.", from: "Rachel Kim" },
      { date: "2026-02-01", message: "Content calendar approved.", from: "You" },
      { date: "2026-03-15", message: "All 3 pieces published. Rachel thrilled with results.", from: "Rachel Kim" },
      { date: "2026-04-01", message: "Sent Q3 retainer proposal for ongoing content.", from: "You" },
    ],
  },
  {
    id: "deal-6",
    clientName: "Daniel Moss",
    clientEmail: "daniel@greyline.agency",
    clientCompany: "Greyline Agency",
    value: 0,
    stage: "closed",
    nextActionDate: "2026-05-01",
    notes: "Lost — went with in-house team. Revisit in Q3 when their contract cycle resets.",
    createdAt: "2026-02-20",
    project: undefined,
    communicationHistory: [
      { date: "2026-02-20", message: "Initial meeting. Daniel interested in white-label content.", from: "You" },
      { date: "2026-03-05", message: "Sent white-label proposal.", from: "You" },
      { date: "2026-03-20", message: "Daniel chose to build in-house instead. No hard feelings, revisit later.", from: "Daniel Moss" },
    ],
  },
  {
    id: "deal-7",
    clientName: "Suki Tanaka",
    clientEmail: "suki@canopyfoods.jp",
    clientCompany: "Canopy Foods",
    value: 5100,
    stage: "revisions",
    nextActionDate: "2026-04-13",
    notes: "Plant-based food brand. Content needs bilingual review (EN/JP). Revisions round 2.",
    createdAt: "2026-03-10",
    project: {
      id: "proj-4",
      name: "Canopy Foods Content Suite",
      items: [
        {
          id: "ci-13",
          title: "The Rise of Plant-Based in Japan",
          type: "seo-article",
          status: "draft",
          wordCount: 1600,
          content: "Japan's food industry is undergoing a quiet revolution...",
        },
        {
          id: "ci-14",
          title: "Facebook Ads — Taste the Future",
          type: "ad-copy",
          status: "draft",
          wordCount: 120,
          content: "What if the future of food was already on your plate?...",
        },
        {
          id: "ci-15",
          title: "Founder Story — From Tokyo Kitchen to Global Brand",
          type: "blog-post",
          status: "generating",
          wordCount: undefined,
          content: undefined,
        },
      ],
    },
    communicationHistory: [
      { date: "2026-03-10", message: "Signed content suite package.", from: "Suki Tanaka" },
      { date: "2026-03-25", message: "First drafts delivered. Suki needs JP review before approval.", from: "You" },
      { date: "2026-04-02", message: "JP review done. Some cultural references need adjustment.", from: "Suki Tanaka" },
      { date: "2026-04-08", message: "Revision round 2 submitted.", from: "You" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Mock contacts
// ---------------------------------------------------------------------------

export const MOCK_CONTACTS: Contact[] = [
  {
    id: "contact-1",
    name: "Maria Gonzalez",
    initials: "MG",
    email: "maria@brightvine.co",
    company: "Brightvine Co",
    phone: "+1 415-555-0101",
    role: "Head of Marketing",
    status: "active",
    notes: "Prefers Slack for communication. Timezone: PST.",
    linkedDealIds: ["deal-1"],
    createdAt: "2026-03-20",
  },
  {
    id: "contact-2",
    name: "James Whitfield",
    initials: "JW",
    email: "james@peakmedia.io",
    company: "Peak Media",
    phone: "+1 212-555-0202",
    role: "CEO",
    status: "active",
    notes: "Decision maker. Very detail-oriented on ad copy.",
    linkedDealIds: ["deal-2"],
    createdAt: "2026-02-15",
  },
  {
    id: "contact-3",
    name: "Anika Patel",
    initials: "AP",
    email: "anika@leafandstone.com",
    company: "Leaf & Stone Design",
    phone: "+1 310-555-0303",
    role: "Founder",
    status: "prospect",
    notes: "Found us via Google. Interested in Pinterest strategy.",
    linkedDealIds: ["deal-3"],
    createdAt: "2026-04-05",
  },
  {
    id: "contact-4",
    name: "Tom Eriksson",
    initials: "TE",
    email: "tom@nordichealthlabs.se",
    company: "Nordic Health Labs",
    phone: "+46 70-555-0404",
    role: "Co-Founder & COO",
    status: "prospect",
    notes: "Based in Stockholm. Needs FDA-compliant content for US expansion.",
    linkedDealIds: ["deal-4"],
    createdAt: "2026-03-28",
  },
  {
    id: "contact-5",
    name: "Rachel Kim",
    initials: "RK",
    email: "rachel@momentumfit.com",
    company: "Momentum Fitness",
    phone: "+1 323-555-0505",
    role: "Marketing Director",
    status: "active",
    notes: "Happy client. Strong upsell potential for Q3.",
    linkedDealIds: ["deal-5"],
    createdAt: "2026-01-10",
  },
  {
    id: "contact-6",
    name: "Daniel Moss",
    initials: "DM",
    email: "daniel@greyline.agency",
    company: "Greyline Agency",
    phone: "+1 646-555-0606",
    role: "VP of Operations",
    status: "inactive",
    notes: "Lost deal. Revisit Q3 when their in-house contract resets.",
    linkedDealIds: ["deal-6"],
    createdAt: "2026-02-20",
  },
  {
    id: "contact-7",
    name: "Suki Tanaka",
    initials: "ST",
    email: "suki@canopyfoods.jp",
    company: "Canopy Foods",
    phone: "+81 90-5555-0707",
    role: "Brand Manager",
    status: "active",
    notes: "Bilingual (EN/JP). Content needs cultural localization.",
    linkedDealIds: ["deal-7"],
    createdAt: "2026-03-10",
  },
  {
    id: "contact-8",
    name: "Priya Nair",
    initials: "PN",
    email: "priya@nairventures.in",
    company: "Nair Ventures",
    phone: "+91 98-5555-0808",
    role: "Managing Partner",
    status: "prospect",
    notes: "Referred by James Whitfield. Interested in AI content for portfolio companies.",
    linkedDealIds: [],
    createdAt: "2026-04-08",
  },
];

// ---------------------------------------------------------------------------
// Mock tasks
// ---------------------------------------------------------------------------

export const MOCK_TASKS: CrmTask[] = [
  {
    id: "task-1",
    title: "Send revised SEO article to Maria",
    description: "Apply Maria's feedback on intro paragraph and resend the 'Why SaaS Onboarding Matters' article.",
    status: "in_progress",
    priority: "high",
    dueDate: "2026-04-11",
    linkedDealId: "deal-1",
    linkedContactId: "contact-1",
    tags: ["content", "revision"],
    subtasks: [
      { id: "st-1", title: "Update intro paragraph", done: true },
      { id: "st-2", title: "Run Grammarly check", done: true },
      { id: "st-3", title: "Send via email with tracked link", done: false },
    ],
    recurrence: undefined,
    timeTrackedMinutes: 45,
    createdAt: "2026-04-03",
  },
  {
    id: "task-2",
    title: "Prepare Q2 content calendar for Peak Media",
    description: "Build out the full April–June content calendar with publishing dates, channels, and copy assignments.",
    status: "todo",
    priority: "urgent",
    dueDate: "2026-04-12",
    linkedDealId: "deal-2",
    linkedContactId: "contact-2",
    tags: ["planning", "retainer"],
    subtasks: [
      { id: "st-4", title: "Draft April schedule", done: true },
      { id: "st-5", title: "Draft May schedule", done: false },
      { id: "st-6", title: "Draft June schedule", done: false },
      { id: "st-7", title: "Get James's sign-off", done: false },
    ],
    recurrence: undefined,
    timeTrackedMinutes: 90,
    createdAt: "2026-04-01",
  },
  {
    id: "task-3",
    title: "Follow up with Anika Patel",
    description: "Send a follow-up email with case studies relevant to interior design / lifestyle brands.",
    status: "todo",
    priority: "medium",
    dueDate: "2026-04-15",
    linkedDealId: "deal-3",
    linkedContactId: "contact-3",
    tags: ["outreach", "lead"],
    subtasks: [
      { id: "st-8", title: "Select 2 relevant case studies", done: false },
      { id: "st-9", title: "Write personalized email", done: false },
    ],
    recurrence: undefined,
    timeTrackedMinutes: 0,
    createdAt: "2026-04-07",
  },
  {
    id: "task-4",
    title: "Follow up with Tom on proposal",
    description: "Tom said he'd decide by April 12. If no reply, send a gentle nudge.",
    status: "todo",
    priority: "high",
    dueDate: "2026-04-13",
    linkedDealId: "deal-4",
    linkedContactId: "contact-4",
    tags: ["outreach", "proposal"],
    subtasks: [
      { id: "st-10", title: "Draft follow-up email", done: false },
      { id: "st-11", title: "Prepare alternative package if needed", done: false },
    ],
    recurrence: undefined,
    timeTrackedMinutes: 15,
    createdAt: "2026-04-05",
  },
  {
    id: "task-5",
    title: "Send Q3 retainer proposal to Rachel",
    description: "Rachel loved the blog relaunch. Propose ongoing monthly retainer for Q3.",
    status: "done",
    priority: "medium",
    dueDate: "2026-04-01",
    linkedDealId: "deal-5",
    linkedContactId: "contact-5",
    tags: ["upsell", "proposal"],
    subtasks: [
      { id: "st-12", title: "Draft retainer proposal", done: true },
      { id: "st-13", title: "Include performance metrics from Q1", done: true },
      { id: "st-14", title: "Send via email", done: true },
    ],
    recurrence: undefined,
    timeTrackedMinutes: 60,
    createdAt: "2026-03-28",
  },
  {
    id: "task-6",
    title: "Submit revision round 2 to Suki",
    description: "Apply cultural adjustments from JP review and resubmit all 3 content pieces.",
    status: "in_progress",
    priority: "high",
    dueDate: "2026-04-10",
    linkedDealId: "deal-7",
    linkedContactId: "contact-7",
    tags: ["content", "revision", "localization"],
    subtasks: [
      { id: "st-15", title: "Update SEO article cultural refs", done: true },
      { id: "st-16", title: "Revise ad copy tone", done: true },
      { id: "st-17", title: "Final bilingual proofread", done: false },
    ],
    recurrence: undefined,
    timeTrackedMinutes: 120,
    createdAt: "2026-04-02",
  },
  {
    id: "task-7",
    title: "Weekly pipeline review",
    description: "Review all active deals, update stages, and plan outreach for the week.",
    status: "todo",
    priority: "medium",
    dueDate: "2026-04-14",
    linkedDealId: undefined,
    linkedContactId: undefined,
    tags: ["process", "weekly"],
    subtasks: [
      { id: "st-18", title: "Review each deal stage", done: false },
      { id: "st-19", title: "Update CRM notes", done: false },
      { id: "st-20", title: "Plan outreach emails", done: false },
    ],
    recurrence: { frequency: "weekly", nextDate: "2026-04-21" },
    timeTrackedMinutes: 0,
    createdAt: "2026-04-07",
  },
  {
    id: "task-8",
    title: "Reach out to Priya Nair (referral)",
    description: "James referred Priya. Send intro email and schedule a discovery call.",
    status: "todo",
    priority: "medium",
    dueDate: "2026-04-16",
    linkedDealId: undefined,
    linkedContactId: "contact-8",
    tags: ["outreach", "referral"],
    subtasks: [
      { id: "st-21", title: "Draft intro email mentioning James", done: false },
      { id: "st-22", title: "Include AI content portfolio link", done: false },
      { id: "st-23", title: "Propose 3 meeting times", done: false },
    ],
    recurrence: undefined,
    timeTrackedMinutes: 0,
    createdAt: "2026-04-08",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getDealsForStage(deals: Deal[], stage: DealStage): Deal[] {
  return deals.filter((d) => d.stage === stage);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function getContentProgress(
  project: SmartlyQProject | undefined,
): { done: number; total: number; percent: number } {
  if (!project || project.items.length === 0) {
    return { done: 0, total: 0, percent: 0 };
  }
  const done = project.items.filter(
    (i) => i.status === "approved" || i.status === "published",
  ).length;
  const total = project.items.length;
  return { done, total, percent: Math.round((done / total) * 100) };
}
