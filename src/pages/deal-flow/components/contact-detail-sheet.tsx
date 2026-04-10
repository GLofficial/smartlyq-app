import { useState } from "react";
import { useDealFlowStore } from "@/stores/deal-flow-store";
import type { Contact } from "@/lib/deal-flow-data";
import { formatCurrency } from "@/lib/deal-flow-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  StickyNote,
  LinkIcon,
  Save,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Status styles
// ---------------------------------------------------------------------------

const STATUSES: Contact["status"][] = ["active", "prospect", "inactive"];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ContactDetailSheetProps {
  contact: Contact | null;
  onClose: () => void;
}

export function ContactDetailSheet({ contact, onClose }: ContactDetailSheetProps) {
  const deals = useDealFlowStore((s) => s.deals);
  const updateContact = useDealFlowStore((s) => s.updateContact);

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editNotes, setEditNotes] = useState("");

  function startEditing() {
    if (!contact) return;
    setEditName(contact.name);
    setEditEmail(contact.email);
    setEditPhone(contact.phone);
    setEditCompany(contact.company);
    setEditRole(contact.role);
    setEditNotes(contact.notes);
    setEditing(true);
  }

  function handleSave() {
    if (!contact) return;
    const initials = editName
      .trim()
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    updateContact(contact.id, {
      name: editName.trim(),
      initials,
      email: editEmail.trim(),
      phone: editPhone.trim(),
      company: editCompany.trim(),
      role: editRole.trim(),
      notes: editNotes.trim(),
    });
    setEditing(false);
  }

  function handleStatusChange(status: Contact["status"]) {
    if (!contact) return;
    updateContact(contact.id, { status });
  }

  const linkedDeals = contact
    ? deals.filter((d) => contact.linkedDealIds.includes(d.id))
    : [];

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
                  <SheetTitle>{contact.name}</SheetTitle>
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

            <Separator className="my-4" />

            {/* Info / Edit form */}
            {!editing ? (
              <div className="space-y-4">
                <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={contact.email} />
                <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone" value={contact.phone || "N/A"} />
                <InfoRow icon={<Building2 className="w-4 h-4" />} label="Company" value={contact.company} />
                <InfoRow icon={<Briefcase className="w-4 h-4" />} label="Role" value={contact.role || "N/A"} />

                {contact.notes && (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--muted-foreground)] mb-1">
                      <StickyNote className="w-3.5 h-3.5" />
                      Notes
                    </div>
                    <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap">
                      {contact.notes}
                    </p>
                  </div>
                )}

                <Button variant="outline" size="sm" onClick={startEditing} className="w-full mt-2">
                  Edit Contact
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Name</Label>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
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
                <div className="space-y-1.5">
                  <Label className="text-xs">Notes</Label>
                  <textarea
                    className="w-full min-h-[80px] rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                  />
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

            {/* Linked deals */}
            {linkedDeals.length > 0 && (
              <>
                <Separator className="my-4" />
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--muted-foreground)] mb-3">
                    <LinkIcon className="w-3.5 h-3.5" />
                    Linked Deals ({linkedDeals.length})
                  </div>
                  <div className="space-y-2">
                    {linkedDeals.map((deal) => (
                      <div
                        key={deal.id}
                        className="flex items-center justify-between p-2.5 rounded-md border border-[var(--border)] bg-[var(--card)]"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-[var(--foreground)] truncate">
                            {deal.clientCompany}
                          </div>
                          <div className="text-xs text-[var(--muted-foreground)]">
                            {deal.stage}
                          </div>
                        </div>
                        {deal.value > 0 && (
                          <span className="text-sm font-bold text-orange-500 shrink-0 ml-2">
                            {formatCurrency(deal.value)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Created date */}
            <div className="text-xs text-[var(--muted-foreground)] mt-6">
              Added{" "}
              {new Date(contact.createdAt).toLocaleDateString("en-US", {
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
