import { useState, useMemo } from "react";
import { useCrmStore } from "@/stores/crm-store";
import type { Contact } from "@/lib/crm-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  Trash2,
  ArrowUpDown,
  Building2,
} from "lucide-react";
import { ContactDetailSheet } from "./components/contact-detail-sheet";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const STATUS_STYLE: Record<Contact["status"], string> = {
  active: "bg-green-50 text-green-700 border-green-200",
  prospect: "bg-blue-50 text-blue-600 border-blue-200",
  inactive: "bg-gray-100 text-gray-500 border-gray-200",
};

type SortKey = "name" | "company" | "status" | "created";
type SortDir = "asc" | "desc";

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export function CrmContactsPage() {
  const contacts = useCrmStore((s) => s.contacts);
  const deals = useCrmStore((s) => s.deals);
  const createContact = useCrmStore((s) => s.createContact);
  const deleteContact = useCrmStore((s) => s.deleteContact);

  const [search, setSearch] = useState("");
  const [searchField, setSearchField] = useState<"all" | "name" | "email" | "company">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Create form
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formStatus, setFormStatus] = useState<Contact["status"]>("prospect");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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
      else cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
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

  // --- Validate & create ---
  function validateForm(): boolean {
    const errors: Record<string, string> = {};
    if (!formName.trim()) errors.name = "Name is required.";
    if (!formEmail.trim()) errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmail)) errors.email = "Invalid email.";
    if (!formCompany.trim()) errors.company = "Company is required.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleCreate() {
    if (!validateForm()) return;
    const initials = formName
      .trim()
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    const contact: Contact = {
      id: `contact-${Date.now()}`,
      name: formName.trim(),
      initials,
      email: formEmail.trim(),
      company: formCompany.trim(),
      phone: formPhone.trim(),
      role: formRole.trim(),
      status: formStatus,
      notes: "",
      linkedDealIds: [],
      createdAt: new Date().toISOString().slice(0, 10),
    };
    createContact(contact);
    resetForm();
    setCreateOpen(false);
  }

  function resetForm() {
    setFormName("");
    setFormEmail("");
    setFormCompany("");
    setFormPhone("");
    setFormRole("");
    setFormStatus("prospect");
    setFormErrors({});
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteContact(deleteTarget.id);
    setDeleteTarget(null);
  }

  // Keep selectedContact in sync with store
  const liveSelectedContact = selectedContact
    ? contacts.find((c) => c.id === selectedContact.id) ?? null
    : null;

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
        <Button onClick={() => { resetForm(); setCreateOpen(true); }}>
          <Plus className="w-4 h-4 mr-1.5" />
          Add Contact
        </Button>
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
            <SelectItem value="inactive">Inactive</SelectItem>
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
                  <TableCell colSpan={6} className="text-center py-8 text-[var(--muted-foreground)]">
                    No contacts found.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((contact) => {
                const linkedDeals = deals.filter((d) =>
                  contact.linkedDealIds.includes(d.id),
                );
                return (
                  <TableRow
                    key={contact.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedContact(contact)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-xs font-semibold shrink-0">
                          {contact.initials}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-[var(--foreground)] truncate">
                            {contact.name}
                          </div>
                          <div className="text-xs text-[var(--muted-foreground)] truncate">
                            {contact.email}
                          </div>
                        </div>
                      </div>
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
                      <Badge variant="outline" className={STATUS_STYLE[contact.status]}>
                        {contact.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {linkedDeals.length > 0 ? (
                        <span className="text-sm font-medium">{linkedDeals.length}</span>
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
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Contact detail sheet */}
      <ContactDetailSheet
        contact={liveSelectedContact}
        onClose={() => setSelectedContact(null)}
      />

      {/* --- Create dialog --- */}
      <Dialog open={createOpen} onOpenChange={(open) => { if (!open) setCreateOpen(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Contact</DialogTitle>
            <DialogDescription>Add a new contact to your CRM.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  placeholder="Full name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
                {formErrors.name && (
                  <p className="text-xs text-red-500">{formErrors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
                {formErrors.email && (
                  <p className="text-xs text-red-500">{formErrors.email}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company *</Label>
                <Input
                  placeholder="Company name"
                  value={formCompany}
                  onChange={(e) => setFormCompany(e.target.value)}
                />
                {formErrors.company && (
                  <p className="text-xs text-red-500">{formErrors.company}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  placeholder="+1 555-0100"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Input
                  placeholder="e.g. Marketing Director"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formStatus} onValueChange={(v) => setFormStatus(v as Contact["status"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Add Contact</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Delete dialog --- */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.name}"? This action cannot be undone.
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
    </div>
  );
}
