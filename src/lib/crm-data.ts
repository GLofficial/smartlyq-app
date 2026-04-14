// ---------------------------------------------------------------------------
// Deal-Flow CRM — Types & helpers (API-aligned, snake_case)
// ---------------------------------------------------------------------------

import { useAuthStore } from "@/stores/auth-store";

export type DealStage = string;

export interface StageConfig {
  label: string;
  color: string;
}

export interface ContentItem {
  id: number;
  title: string;
  type: string;
  status: string;
  word_count: number;
  content: string;
  sort_order: number;
}

export interface SmartlyQProject {
  id: number;
  name: string;
  deal_id: number | null;
  deal_name: string | null;
  item_count: number;
  created_at: string;
  content_items?: ContentItem[];
}

export interface Deal {
  id: number;
  client_name: string;
  client_email: string;
  client_company: string;
  value: number;
  stage: string;
  next_action_date: string | null;
  notes: string;
  project_id: number | null;
  project_name: string | null;
  created_at: string;
}

export interface Contact {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  secondary_email: string;
  company: string;
  phone: string;
  phone_type: string;
  phone_country_code: string;
  role: string;
  status: "active" | "prospect" | "in_progress" | "lost";
  contact_type: string;
  timezone: string;
  initials: string;
  avatar: string;
  tags: string[];
  deal_count: number;
  total_value: number;
  last_contacted_at: string | null;
  created_at: string;
}

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Subtask {
  title: string;
  done: boolean;
}

export interface CrmTask {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  linked_deal_id: number | null;
  linked_contact_id: number | null;
  assigned_to: number | null;
  assignee_name: string;
  assignee_avatar: string;
  tags: string[];
  subtasks: Subtask[];
  recurrence: string | null;
  time_tracked_minutes: number;
  sort_order: number;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Stage configuration — defaults (real config fetched from API)
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
// Helpers
// ---------------------------------------------------------------------------

export function getDealsForStage(deals: Deal[], stage: DealStage): Deal[] {
  return deals.filter((d) => d.stage === stage);
}

export function formatCurrency(value: number): string {
  const currency = useAuthStore.getState().currency || "USD";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
