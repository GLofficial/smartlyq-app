import { useState } from "react";
import {
  useCrmContactSave,
  type ApiContact,
} from "@/api/crm";
import { formatCurrency } from "@/lib/crm-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Mail,
  Phone,
  Building2,
  Briefcase,
  Save,
  Tag,
  X,
  Plus,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Status options
// ---------------------------------------------------------------------------

const STATUSES: ApiContact["status"][] = ["active", "prospect", "inactive"];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ContactDetailSheetProps {
  contact: ApiContact | null;
  onClose: () => void;
}

export function ContactDetailSheet({ contact, onClose }: ContactDetailSheetProps) {
  const saveContact = useCrmContactSave();

  const [editing, setEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editRole, setEditRole] = useState("");
  const [newTag, setNewTag] = useState("");

  function startEditing() {
    if (!contact) return;
    setEditFirstName(contact.first_name || contact.name.split(" ")[0] || "");
    setEditLastName(contact.last_name || contact.name.split(" ").slice(1).join(" ") || "");
    setEditEmail(contact.email);
    setEditPhone(contact.phone);
    setEditCompany(contact.company);
    setEditRole(contact.role);
    setEditing(true);
  }

  function handleSave() {
    if (!contact) return;
    saveContact.mutate({
      id: contact.id,
      first_name: editFirstName.trim(),
      last_name: editLastName.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim(),
      company: editCompany.trim(),
      role: editRole.trim(),
    });
    setEditing(false);
  }

  function handleStatusChange(status: ApiContact["status"]) {
    if (!contact) return;
    saveContact.mutate({ id: contact.id, status });
  }

  function handleAddTag() {
    if (!contact || !newTag.trim()) return;
    const tag = newTag.trim().toLowerCase();
    if (contact.tags.includes(tag)) { setNewTag(""); return; }
    saveContact.mutate({ id: contact.id, tags: [...contact.tags, tag] });
    setNewTag("");
  }

  function handleRemoveTag(tag: string) {
    if (!contact) return;
    saveContact.mutate({ id: contact.id, tags: contact.tags.filter((t) => t !== tag) });
  }

  return (
    <Sheet open={!!contact} onOpenChange={(open) => { if (!open) { setEditing(false); onClose(); } }}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        {contact && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-lg font-semibold">
                  {contact.initials}
                </div>
                <div>
                  <SheetTitle>
                    {contact.first_name || contact.last_name
                      ? `${contact.first_name} ${contact.last_name}`.trim()
                      : contact.name}
                  </SheetTitle>
                  <SheetDescription>{contact.company}</SheetDescription>
                </div>
              </div>
            </SheetHeader>

            {/* Status buttons */}
            <div className="flex gap-2 mt-4">
              {STATUSES.map((s) => (
                <Button
                  key={s}
                  variant={contact.status === s ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusChange(s)}
                  className="capitalize"
                >
                  {s}
                </Button>
              ))}
            </div>

            {/* Tags */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                <Tag className="w-3.5 h-3.5" />
                Tags
              </div>
              <div className="flex flex-wrap gap-1.5">
                {contact.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-0.5 rounded-full hover:bg-[var(--muted)] p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {contact.tags.length === 0 && (
                  <span className="text-xs text-[var(--muted-foreground)]">No tags</span>
                )}
              </div>
              <div className="flex gap-1.5">
                <Input
                  placeholder="Add tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddTag(); }}
                  className="h-8 text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2"
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Info / Edit form */}
            {!editing ? (
              <div className="space-y-4">
                <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={contact.email} />
                <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone" value={contact.phone || "N/A"} />
                <InfoRow icon={<Building2 className="w-4 h-4" />} label="Company" value={contact.company} />
                <InfoRow icon={<Briefcase className="w-4 h-4" />} label="Role" value={contact.role || "N/A"} />

                <div className="text-sm text-[var(--muted-foreground)]">
                  {contact.deal_count} deal{contact.deal_count !== 1 ? "s" : ""} &middot; {formatCurrency(contact.total_value)} total
                </div>

                <Button variant="outline" size="sm" onClick={startEditing} className="w-full mt-2">
                  Edit Contact
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">First Name</Label>
                    <Input value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Last Name</Label>
                    <Input value={editLastName} onChange={(e) => setEditLastName(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Email</Label>
                  <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Phone</Label>
                  <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Company</Label>
                  <Input value={editCompany} onChange={(e) => setEditCompany(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Role</Label>
                  <Input value={editRole} onChange={(e) => setEditRole(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave} className="flex-1">
                    <Save className="w-4 h-4 mr-1.5" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Created date */}
            <div className="text-xs text-[var(--muted-foreground)] mt-6">
              Added{" "}
              {new Date(contact.created_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ---------------------------------------------------------------------------
// Sub-component
// ---------------------------------------------------------------------------

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-[var(--muted-foreground)] mt-0.5">{icon}</div>
      <div>
        <div className="text-xs text-[var(--muted-foreground)]">{label}</div>
        <div className="text-sm text-[var(--foreground)]">{value}</div>
      </div>
    </div>
  );
}
