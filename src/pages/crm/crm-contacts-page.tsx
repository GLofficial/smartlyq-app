import { useState, useCallback } from "react";
import {
  useCrmContacts,
  useCrmContactDelete,
  useCrmContactStats,
  exportCrmContacts,
  type ApiContact,
} from "@/api/crm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Trash2, ArrowUpDown, Loader2, Upload, Download, RotateCcw, ChevronLeft, ChevronRight, Tag, SlidersHorizontal, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { ContactDetailSheet } from "./components/contact-detail-sheet";
import { ContactCreateDialog } from "./components/contact-create-dialog";
import { ContactImportDialog } from "./components/contact-import-dialog";
import { DeletedContactsDialog } from "./components/deleted-contacts-dialog";
import { ManageFieldsPanel, getDefaultFields, type FieldConfig } from "./components/manage-fields-panel";
import { AdvancedFiltersPanel, type FilterRule } from "./components/advanced-filters-panel";

const STATUS_STYLE: Record<string, string> = {
  active: "bg-green-50 text-green-700 border-green-200",
  prospect: "bg-blue-50 text-blue-600 border-blue-200",
  in_progress: "bg-amber-50 text-amber-700 border-amber-200",
  lost: "bg-red-50 text-red-600 border-red-200",
};
const STATUS_LABEL: Record<string, string> = {
  active: "Active", prospect: "Prospect", in_progress: "In Progress", lost: "Lost",
};
const PER_PAGE_OPTIONS = [20, 50, 100] as const;

export function CrmContactsPage() {
  // Server-side pagination state
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<number>(50);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [tagFilter, setTagFilter] = useState<string>("");
  const [sortKey, setSortKey] = useState<string>("name");
  const [fields, setFields] = useState<FieldConfig[]>(getDefaultFields);
  const [manageFieldsOpen, setManageFieldsOpen] = useState(false);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [filterRules, setFilterRules] = useState<FilterRule[]>([]);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Debounce search to avoid API call per keystroke
  const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    if (searchTimer) clearTimeout(searchTimer);
    setSearchTimer(setTimeout(() => { setDebouncedSearch(val); setPage(1); }, 400));
  }, [searchTimer]);

  // Fetch from server with pagination
  const { data: stats } = useCrmContactStats();
  const { data, isLoading } = useCrmContacts({
    page,
    limit: perPage,
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    tag: tagFilter || undefined,
  });
  const deleteContactMut = useCrmContactDelete();

  const contacts = data?.contacts ?? [];
  const pagination = data?.pagination ?? { page: 1, limit: 50, total: 0, pages: 1 };
  const availableTags: string[] = (data as any)?.available_tags ?? [];
  const visibleFields = fields.filter((f: FieldConfig) => f.visible);

  // Client-side sort (server returns page, we sort within page for instant feedback)
  const sorted = [...contacts].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "name") cmp = a.name.localeCompare(b.name);
    else if (sortKey === "company") cmp = a.company.localeCompare(b.company);
    else if (sortKey === "status") cmp = a.status.localeCompare(b.status);
    else cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    return sortDir === "asc" ? cmp : -cmp;
  });

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ApiContact | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [deletedOpen, setDeletedOpen] = useState(false);

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteContactMut.mutate(deleteTarget.id, {
      onSuccess: () => { toast.success("Contact deleted"); setDeleteTarget(null); },
      onError: () => toast.error("Failed to delete contact"),
    });
  }

  function handlePerPageChange(val: string) {
    setPerPage(Number(val));
    setPage(1);
  }

  function handleStatusChange(val: string) {
    setStatusFilter(val === "all" ? "" : val);
    setPage(1);
  }

  function handleApplyFilters() {
    // Build tag filter from advanced filter rules
    const tagRule = filterRules.find((r) => r.field === "tags" && r.value);
    setTagFilter(tagRule?.value ?? "");
    // Build status from advanced filter rules
    const statusRule = filterRules.find((r) => r.field === "status" && r.value);
    if (statusRule) setStatusFilter(statusRule.value);
    setPage(1);
  }

  function renderCell(key: string, c: ApiContact): React.ReactNode {
    switch (key) {
      case "name": return (
        <div className="flex items-center gap-3">
          {c.avatar ? <img src={c.avatar} alt={c.name} className="h-8 w-8 rounded-full object-cover shrink-0" />
            : <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--sq-primary)]/10 text-[var(--sq-primary)] text-xs font-bold shrink-0">{c.initials || c.name.slice(0, 2).toUpperCase()}</div>}
          <p className="text-sm font-medium truncate">{c.name}</p>
        </div>
      );
      case "email": return <span className="text-xs text-[var(--muted-foreground)]">{c.email || "—"}</span>;
      case "phone": return <span className="text-xs text-[var(--muted-foreground)]">{c.phone || "—"}</span>;
      case "company": return <span className="text-xs">{c.company || "—"}</span>;
      case "role": return <span className="text-xs text-[var(--muted-foreground)]">{c.role || "—"}</span>;
      case "status": return <Badge variant="outline" className={STATUS_STYLE[c.status] ?? ""}>{STATUS_LABEL[c.status] ?? c.status}</Badge>;
      case "contact_type": return <span className="text-xs text-[var(--muted-foreground)]">{(c as any).contact_type || "—"}</span>;
      case "timezone": return <span className="text-xs text-[var(--muted-foreground)]">{(c as any).timezone || "—"}</span>;
      case "created_at": return <span className="text-xs text-[var(--muted-foreground)]">{formatDate(c.created_at)}</span>;
      case "last_contacted_at": return <span className="text-xs text-[var(--muted-foreground)]">{c.last_contacted_at ? timeAgo(c.last_contacted_at) : "—"}</span>;
      case "tags": return (
        <div className="flex flex-wrap gap-1">
          {c.tags.slice(0, 2).map((t) => <Badge key={t} variant="outline" className="text-[10px] px-1.5 py-0 bg-[var(--muted)]"><Tag className="w-2.5 h-2.5 mr-0.5" />{t}</Badge>)}
          {c.tags.length > 2 && <span className="text-[10px] text-[var(--muted-foreground)]">+{c.tags.length - 2}</span>}
        </div>
      );
      case "deals": return <span className="text-xs">{c.deal_count > 0 ? `${c.deal_count} deal${c.deal_count > 1 ? "s" : ""}` : "None"}</span>;
      case "secondary_email": return <span className="text-xs text-[var(--muted-foreground)]">{(c as any).secondary_email || "—"}</span>;
      case "secondary_phone": return <span className="text-xs text-[var(--muted-foreground)]">{(c as any).secondary_phone || "—"}</span>;
      case "phone_country_code": return <span className="text-xs text-[var(--muted-foreground)]">{(c as any).phone_country_code || "—"}</span>;
      default: return "—";
    }
  }

  const selectedContact = selectedContactId ? contacts.find((c) => c.id === selectedContactId) ?? null : null;
  const startRow = (pagination.page - 1) * pagination.limit + 1;
  const endRow = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Contacts</h1>
          <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mt-1">
            <span><span className="font-medium text-[var(--foreground)]">{(stats?.all ?? pagination.total).toLocaleString()}</span> contacts total</span>
            {!!stats && stats.new_this_week > 0 && (
              <>
                <span className="inline-flex items-center gap-1.5 text-[var(--muted-foreground)]">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-emerald-600 font-medium">+{stats.new_this_week}</span> this week
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)} className="gap-1.5"><Upload className="w-4 h-4" />Import</Button>
          <Button variant="outline" size="sm" onClick={() => { exportCrmContacts(); toast.success("Downloading..."); }} className="gap-1.5"><Download className="w-4 h-4" />Export</Button>
          <Button variant="outline" size="sm" onClick={() => setDeletedOpen(true)} className="gap-1.5"><RotateCcw className="w-4 h-4" />Restore</Button>
          <Button onClick={() => setCreateOpen(true)} className="gap-1.5"><Plus className="w-4 h-4" />Add Contact</Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard label="All contacts" value={stats?.all ?? pagination.total} delta={stats?.deltas.all} tint="blue" />
        <StatCard label="Prospects" value={stats?.prospects ?? 0} delta={stats?.deltas.prospects} tint="violet" />
        <StatCard label="Customers" value={stats?.customers ?? 0} delta={stats?.deltas.customers} tint="emerald" />
        <StatCard label="Churned" value={stats?.churned ?? 0} delta={stats?.deltas.churned} tint="rose" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
          <Input placeholder="Search by name, email, company, or tag..." value={search} onChange={(e) => handleSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter || "all"} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="prospect">Prospect</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={() => setAdvancedFiltersOpen(true)} className="gap-1.5">
          <SlidersHorizontal size={14} /> Advanced Filters
          {filterRules.length > 0 && <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--sq-primary)] text-[9px] text-white">{filterRules.length}</span>}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setManageFieldsOpen(true)} className="gap-1.5">
          <Settings2 size={14} /> Manage Fields
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-[var(--muted-foreground)]" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {visibleFields.map((f) => (
                    <TableHead key={f.key}>
                      {["name", "company", "status", "created_at"].includes(f.key) ? (
                        <button onClick={() => toggleSort(f.key === "created_at" ? "created" : f.key)} className="flex items-center gap-1 hover:text-[var(--foreground)]">
                          {f.label} <ArrowUpDown className="w-3.5 h-3.5" />
                        </button>
                      ) : f.label}
                    </TableHead>
                  ))}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.length === 0 && (
                  <TableRow><TableCell colSpan={visibleFields.length + 1} className="text-center py-8 text-[var(--muted-foreground)]">No contacts found.</TableCell></TableRow>
                )}
                {sorted.map((c) => (
                  <TableRow key={c.id} className="cursor-pointer hover:bg-[var(--muted)]/30" onClick={() => setSelectedContactId(c.id)}>
                    {visibleFields.map((f: FieldConfig) => (
                      <TableCell key={f.key}>{renderCell(f.key, c)}</TableCell>
                    ))}
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); setDeleteTarget(c); }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination Bar */}
      {pagination.total > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <span>Showing {startRow}–{endRow} of {pagination.total}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[var(--muted-foreground)]">Per page:</span>
              <Select value={String(perPage)} onValueChange={handlePerPageChange}>
                <SelectTrigger className="w-[70px] h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PER_PAGE_OPTIONS.map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="h-8 w-8 p-0">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {/* Page numbers */}
              {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
                let pageNum: number;
                if (pagination.pages <= 7) { pageNum = i + 1; }
                else if (page <= 4) { pageNum = i + 1; }
                else if (page >= pagination.pages - 3) { pageNum = pagination.pages - 6 + i; }
                else { pageNum = page - 3 + i; }
                return (
                  <Button key={pageNum} variant={pageNum === page ? "default" : "outline"} size="sm"
                    onClick={() => setPage(pageNum)} className="h-8 w-8 p-0 text-xs">
                    {pageNum}
                  </Button>
                );
              })}
              <Button variant="outline" size="sm" disabled={page >= pagination.pages} onClick={() => setPage(page + 1)} className="h-8 w-8 p-0">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <span className="text-xs text-[var(--muted-foreground)]">Page {page} of {pagination.pages}</span>
          </div>
        </div>
      )}

      <ContactDetailSheet contact={selectedContact} onClose={() => setSelectedContactId(null)} />
      <ContactCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.name}"? This contact will be moved to trash.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <ContactImportDialog open={importOpen} onOpenChange={setImportOpen} />
      <DeletedContactsDialog open={deletedOpen} onOpenChange={setDeletedOpen} />
      <ManageFieldsPanel open={manageFieldsOpen} onClose={() => setManageFieldsOpen(false)} fields={fields} onFieldsChange={setFields} />
      <AdvancedFiltersPanel open={advancedFiltersOpen} onClose={() => setAdvancedFiltersOpen(false)} filters={filterRules} onFiltersChange={setFilterRules} onApply={handleApplyFilters} availableTags={availableTags} />
    </div>
  );
}

function formatDate(d: string): string {
  try { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
  catch { return d; }
}

function timeAgo(d: string): string {
  try {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 5) return `${weeks}w ago`;
    const months = Math.floor(days / 30);
    return months < 12 ? `${months}mo ago` : `${Math.floor(months / 12)}y ago`;
  } catch { return d; }
}

const STAT_TINTS: Record<string, { pill: string; text: string }> = {
  blue:    { pill: "bg-blue-50 text-blue-600",       text: "text-blue-600" },
  violet:  { pill: "bg-violet-50 text-violet-600",   text: "text-violet-600" },
  emerald: { pill: "bg-emerald-50 text-emerald-600", text: "text-emerald-600" },
  rose:    { pill: "bg-rose-50 text-rose-600",       text: "text-rose-600" },
};

function StatCard({ label, value, delta, tint }: { label: string; value: number; delta?: number; tint: "blue" | "violet" | "emerald" | "rose" }) {
  const t = STAT_TINTS[tint]!;
  const hasDelta = typeof delta === "number" && isFinite(delta);
  const up = (delta ?? 0) >= 0;
  const pillCls = !hasDelta
    ? "bg-[var(--muted)] text-[var(--muted-foreground)]"
    : up
      ? t.pill
      : "bg-rose-50 text-rose-600";
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-5 py-4 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs text-[var(--muted-foreground)] truncate">{label}</p>
        <p className="text-2xl font-bold text-[var(--foreground)] mt-0.5 font-mono">
          {(value ?? 0).toLocaleString()}
        </p>
      </div>
      {hasDelta && (
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${pillCls}`}>
          {up ? "+" : ""}{(delta as number).toFixed(1)}%
        </span>
      )}
    </div>
  );
}
