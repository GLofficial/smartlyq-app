import { useState, useRef } from "react";
import { useCrmContactSave } from "@/api/crm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COUNTRY_CODES } from "@/lib/country-codes";
import { Camera, Plus } from "lucide-react";
import { toast } from "sonner";

const PHONE_TYPES = [
	{ value: "mobile", label: "Mobile" },
	{ value: "work", label: "Work" },
	{ value: "landline", label: "Landline" },
	{ value: "home", label: "Home" },
];

const CONTACT_TYPES = [
	{ value: "", label: "Select type" },
	{ value: "lead", label: "Lead" },
	{ value: "customer", label: "Customer" },
	{ value: "partner", label: "Partner" },
	{ value: "vendor", label: "Vendor" },
	{ value: "employee", label: "Employee" },
	{ value: "other", label: "Other" },
];

const TIMEZONES = [
	"UTC", "US/Eastern", "US/Central", "US/Mountain", "US/Pacific",
	"Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Athens",
	"Europe/Moscow", "Asia/Dubai", "Asia/Kolkata", "Asia/Shanghai",
	"Asia/Tokyo", "Asia/Singapore", "Australia/Sydney",
	"Pacific/Auckland", "America/Sao_Paulo", "America/Buenos_Aires",
	"Africa/Cairo", "Africa/Johannesburg",
];

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ContactCreateDialog({ open, onOpenChange }: Props) {
	const saveContact = useCrmContactSave();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [secondaryEmail, setSecondaryEmail] = useState("");
	const [showSecondaryEmail, setShowSecondaryEmail] = useState(false);
	const [company, setCompany] = useState("");
	const [phoneType, setPhoneType] = useState("mobile");
	const [phoneCode, setPhoneCode] = useState("+1");
	const [phone, setPhone] = useState("");
	const [role, setRole] = useState("");
	const [status, setStatus] = useState("prospect");
	const [contactType, setContactType] = useState("");
	const [timezone, setTimezone] = useState("");
	const [avatarPreview, setAvatarPreview] = useState("");
	const [errors, setErrors] = useState<Record<string, string>>({});

	function reset() {
		setFirstName(""); setLastName(""); setEmail(""); setSecondaryEmail("");
		setShowSecondaryEmail(false); setCompany(""); setPhoneType("mobile");
		setPhoneCode("+1"); setPhone(""); setRole(""); setStatus("prospect");
		setContactType(""); setTimezone(""); setAvatarPreview(""); setErrors({});
	}

	function validate(): boolean {
		const e: Record<string, string> = {};
		if (!firstName.trim()) e.first_name = "First name is required.";
		if (!email.trim()) e.email = "Email is required.";
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email.";
		if (secondaryEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(secondaryEmail)) e.secondary_email = "Invalid email.";
		if (!company.trim()) e.company = "Company is required.";
		setErrors(e);
		return Object.keys(e).length === 0;
	}

	function handleCreate() {
		if (!validate()) return;
		saveContact.mutate(
			{
				first_name: firstName.trim(),
				last_name: lastName.trim(),
				email: email.trim(),
				secondary_email: secondaryEmail.trim(),
				company: company.trim(),
				phone: phone.trim(),
				phone_type: phoneType,
				phone_country_code: phoneCode,
				role: role.trim(),
				status,
				contact_type: contactType,
				timezone,
				avatar: avatarPreview,
			},
			{
				onSuccess: () => {
					toast.success("Contact created");
					reset();
					onOpenChange(false);
				},
				onError: () => toast.error("Failed to create contact"),
			},
		);
	}

	function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => setAvatarPreview(reader.result as string);
		reader.readAsDataURL(file);
	}

	const selectedCountry = COUNTRY_CODES.find((c) => c.dial === phoneCode);

	return (
		<Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); onOpenChange(false); } }}>
			<DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Add Contact</DialogTitle>
					<DialogDescription>Add a new contact to your CRM.</DialogDescription>
				</DialogHeader>
				<div className="space-y-4 py-2">
					{/* Avatar */}
					<div>
						<Label className="text-xs text-[var(--muted-foreground)]">Contact image</Label>
						<div className="flex items-center gap-3 mt-1.5">
							<button
								type="button"
								onClick={() => fileInputRef.current?.click()}
								className="relative w-14 h-14 rounded-full bg-[var(--muted)] flex items-center justify-center overflow-hidden group hover:ring-2 hover:ring-[var(--sq-primary)] transition-all"
							>
								{avatarPreview ? (
									<img src={avatarPreview} alt="" className="w-full h-full object-cover" />
								) : (
									<Camera size={20} className="text-[var(--muted-foreground)]" />
								)}
								<div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
									<Camera size={16} className="text-white" />
								</div>
							</button>
							<input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
							<span className="text-xs text-[var(--muted-foreground)]">Click to upload</span>
						</div>
					</div>

					{/* Name */}
					<div className="grid grid-cols-2 gap-3">
						<Field label="First Name *" error={errors.first_name}>
							<Input placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
						</Field>
						<Field label="Last Name">
							<Input placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
						</Field>
					</div>

					{/* Email */}
					<Field label="Email *" error={errors.email}>
						<Input type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
					</Field>
					{showSecondaryEmail ? (
						<Field label="Secondary Email" error={errors.secondary_email}>
							<Input type="email" placeholder="secondary@example.com" value={secondaryEmail} onChange={(e) => setSecondaryEmail(e.target.value)} />
						</Field>
					) : (
						<button type="button" onClick={() => setShowSecondaryEmail(true)} className="flex items-center gap-1 text-xs text-[var(--sq-primary)] hover:underline">
							<Plus size={12} /> Add email
						</button>
					)}

					{/* Phone */}
					<div className="space-y-1.5">
						<Label className="text-sm font-medium">Phone</Label>
						<div className="flex gap-1.5">
							<Select value={phoneType} onValueChange={setPhoneType}>
								<SelectTrigger className="w-[100px] shrink-0">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{PHONE_TYPES.map((t) => (
										<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Select value={phoneCode} onValueChange={setPhoneCode}>
								<SelectTrigger className="w-[90px] shrink-0">
									<SelectValue>
										{selectedCountry ? `${selectedCountry.flag} ${selectedCountry.dial}` : phoneCode}
									</SelectValue>
								</SelectTrigger>
								<SelectContent className="max-h-[280px]">
									{COUNTRY_CODES.map((cc) => (
										<SelectItem key={cc.code} value={cc.dial}>
											<span className="flex items-center gap-2">
												<span>{cc.flag}</span>
												<span className="text-xs text-[var(--muted-foreground)]">{cc.name}</span>
												<span className="font-medium">{cc.dial}</span>
											</span>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Input placeholder="Enter phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
						</div>
					</div>

					{/* Company + Role */}
					<div className="grid grid-cols-2 gap-3">
						<Field label="Company *" error={errors.company}>
							<Input placeholder="Company name" value={company} onChange={(e) => setCompany(e.target.value)} />
						</Field>
						<Field label="Role">
							<Input placeholder="e.g. CEO" value={role} onChange={(e) => setRole(e.target.value)} />
						</Field>
					</div>

					{/* Contact Type + Status */}
					<div className="grid grid-cols-2 gap-3">
						<Field label="Contact Type">
							<Select value={contactType} onValueChange={setContactType}>
								<SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
								<SelectContent>
									{CONTACT_TYPES.map((t) => (
										<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
									))}
								</SelectContent>
							</Select>
						</Field>
						<Field label="Status">
							<Select value={status} onValueChange={setStatus}>
								<SelectTrigger><SelectValue /></SelectTrigger>
								<SelectContent>
									<SelectItem value="active">Active</SelectItem>
									<SelectItem value="prospect">Prospect</SelectItem>
									<SelectItem value="in_progress">In Progress</SelectItem>
									<SelectItem value="lost">Lost</SelectItem>
								</SelectContent>
							</Select>
						</Field>
					</div>

					{/* Timezone */}
					<Field label="Timezone">
						<Select value={timezone} onValueChange={setTimezone}>
							<SelectTrigger><SelectValue placeholder="Select timezone" /></SelectTrigger>
							<SelectContent className="max-h-[280px]">
								<SelectItem value="">None</SelectItem>
								{TIMEZONES.map((tz) => (
									<SelectItem key={tz} value={tz}>{tz}</SelectItem>
								))}
							</SelectContent>
						</Select>
					</Field>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => { reset(); onOpenChange(false); }}>Cancel</Button>
					<Button onClick={handleCreate} disabled={saveContact.isPending}>
						{saveContact.isPending ? "Creating..." : "Add Contact"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
	return (
		<div className="space-y-1.5">
			<Label className="text-sm font-medium">{label}</Label>
			{children}
			{error && <p className="text-xs text-red-500">{error}</p>}
		</div>
	);
}
