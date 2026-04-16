import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

// Types

export interface ApiStage {
  id: number;
  stage_key: string;
  label: string;
  color: string;
  sort_order: number;
}

export interface ApiDeal {
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

export interface ApiCommunication {
  id: number;
  deal_id: number;
  message: string;
  sender: string;
  comm_date: string;
}

export interface ApiContentItem {
  id: number;
  title: string;
  type: string;
  status: string;
  word_count: number;
  content: string;
  sort_order: number;
}

export interface ApiProject {
  id: number;
  name: string;
  deal_id: number | null;
  deal_name: string | null;
  item_count: number;
  created_at: string;
}

export interface ApiDealDetail {
  deal: ApiDeal;
  communications: ApiCommunication[];
  project: (ApiProject & { content_items: ApiContentItem[] }) | null;
}

export interface ApiContact {
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
  secondary_phone: string;
  secondary_phone_type: string;
  secondary_phone_country_code: string;
  role: string;
  status: string;
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

export interface ApiContactDetail {
  contact: ApiContact;
  deal_ids: number[];
}

export interface ApiTask {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string | null;
  linked_deal_id: number | null;
  linked_contact_id: number | null;
  assigned_to: number | null;
  assignee_name: string;
  assignee_avatar: string;
  tags: string[];
  subtasks: { title: string; done: boolean }[];
  recurrence: string | null;
  time_tracked_minutes: number;
  sort_order: number;
  created_at: string;
}

export interface ApiDealCountByStage {
  stage: string;
  count: number;
  value: number;
}

export interface ApiDashboardCrm {
  total_pipeline_value: number;
  won_revenue: number;
  deal_count_by_stage: ApiDealCountByStage[];
  active_deals_count: number;
  total_contacts: number;
  total_tasks: number;
  open_tasks: number;
  overdue_tasks: number;
  tasks_due_this_week: number;
  recent_activity: Record<string, unknown>[];
}

export interface ApiSaveResponse {
  message: string;
  id?: number;
}

export interface CsvPreviewResponse {
  headers: string[];
  preview_rows: Record<string, string>[];
  total_count: number;
  suggested_mapping: Record<string, string | null>;
}

export interface CsvImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: { row: number; message: string }[];
}

export interface ApiDeletedContact extends ApiContact {
  deleted_at: string;
}

// Helpers

const inv = (key: string) =>
  queryClient.invalidateQueries({ queryKey: ["crm", key] });

export const invalidateAllCrm = () =>
  queryClient.invalidateQueries({ queryKey: ["crm"] });

// Stages

export function useCrmStages() {
  return useQuery({
    queryKey: ["crm", "stages"],
    queryFn: () => apiClient.get<{ stages: ApiStage[] }>("/api/spa/crm/stages"),
  });
}

export function useCrmStagesSave() {
  return useMutation({
    mutationFn: (stages: Omit<ApiStage, "id">[]) =>
      apiClient.post<ApiSaveResponse>("/api/spa/crm/stages/save", { stages }),
    onSuccess: () => { inv("stages"); inv("deals"); },
  });
}

// Deals

export function useCrmDeals(params?: { stage?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["crm", "deals", params ?? {}],
    queryFn: () => {
      const sp = new URLSearchParams();
      if (params?.stage) sp.set("stage", params.stage);
      if (params?.page) sp.set("page", String(params.page));
      if (params?.limit) sp.set("limit", String(params.limit));
      const qs = sp.toString();
      return apiClient.get<{ deals: ApiDeal[]; pagination: { page: number; limit: number; total: number; pages: number } }>(`/api/spa/crm/deals${qs ? `?${qs}` : ""}`);
    },
  });
}

export function useCrmDealGet(id: number | null) {
  return useQuery({
    queryKey: ["crm", "deals", "detail", id],
    queryFn: () => apiClient.get<ApiDealDetail>(`/api/spa/crm/deals/get?id=${id}`),
    enabled: id !== null,
  });
}

export function useCrmDealSave() {
  return useMutation({
    mutationFn: (body: Partial<ApiDeal>) =>
      apiClient.post<ApiSaveResponse>("/api/spa/crm/deals/save", body),
    onMutate: async (body) => {
      if (!body.id || !body.stage) return;
      await queryClient.cancelQueries({ queryKey: ["crm", "deals"] });
      const queries = queryClient.getQueriesData<{ deals: ApiDeal[] }>({ queryKey: ["crm", "deals"] });
      const snapshots = queries.map(([key, data]) => ({ key, data }));
      for (const [key, data] of queries) {
        if (!data?.deals) continue;
        queryClient.setQueryData(key, {
          ...data,
          deals: data.deals.map((d) => (d.id === body.id ? { ...d, stage: body.stage! } : d)),
        });
      }
      return { snapshots };
    },
    onError: (_err, _body, ctx) => {
      if (ctx?.snapshots) {
        for (const { key, data } of ctx.snapshots) queryClient.setQueryData(key, data);
      }
    },
    onSettled: () => { inv("deals"); inv("dashboard"); },
  });
}

export function useCrmDealDelete() {
  return useMutation({
    mutationFn: (id: number) => apiClient.post<ApiSaveResponse>("/api/spa/crm/deals/delete", { id }),
    onSuccess: () => { inv("deals"); inv("dashboard"); },
  });
}

// Contacts

export function useCrmContacts(params?: { status?: string; search?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["crm", "contacts", params ?? {}],
    queryFn: () => {
      const sp = new URLSearchParams();
      if (params?.status) sp.set("status", params.status);
      if (params?.search) sp.set("search", params.search);
      if (params?.page) sp.set("page", String(params.page));
      if (params?.limit) sp.set("limit", String(params.limit));
      const qs = sp.toString();
      return apiClient.get<{ contacts: ApiContact[]; pagination: { page: number; limit: number; total: number; pages: number } }>(`/api/spa/crm/contacts${qs ? `?${qs}` : ""}`);
    },
  });
}

export function useCrmContactGet(id: number | null) {
  return useQuery({
    queryKey: ["crm", "contact", id],
    queryFn: () => apiClient.get<ApiContactDetail>(`/api/spa/crm/contacts/get?id=${id}`),
    enabled: id !== null,
  });
}

export function useCrmContactSave() {
  return useMutation({
    mutationFn: (body: Partial<ApiContact>) =>
      apiClient.post<ApiSaveResponse>("/api/spa/crm/contacts/save", body),
    onSuccess: () => { inv("contacts"); inv("dashboard"); },
  });
}

export function useCrmContactAvatarUpload() {
  return useMutation({
    mutationFn: (data: { contactId: number; file: File }) => {
      const fd = new FormData();
      fd.append("contact_id", String(data.contactId));
      fd.append("avatar", data.file);
      return apiClient.upload<{ avatar_url: string }>("/api/spa/crm/contacts/avatar", fd);
    },
    onSuccess: () => inv("contacts"),
  });
}

export function useCrmContactDelete() {
  return useMutation({
    mutationFn: (id: number) => apiClient.post<ApiSaveResponse>("/api/spa/crm/contacts/delete", { id }),
    onSuccess: () => { inv("contacts"); inv("deals"); inv("dashboard"); },
  });
}

export function useCrmContactLinkDeal() {
  return useMutation({
    mutationFn: (body: { contact_id: number; deal_id: number }) =>
      apiClient.post<ApiSaveResponse>("/api/spa/crm/contacts/link-deal", body),
    onSuccess: () => { inv("contacts"); inv("deals"); },
  });
}

export function useCrmContactUnlinkDeal() {
  return useMutation({
    mutationFn: (body: { contact_id: number; deal_id: number }) =>
      apiClient.post<ApiSaveResponse>("/api/spa/crm/contacts/unlink-deal", body),
    onSuccess: () => { inv("contacts"); inv("deals"); },
  });
}

// Communications

export function useCrmCommunicationAdd() {
  return useMutation({
    mutationFn: (body: { deal_id: number; message: string; sender: string }) =>
      apiClient.post<ApiSaveResponse>("/api/spa/crm/communications/add", body),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["crm", "deal", vars.deal_id] });
    },
  });
}

export function useCrmCommunicationDelete() {
  return useMutation({
    mutationFn: (body: { id: number; deal_id: number }) =>
      apiClient.post<ApiSaveResponse>("/api/spa/crm/communications/delete", body),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["crm", "deal", vars.deal_id] });
    },
  });
}

// Projects

export function useCrmProjects(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["crm", "projects", params ?? {}],
    queryFn: () => {
      const sp = new URLSearchParams();
      if (params?.page) sp.set("page", String(params.page));
      if (params?.limit) sp.set("limit", String(params.limit));
      const qs = sp.toString();
      return apiClient.get<{ projects: ApiProject[]; pagination: { page: number; limit: number; total: number; pages: number } }>(`/api/spa/crm/projects${qs ? `?${qs}` : ""}`);
    },
  });
}

export function useCrmProjectGet(id: number | null) {
  return useQuery({
    queryKey: ["crm", "projects", "detail", id],
    queryFn: () =>
      apiClient.get<{ project: ApiProject & { content_items: ApiContentItem[] } }>(
        `/api/spa/crm/projects/get?id=${id}`,
      ),
    enabled: id !== null,
  });
}

export function useCrmProjectSave() {
  return useMutation({
    mutationFn: (body: { id?: number; name?: string; deal_id?: number }) =>
      apiClient.post<ApiSaveResponse>("/api/spa/crm/projects/save", body),
    onSuccess: () => { inv("projects"); inv("deals"); },
  });
}

export function useCrmProjectDelete() {
  return useMutation({
    mutationFn: (id: number) => apiClient.post<ApiSaveResponse>("/api/spa/crm/projects/delete", { id }),
    onSuccess: () => { inv("projects"); inv("deals"); },
  });
}

// Content Items

export function useCrmContentItemSave() {
  return useMutation({
    mutationFn: (body: Partial<ApiContentItem> & { project_id: number }) =>
      apiClient.post<ApiSaveResponse>("/api/spa/crm/content-items/save", body),
    onSuccess: () => {
      inv("projects");
      queryClient.invalidateQueries({ queryKey: ["crm", "deal"] });
    },
  });
}

export function useCrmContentItemDelete() {
  return useMutation({
    mutationFn: (body: { id: number; project_id: number }) =>
      apiClient.post<ApiSaveResponse>("/api/spa/crm/content-items/delete", body),
    onSuccess: () => {
      inv("projects");
      queryClient.invalidateQueries({ queryKey: ["crm", "deal"] });
    },
  });
}

export function useCrmContentItemStatus() {
  return useMutation({
    mutationFn: (body: { id: number; project_id: number; status: string }) =>
      apiClient.post<ApiSaveResponse>("/api/spa/crm/content-items/status", body),
    onSuccess: () => {
      inv("projects");
      queryClient.invalidateQueries({ queryKey: ["crm", "deal"] });
    },
  });
}

// Tasks

export function useCrmTasks(params?: { status?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["crm", "tasks", params ?? {}],
    queryFn: () => {
      const sp = new URLSearchParams();
      if (params?.status) sp.set("status", params.status);
      if (params?.page) sp.set("page", String(params.page));
      if (params?.limit) sp.set("limit", String(params.limit));
      const qs = sp.toString();
      return apiClient.get<{ tasks: ApiTask[]; pagination: { page: number; limit: number; total: number; pages: number } }>(`/api/spa/crm/tasks${qs ? `?${qs}` : ""}`);
    },
  });
}

export function useCrmTaskSave() {
  return useMutation({
    mutationFn: (body: Partial<ApiTask>) =>
      apiClient.post<ApiSaveResponse>("/api/spa/crm/tasks/save", body),
    onSuccess: () => { inv("tasks"); inv("dashboard"); },
  });
}

export function useCrmTaskDelete() {
  return useMutation({
    mutationFn: (id: number) => apiClient.post<ApiSaveResponse>("/api/spa/crm/tasks/delete", { id }),
    onSuccess: () => { inv("tasks"); inv("dashboard"); },
  });
}

export function useCrmTaskReorder() {
  return useMutation({
    mutationFn: (ids: number[]) => apiClient.post<ApiSaveResponse>("/api/spa/crm/tasks/reorder", { ids }),
    onSuccess: () => inv("tasks"),
  });
}

export function useCrmTaskTimer() {
  return useMutation({
    mutationFn: (body: { id: number; action: "start" | "stop" }) =>
      apiClient.post<ApiSaveResponse>("/api/spa/crm/tasks/timer", body),
    onSuccess: () => { inv("tasks"); },
  });
}

// Dashboard

export function useCrmDashboard() {
  return useQuery({
    queryKey: ["crm", "dashboard"],
    queryFn: () => apiClient.get<{ dashboard: ApiDashboardCrm }>("/api/spa/crm/dashboard"),
  });
}

// Import

export function useCrmContactImportPreview() {
  return useMutation({
    mutationFn: (formData: FormData) =>
      apiClient.upload<CsvPreviewResponse>("/api/spa/crm/contacts/import/preview", formData),
  });
}

export function useCrmContactImportExecute() {
  return useMutation({
    mutationFn: (formData: FormData) =>
      apiClient.upload<CsvImportResult>("/api/spa/crm/contacts/import/execute", formData),
    onSuccess: () => { inv("contacts"); inv("dashboard"); },
  });
}

// Export

export async function exportCrmContacts(params?: { status?: string; search?: string }) {
  const sp = new URLSearchParams();
  if (params?.status) sp.set("status", params.status);
  if (params?.search) sp.set("search", params.search);
  const qs = sp.toString();
  const token = localStorage.getItem("sq_access_token");
  const res = await fetch(`/api/spa/crm/contacts/export${qs ? `?${qs}` : ""}`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });
  if (!res.ok) throw new Error("Export failed");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `contacts-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Deleted / Restore

export function useCrmDeletedContacts() {
  return useQuery({
    queryKey: ["crm", "contacts", "deleted"],
    queryFn: () =>
      apiClient.get<{ contacts: ApiDeletedContact[]; pagination: Record<string, unknown> }>(
        "/api/spa/crm/contacts/deleted",
      ),
  });
}

export function useCrmContactRestore() {
  return useMutation({
    mutationFn: (body: { id?: number; ids?: number[] }) =>
      apiClient.post<ApiSaveResponse>("/api/spa/crm/contacts/restore", body),
    onSuccess: () => {
      inv("contacts");
      queryClient.invalidateQueries({ queryKey: ["crm", "contacts", "deleted"] });
      inv("dashboard");
    },
  });
}

export function useCrmContactPermanentDelete() {
  return useMutation({
    mutationFn: (id: number) =>
      apiClient.post<ApiSaveResponse>("/api/spa/crm/contacts/permanent-delete", { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm", "contacts", "deleted"] });
    },
  });
}
