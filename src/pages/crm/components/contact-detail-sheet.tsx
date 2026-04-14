import { useState, useRef } from "react";
import { toast } from "sonner";
import { useCrmContactSave, type ApiContact } from "@/api/crm";
import { formatCurrency } from "@/lib/crm-data";
import { COUNTRY_CODES } from "@/lib/country-codes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { TIMEZONES } from "@/lib/timezones";
import { Mail, Phone, Building2, Briefcase, Save, Tag, X, Plus, Camera, Globe, User } from "lucide-react";

const STATUSES: { value: string; label: string; style: string }[] = [
	{ value: "active", label: "Active", style: "bg-green-50 text-green-700 border-green-200" },
	{ value: "prospect", label: "Prospect", style: "bg-blue-50 text-blue-600 border-blue-200" },
	{ value: "in_progress", label: "In Progress", style: "bg-amber-50 text-amber-700 border-amber-200" },
	{ value: "lost", label: "Lost", style: "bg-red-50 text-red-600 border-red-200" },
];

const PHONE_TYPES = [
	{ value: "mobile", label: "Mobile" },
	{ value: "work", label: "Work" },
	{ value: "landline", label: "Landline" },
	{ value: "home", label: "Home" },
];

const CONTACT_TYPES = [
	{ value: "none", label: "None" },
	{ value: "lead", label: "Lead" },
	{ value: "customer", label: "Customer" },
	{ value: "partner", label: "Partner" },
	{ value: "vendor", label: "Vendor" },
	{ value: "employee", label: "Employee" },
	{ value: "other", label: "Other" },
];

const ALL_TIMEZONES = ["none", ...TIMEZONES];

interface Props {
	contact: ApiContact | null;
	onClose: () => void;
}

export function ContactDetailSheet({ contact, onClose }: Props) {
	const saveContact = useCrmContactSave();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [editing, setEditing] = useState(false);
	const [showSecEmail, setShowSecEmail] = useState(false);
	const [f, setF] = useState({ firstName: "", lastName: "", email: "", secondaryEmail: "", phone: "", phoneCode: "+1", phoneType: "mobile", company: "", role: "", contactType: "", timezone: "", avatar: "" });
	const [newTag, setNewTag] = useState("");

	function startEditing() {
		if (!contact) return;
		const phoneParts = (contact.phone || "").match(/^(\+\d{1,4})\s+(.*)$/);
		const secEmail = contact.secondary_email && contact.secondary_email !== "0" ? contact.secondary_email : "";
		setShowSecEmail(secEmail !== "");
		setF({
			firstName: contact.first_name || contact.name.split(" ")[0] || "",
			lastName: contact.last_name || contact.name.split(" ").slice(1).join(" ") || "",
			email: contact.email,
			secondaryEmail: secEmail,
			phone: phoneParts?.[2] || contact.phone || "",
			phoneCode: contact.phone_country_code || phoneParts?.[1] || "+1",
			phoneType: contact.phone_type || "mobile",
			company: contact.company,
			role: contact.role,
			contactType: contact.contact_type || "none",
			timezone: contact.timezone || "none",
			avatar: contact.avatar || "",
		});
		setEditing(true);
	}

	function handleSave() {
		if (!contact) return;
		saveContact.mutate({
			id: contact.id,
			first_name: f.firstName.trim(), last_name: f.lastName.trim(),
			email: f.email.trim(), secondary_email: f.secondaryEmail.trim(),
			phone: f.phone.trim(), phone_country_code: f.phoneCode, phone_type: f.phoneType,
			company: f.company.trim(), role: f.role.trim(),
			contact_type: f.contactType === "none" ? "" : f.contactType,
			timezone: f.timezone === "none" ? "" : f.timezone,
			avatar: f.avatar,
		}, {
			onSuccess: () => { toast.success("Contact saved"); setEditing(false); },
			onError: () => toast.error("Failed to save contact"),
		});
	}

	function handleStatusChange(status: string) {
		if (!contact) return;
		saveContact.mutate({ id: contact.id, status }, {
			onSuccess: () => toast.success("Status updated"),
			onError: () => toast.error("Failed"),
		});
	}

	function handleAddTag() {
		if (!contact || !newTag.trim()) return;
		const tag = newTag.trim().toLowerCase();
		if (contact.tags.includes(tag)) { setNewTag(""); return; }
		saveContact.mutate({ id: contact.id, tags: [...contact.tags, tag] }, {
			onSuccess: () => { toast.success("Tag added"); setNewTag(""); },
			onError: () => toast.error("Failed"),
		});
	}

	function handleRemoveTag(tag: string) {
		if (!contact) return;
		saveContact.mutate({ id: contact.id, tags: contact.tags.filter((t) => t !== tag) }, {
			onSuccess: () => toast.success("Tag removed"),
			onError: () => toast.error("Failed"),
		});
	}

	function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => setF((p) => ({ ...p, avatar: reader.result as string }));
		reader.readAsDataURL(file);
	}

	const phoneFlag = COUNTRY_CODES.find((c) => c.dial === (contact?.phone_country_code || ""))?.flag;
	const selectedCountry = COUNTRY_CODES.find((c) => c.dial === f.phoneCode);

	return (
		<Sheet open={!!contact} onOpenChange={(open) => { if (!open) { setEditing(false); onClose(); } }}>
			<SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
				{contact && (
					<>
						<SheetHeader>
							<div className="flex items-center gap-3">
								<div className="relative w-12 h-12 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-lg font-semibold overflow-hidden">
									{contact.avatar && contact.avatar.length > 2 ? (
										<img src={contact.avatar} alt="" className="w-full h-full object-cover" />
									) : (
										contact.initials
									)}
								</div>
								<div>
									<SheetTitle>
										{contact.first_name || contact.last_name ? `${contact.first_name} ${contact.last_name}`.trim() : contact.name}
									</SheetTitle>
									<SheetDescription>{contact.company}</SheetDescription>
								</div>
							</div>
						</SheetHeader>

						{/* Status buttons */}
						<div className="flex flex-wrap gap-2 mt-4">
							{STATUSES.map((s) => (
								<Button key={s.value} variant={contact.status === s.value ? "default" : "outline"} size="sm"
									onClick={() => handleStatusChange(s.value)} className={contact.status === s.value ? "" : s.style}>
									{s.label}
								</Button>
							))}
						</div>

						{/* Tags */}
						<div className="mt-4 space-y-2">
							<div className="flex items-center gap-1.5 text-xs font-semibold uppercase text-[var(--muted-foreground)]"><Tag className="w-3.5 h-3.5" /> Tags</div>
							<div className="flex flex-wrap gap-1.5">
								{contact.tags.map((tag) => (
									<Badge key={tag} variant="secondary" className="gap-1 pr-1">
										{tag}
										<button onClick={() => handleRemoveTag(tag)} className="ml-0.5 rounded-full hover:bg-[var(--muted)] p-0.5"><X className="w-3 h-3" /></button>
									</Badge>
								))}
								{contact.tags.length === 0 && <span className="text-xs text-[var(--muted-foreground)]">No tags</span>}
							</div>
							<div className="flex gap-1.5">
								<Input placeholder="Add tag..." value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddTag()} className="h-8 text-xs" />
								<Button variant="outline" size="sm" className="h-8 px-2" onClick={handleAddTag} disabled={!newTag.trim()}><Plus className="w-3.5 h-3.5" /></Button>
							</div>
						</div>

						<Separator className="my-4" />

						{/* View / Edit */}
						{!editing ? (
							<div className="space-y-3">
								<InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={contact.email} />
								{contact.secondary_email && contact.secondary_email !== "0" && <InfoRow icon={<Mail className="w-4 h-4" />} label="Secondary Email" value={contact.secondary_email} />}
								<InfoRow icon={<Phone className="w-4 h-4" />} label={`Phone (${contact.phone_type || "mobile"})`} value={contact.phone || "N/A"} prefix={phoneFlag} />
								<InfoRow icon={<Building2 className="w-4 h-4" />} label="Company" value={contact.company} />
								<InfoRow icon={<Briefcase className="w-4 h-4" />} label="Role" value={contact.role || "N/A"} />
								{contact.contact_type && <InfoRow icon={<User className="w-4 h-4" />} label="Type" value={contact.contact_type} />}
								{contact.timezone && <InfoRow icon={<Globe className="w-4 h-4" />} label="Timezone" value={contact.timezone} />}
								<div className="text-sm text-[var(--muted-foreground)]">{contact.deal_count} deal{contact.deal_count !== 1 ? "s" : ""} · {formatCurrency(contact.total_value)} total</div>
								<Button variant="outline" size="sm" onClick={startEditing} className="w-full mt-2">Edit Contact</Button>
							</div>
						) : (
							<div className="space-y-3">
								{/* Avatar */}
								<div className="flex items-center gap-3">
									<button type="button" onClick={() => fileInputRef.current?.click()}
										className="relative w-14 h-14 rounded-full bg-[var(--muted)] flex items-center justify-center overflow-hidden group hover:ring-2 hover:ring-[var(--sq-primary)]">
										{f.avatar ? <img src={f.avatar} alt="" className="w-full h-full object-cover" /> : <Camera size={20} className="text-[var(--muted-foreground)]" />}
										<div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center"><Camera size={14} className="text-white" /></div>
									</button>
									<input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
									<span className="text-xs text-[var(--muted-foreground)]">Click to change</span>
								</div>
								{/* Name */}
								<div className="grid grid-cols-2 gap-3">
									<div className="space-y-1"><Label className="text-xs">First Name</Label><Input value={f.firstName} onChange={(e) => setF((p) => ({ ...p, firstName: e.target.value }))} /></div>
									<div className="space-y-1"><Label className="text-xs">Last Name</Label><Input value={f.lastName} onChange={(e) => setF((p) => ({ ...p, lastName: e.target.value }))} /></div>
								</div>
								{/* Email */}
								<div className="space-y-1"><Label className="text-xs">Email</Label><Input value={f.email} onChange={(e) => setF((p) => ({ ...p, email: e.target.value }))} /></div>
								{showSecEmail ? (
									<div className="space-y-1"><Label className="text-xs">Secondary Email</Label><Input value={f.secondaryEmail} onChange={(e) => setF((p) => ({ ...p, secondaryEmail: e.target.value }))} placeholder="secondary@example.com" /></div>
								) : (
									<button type="button" onClick={() => {
										if (!f.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) {
											toast.error("Please enter a valid email before adding another.");
											return;
										}
										setShowSecEmail(true);
									}} className="flex items-center gap-1 text-xs text-[var(--sq-primary)] hover:underline">
										<Plus className="w-3 h-3" /> Add email
									</button>
								)}
								{/* Phone */}
								<div className="space-y-1">
									<Label className="text-xs">Phone</Label>
									<div className="flex gap-1.5">
										<Select value={f.phoneType} onValueChange={(v) => setF((p) => ({ ...p, phoneType: v }))}>
											<SelectTrigger className="w-[90px] shrink-0 h-9"><SelectValue /></SelectTrigger>
											<SelectContent>{PHONE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
										</Select>
										<Select value={f.phoneCode} onValueChange={(v) => setF((p) => ({ ...p, phoneCode: v }))}>
											<SelectTrigger className="w-[85px] shrink-0 h-9">
												<SelectValue>{selectedCountry ? `${selectedCountry.flag} ${selectedCountry.dial}` : f.phoneCode}</SelectValue>
											</SelectTrigger>
											<SelectContent className="max-h-[280px]">
												{COUNTRY_CODES.map((cc) => <SelectItem key={cc.code} value={cc.dial}><span className="flex items-center gap-2"><span>{cc.flag}</span><span className="font-medium">{cc.dial}</span></span></SelectItem>)}
											</SelectContent>
										</Select>
										<Input value={f.phone} onChange={(e) => setF((p) => ({ ...p, phone: e.target.value }))} className="h-9" placeholder="Phone number" />
									</div>
								</div>
								{/* Company + Role */}
								<div className="grid grid-cols-2 gap-3">
									<div className="space-y-1"><Label className="text-xs">Company</Label><Input value={f.company} onChange={(e) => setF((p) => ({ ...p, company: e.target.value }))} /></div>
									<div className="space-y-1"><Label className="text-xs">Role</Label><Input value={f.role} onChange={(e) => setF((p) => ({ ...p, role: e.target.value }))} /></div>
								</div>
								{/* Type + Timezone */}
								<div className="grid grid-cols-2 gap-3">
									<div className="space-y-1">
										<Label className="text-xs">Contact Type</Label>
										<Select value={f.contactType} onValueChange={(v) => setF((p) => ({ ...p, contactType: v }))}>
											<SelectTrigger className="h-9"><SelectValue placeholder="Select type" /></SelectTrigger>
											<SelectContent>{CONTACT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
										</Select>
									</div>
									<div className="space-y-1">
										<Label className="text-xs">Timezone</Label>
										<Select value={f.timezone} onValueChange={(v) => setF((p) => ({ ...p, timezone: v }))}>
											<SelectTrigger className="h-9"><SelectValue placeholder="Select" /></SelectTrigger>
											<SelectContent className="max-h-[280px]">{ALL_TIMEZONES.map((tz) => <SelectItem key={tz} value={tz}>{tz === "none" ? "None" : tz}</SelectItem>)}</SelectContent>
										</Select>
									</div>
								</div>
								{/* Actions */}
								<div className="flex gap-2">
									<Button size="sm" onClick={handleSave} className="flex-1"><Save className="w-4 h-4 mr-1.5" /> Save</Button>
									<Button variant="outline" size="sm" onClick={() => setEditing(false)} className="flex-1">Cancel</Button>
								</div>
							</div>
						)}

						<div className="text-xs text-[var(--muted-foreground)] mt-6">
							Added {new Date(contact.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
						</div>
					</>
				)}
			</SheetContent>
		</Sheet>
	);
}

function InfoRow({ icon, label, value, prefix }: { icon: React.ReactNode; label: string; value: string; prefix?: string }) {
	return (
		<div className="flex items-start gap-3">
			<div className="text-[var(--muted-foreground)] mt-0.5">{icon}</div>
			<div>
				<div className="text-xs text-[var(--muted-foreground)]">{label}</div>
				<div className="text-sm text-[var(--foreground)]">{prefix && <span className="mr-1">{prefix}</span>}{value}</div>
			</div>
		</div>
	);
}
