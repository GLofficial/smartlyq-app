import { useState, useCallback } from "react";
import {
  useCrmContacts,
  useCrmContactDelete,
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
import { Search, Plus, Trash2, ArrowUpDown, Loader2, Upload, Download, RotateCcw, ChevronLeft, ChevronRight, Mail, Phone, Tag, Building2 } from "lucide-react";
import { toast } from "sonner";
import { ContactDetailSheet } from "./components/contact-detail-sheet";
import { ContactCreateDialog } from "./components/contact-create-dialog";
import { ContactImportDialog } from "./components/contact-import-dialog";
import { DeletedContactsDialog } from "./components/deleted-contacts-dialog";

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
  const [sortKey, setSortKey] = useState<string>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Debounce search to avoid API call per keystroke
  const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    if (searchTimer) clearTimeout(searchTimer);
    setSearchTimer(setTimeout(() => { setDebouncedSearch(val); setPage(1); }, 400));
  }, [searchTimer]);

  // Fetch from server with pagination
  const { data, isLoading } = useCrmContacts({
    page,
    limit: perPage,
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
  });
  const deleteContactMut = useCrmContactDelete();

  const contacts = data?.contacts ?? [];
  const pagination = data?.pagination ?? { page: 1, limit: 50, total: 0, pages: 1 };

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

  const selectedContact = selectedContactId ? contacts.find((c) => c.id === selectedContactId) ?? null : null;
  const startRow = (pagination.page - 1) * pagination.limit + 1;
  const endRow = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Contacts</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">{pagination.total} contact{pagination.total !== 1 ? "s" : ""} total</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}><Upload className="w-4 h-4 mr-1.5" />Import</Button>
          <Button variant="outline" size="sm" onClick={() => { exportCrmContacts(); toast.success("Downloading..."); }}><Download className="w-4 h-4 mr-1.5" />Export</Button>
          <Button variant="outline" size="sm" onClick={() => setDeletedOpen(true)}><RotateCcw className="w-4 h-4 mr-1.5" />Restore</Button>
          <Button onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4 mr-1.5" />Add Contact</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
          <Input placeholder="Search contacts..." value={search} onChange={(e) => handleSearch(e.target.value)} className="pl-9" />
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
                  <TableHead><button onClick={() => toggleSort("name")} className="flex items-center gap-1 hover:text-[var(--foreground)]">Contact <ArrowUpDown className="w-3.5 h-3.5" /></button></TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead><button onClick={() => toggleSort("company")} className="flex items-center gap-1 hover:text-[var(--foreground)]">Company <ArrowUpDown className="w-3.5 h-3.5" /></button></TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead><button onClick={() => toggleSort("status")} className="flex items-center gap-1 hover:text-[var(--foreground)]">Status <ArrowUpDown className="w-3.5 h-3.5" /></button></TableHead>
                  <TableHead><button onClick={() => toggleSort("created")} className="flex items-center gap-1 hover:text-[var(--foreground)]">Created <ArrowUpDown className="w-3.5 h-3.5" /></button></TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Deals</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.length === 0 && (
                  <TableRow><TableCell colSpan={11} className="text-center py-8 text-[var(--muted-foreground)]">No contacts found.</TableCell></TableRow>
                )}
                {sorted.map((c) => (
                  <TableRow key={c.id} className="cursor-pointer hover:bg-[var(--muted)]/30" onClick={() => setSelectedContactId(c.id)}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--sq-primary)]/10 text-[var(--sq-primary)] text-xs font-bold shrink-0">
                          {c.initials || c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{c.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{c.email && <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]"><Mail className="w-3 h-3" />{c.email}</span>}</TableCell>
                    <TableCell>{c.phone && <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]"><Phone className="w-3 h-3" />{c.phone}</span>}</TableCell>
                    <TableCell>{c.company && <span className="flex items-center gap-1 text-xs"><Building2 className="w-3 h-3 text-[var(--muted-foreground)]" />{c.company}</span>}</TableCell>
                    <TableCell><span className="text-xs text-[var(--muted-foreground)]">{c.role || "—"}</span></TableCell>
                    <TableCell><Badge variant="outline" className={STATUS_STYLE[c.status] ?? ""}>{STATUS_LABEL[c.status] ?? c.status}</Badge></TableCell>
                    <TableCell><span className="text-xs text-[var(--muted-foreground)]">{formatDate(c.created_at)}</span></TableCell>
                    <TableCell><span className="text-xs text-[var(--muted-foreground)]">{c.last_contacted_at ? timeAgo(c.last_contacted_at) : "—"}</span></TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {c.tags.slice(0, 2).map((t) => (
                          <Badge key={t} variant="outline" className="text-[10px] px-1.5 py-0 bg-[var(--muted)]"><Tag className="w-2.5 h-2.5 mr-0.5" />{t}</Badge>
                        ))}
                        {c.tags.length > 2 && <span className="text-[10px] text-[var(--muted-foreground)]">+{c.tags.length - 2}</span>}
                      </div>
                    </TableCell>
                    <TableCell><span className="text-xs">{c.deal_count > 0 ? `${c.deal_count} deal${c.deal_count > 1 ? "s" : ""}` : "None"}</span></TableCell>
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
