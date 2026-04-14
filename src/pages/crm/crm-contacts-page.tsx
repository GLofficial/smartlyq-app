import { useState, useMemo } from "react";
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
import { Search, Plus, Trash2, ArrowUpDown, Building2, Loader2, Upload, Download, RotateCcw, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { ContactDetailSheet } from "./components/contact-detail-sheet";
import { ContactCreateDialog } from "./components/contact-create-dialog";
import { ContactImportDialog } from "./components/contact-import-dialog";
import { DeletedContactsDialog } from "./components/deleted-contacts-dialog";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const STATUS_STYLE: Record<string, string> = {
  active: "bg-green-50 text-green-700 border-green-200",
  prospect: "bg-blue-50 text-blue-600 border-blue-200",
  in_progress: "bg-amber-50 text-amber-700 border-amber-200",
  lost: "bg-red-50 text-red-600 border-red-200",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  prospect: "Prospect",
  in_progress: "In Progress",
  lost: "Lost",
};

type SortKey = "name" | "company" | "status" | "created";
type SortDir = "asc" | "desc";


// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export function CrmContactsPage() {
  const { data: contactsData, isLoading: contactsLoading } = useCrmContacts();
  const deleteContactMut = useCrmContactDelete();

  const contacts = contactsData?.contacts ?? [];

  const [search, setSearch] = useState("");
  const [searchField, setSearchField] = useState<"all" | "name" | "email" | "company">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ApiContact | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [deletedOpen, setDeletedOpen] = useState(false);


  // --- Filtering & sorting ---
  const filtered = useMemo(() => {
    let list = [...contacts];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => {
        if (searchField === "name") return c.name.toLowerCase().includes(q);
        if (searchField === "email") return c.email.toLowerCase().includes(q);
        if (searchField === "company") return c.company.toLowerCase().includes(q);
        return (
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q) ||
          c.role.toLowerCase().includes(q)
        );
      });
    }

    if (statusFilter !== "all") {
      list = list.filter((c) => c.status === statusFilter);
    }

    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "company") cmp = a.company.localeCompare(b.company);
      else if (sortKey === "status") cmp = a.status.localeCompare(b.status);
      else cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [contacts, search, searchField, statusFilter, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }


  function handleDelete() {
    if (!deleteTarget) return;
    deleteContactMut.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Contact deleted");
        setDeleteTarget(null);
      },
      onError: () => toast.error("Failed to delete contact"),
    });
  }

  const selectedContact = selectedContactId
    ? contacts.find((c) => c.id === selectedContactId) ?? null
    : null;

  if (contactsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--muted-foreground)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Contacts</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {contacts.length} contact{contacts.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
            <Upload className="w-4 h-4 mr-1.5" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={() => { exportCrmContacts(); toast.success("Downloading..."); }}>
            <Download className="w-4 h-4 mr-1.5" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => setDeletedOpen(true)}>
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Restore
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={searchField} onValueChange={(v) => setSearchField(v as typeof searchField)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Search in..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All fields</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="company">Company</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button
                    onClick={() => toggleSort("name")}
                    className="flex items-center gap-1 hover:text-[var(--foreground)] transition-colors"
                  >
                    Contact <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>
                  <button
                    onClick={() => toggleSort("company")}
                    className="flex items-center gap-1 hover:text-[var(--foreground)] transition-colors"
                  >
                    Company <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </TableHead>
                <TableHead>Role</TableHead>
                <TableHead>
                  <button
                    onClick={() => toggleSort("status")}
                    className="flex items-center gap-1 hover:text-[var(--foreground)] transition-colors"
                  >
                    Status <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </TableHead>
                <TableHead>Deals</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-[var(--muted-foreground)]">
                    No contacts found.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((contact) => (
                <TableRow
                  key={contact.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedContactId(contact.id)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-xs font-semibold shrink-0 overflow-hidden">
                        {contact.avatar && contact.avatar.length > 2 ? (
                          <img src={contact.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          contact.initials
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-[var(--foreground)] truncate">
                          {contact.first_name || contact.last_name
                            ? `${contact.first_name} ${contact.last_name}`.trim()
                            : contact.name}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {contact.email ? (
                      <div className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)]">
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate max-w-[180px]">{contact.email}</span>
                      </div>
                    ) : <span className="text-xs text-[var(--muted-foreground)]">—</span>}
                  </TableCell>
                  <TableCell>
                    {contact.phone ? (
                      <div className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)]">
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span>{contact.phone}</span>
                      </div>
                    ) : <span className="text-xs text-[var(--muted-foreground)]">—</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Building2 className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                      {contact.company}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-[var(--muted-foreground)]">
                    {contact.role}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={STATUS_STYLE[contact.status] ?? ""}>
                      {STATUS_LABEL[contact.status] ?? contact.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {contact.deal_count > 0 ? (
                      <span className="text-sm font-medium">{contact.deal_count}</span>
                    ) : (
                      <span className="text-xs text-[var(--muted-foreground)]">None</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(contact);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Contact detail sheet */}
      <ContactDetailSheet
        contact={selectedContact}
        onClose={() => setSelectedContactId(null)}
      />

      {/* --- Create dialog --- */}
      <ContactCreateDialog open={createOpen} onOpenChange={setCreateOpen} />

      {/* --- Delete dialog --- */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.first_name || deleteTarget?.last_name
                ? `${deleteTarget?.first_name} ${deleteTarget?.last_name}`.trim()
                : deleteTarget?.name}"? This contact will be moved to trash. You can restore it later from the Restore menu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ContactImportDialog open={importOpen} onOpenChange={setImportOpen} />
      <DeletedContactsDialog open={deletedOpen} onOpenChange={setDeletedOpen} />
    </div>
  );
}
