import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, Copy, Upload, Trash2 } from "lucide-react";
import { useBusinessProfile, useSaveBusinessProfile, useUploadBusinessLogo, useRemoveBusinessLogo } from "@/api/business-profile";
import { toast } from "sonner";

const CURRENCIES = ["USD","EUR","GBP","AUD","CAD","CHF","SEK","NOK","DKK","PLN","CZK","HUF","RON","BGN","TRY","AED","SAR","QAR","ILS","INR"];
const REGIONS = ["Africa", "Asia", "Europe", "Latin America", "USA and Canada"];

export function BusinessProfileTab() {
	const { data, isLoading } = useBusinessProfile();
	const saveMut = useSaveBusinessProfile();
	const [form, setForm] = useState<Record<string, string | string[]>>({});
	const [initialized, setInitialized] = useState(false);

	const profile = data?.profile;
	if (profile && !initialized) {
		const init: Record<string, string | string[]> = {};
		for (const [k, v] of Object.entries(profile)) {
			if (k === "regions_json") {
				try { init.regions = JSON.parse(v as string || "[]"); } catch { init.regions = []; }
			} else if (typeof v === "string" || v === null) {
				init[k] = v ?? "";
			}
		}
		setForm(init);
		setInitialized(true);
	}

	const f = (key: string) => (typeof form[key] === "string" ? (form[key] as string) : "") ?? "";
	const set = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));
	const regions = Array.isArray(form.regions) ? (form.regions as string[]) : [];
	const toggleRegion = (r: string) => {
		const current = [...regions];
		const idx = current.indexOf(r);
		if (idx >= 0) current.splice(idx, 1); else current.push(r);
		setForm((p) => ({ ...p, regions: current }));
	};

	const handleSave = () => {
		saveMut.mutate(form, {
			onSuccess: () => toast.success("Business profile updated."),
			onError: () => toast.error("Failed to save."),
		});
	};

	if (isLoading) {
		return <div className="flex h-40 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>;
	}

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-bold">Business Profile Settings</h2>
				<p className="text-sm text-[var(--muted-foreground)]">Manage your business profile information & settings</p>
			</div>

			{/* 2-column layout: General Info LEFT, Address RIGHT */}
			<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
				{/* LEFT: General Information */}
				<Card>
					<CardContent className="p-6 space-y-5">
						<div className="flex items-center justify-between flex-wrap gap-2">
							<h3 className="text-lg font-semibold">General Information</h3>
							{profile?.location_id && (
								<div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
									Location ID <code className="rounded bg-[var(--muted)] px-1.5 py-0.5 font-mono text-[11px]">{profile.location_id}</code>
									<button onClick={() => { navigator.clipboard.writeText(profile.location_id); toast.success("Copied!"); }}><Copy size={11} /></button>
								</div>
							)}
						</div>

						<LogoUpload logoUrl={profile?.business_logo_url || null} />

						<Field label="Friendly Business Name" value={f("friendly_business_name")} onChange={(v) => set("friendly_business_name", v)} />
						<Field label="Legal Business Name" value={f("legal_business_name")} onChange={(v) => set("legal_business_name", v)} />
						<div className="grid gap-4 grid-cols-2">
							<Field label="Business Email" value={f("business_email")} onChange={(v) => set("business_email", v)} type="email" />
							<Field label="Business Phone" value={f("business_phone")} onChange={(v) => set("business_phone", v)} />
						</div>
						<Field label="Branded Domain" value={f("branded_domain")} onChange={(v) => set("branded_domain", v)} />
						<div className="grid gap-4 grid-cols-2">
							<Field label="Business Website" value={f("business_website")} onChange={(v) => set("business_website", v)} />
							<Field label="Business Niche" value={f("business_niche")} onChange={(v) => set("business_niche", v)} />
						</div>
						<div className="space-y-1.5">
							<label className="text-sm font-medium">Business Currency</label>
							<select value={f("business_currency")} onChange={(e) => set("business_currency", e.target.value)} className="flex h-10 w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm">
								<option value="">Choose...</option>
								{CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
							</select>
						</div>
					</CardContent>
				</Card>

				{/* RIGHT: Business Physical Address */}
				<Card>
					<CardContent className="p-6 space-y-5">
						<h3 className="text-lg font-semibold">Business Physical Address</h3>
						<Field label="Street Address" value={f("address_street")} onChange={(v) => set("address_street", v)} />
						<div className="grid gap-4 grid-cols-[1fr,auto]">
							<Field label="City" value={f("address_city")} onChange={(v) => set("address_city", v)} />
							<Field label="Postal/Zip Code" value={f("address_postal_code")} onChange={(v) => set("address_postal_code", v)} />
						</div>
						<Field label="State / Prov / Region" value={f("address_region")} onChange={(v) => set("address_region", v)} />
						<Field label="Country" value={f("address_country")} onChange={(v) => set("address_country", v)} />
						<Field label="Time Zone" value={f("time_zone")} onChange={(v) => set("time_zone", v)} placeholder="e.g. Europe/Athens" />
					</CardContent>
				</Card>
			</div>

			{/* Business Information */}
			<Card>
				<CardContent className="p-6 space-y-5">
					<h3 className="text-lg font-semibold">Business Information</h3>
					<div className="grid gap-4 grid-cols-2">
						<Field label="Business Type" value={f("business_type")} onChange={(v) => set("business_type", v)} />
						<Field label="Business Industry" value={f("business_industry")} onChange={(v) => set("business_industry", v)} />
						<Field label="Registration ID Type" value={f("business_registration_id_type")} onChange={(v) => set("business_registration_id_type", v)} />
						<Field label="Registration Type" value={f("business_registration_type")} onChange={(v) => set("business_registration_type", v)} />
					</div>
					<Field label="Registration Number" value={f("business_registration_number")} onChange={(v) => set("business_registration_number", v)} />
					<div>
						<label className="text-sm font-medium">Business Regions of Operations</label>
						<div className="mt-2 flex flex-wrap gap-3">
							{REGIONS.map((r) => (
								<label key={r} className="flex items-center gap-2 text-sm cursor-pointer">
									<input type="checkbox" checked={regions.includes(r)} onChange={() => toggleRegion(r)} className="rounded border-[var(--input)]" />
									{r}
								</label>
							))}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Authorized Representative */}
			<Card>
				<CardContent className="p-6 space-y-5">
					<h3 className="text-lg font-semibold">Authorized Representative</h3>
					<div className="grid gap-4 grid-cols-2">
						<Field label="First Name" value={f("rep_first_name")} onChange={(v) => set("rep_first_name", v)} />
						<Field label="Last Name" value={f("rep_last_name")} onChange={(v) => set("rep_last_name", v)} />
						<Field label="Representative Email" value={f("rep_email")} onChange={(v) => set("rep_email", v)} type="email" />
						<Field label="Job Position" value={f("rep_job_position")} onChange={(v) => set("rep_job_position", v)} />
					</div>
					<Field label="Phone Number (with country code)" value={f("rep_phone")} onChange={(v) => set("rep_phone", v)} />
				</CardContent>
			</Card>

			<div className="flex justify-end">
				<Button onClick={handleSave} disabled={saveMut.isPending}>
					<Save size={16} /> {saveMut.isPending ? "Saving..." : "Update Information"}
				</Button>
			</div>
		</div>
	);
}

function LogoUpload({ logoUrl }: { logoUrl?: string | null }) {
	const fileRef = useRef<HTMLInputElement>(null);
	const uploadMut = useUploadBusinessLogo();
	const removeMut = useRemoveBusinessLogo();
	const [localUrl, setLocalUrl] = useState<string | null>(null);

	const displayUrl = localUrl ?? logoUrl;

	const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		e.target.value = "";
		if (file.size > 2.5 * 1024 * 1024) { toast.error("File too large. Max 2.5 MB."); return; }
		// Show preview immediately using local blob URL
		setLocalUrl(URL.createObjectURL(file));
		uploadMut.mutate(file, {
			onSuccess: (res) => { if (res.logo_url) setLocalUrl(res.logo_url); toast.success("Logo uploaded."); },
			onError: () => { setLocalUrl(null); toast.error("Upload failed."); },
		});
	};

	return (
		<div className="flex items-start gap-4">
			<div className="h-24 w-36 shrink-0 rounded-lg border border-[var(--border)] bg-[var(--muted)] flex items-center justify-center overflow-hidden">
				{displayUrl ? (
					<img src={displayUrl} alt="Business logo" className="h-full w-full object-contain" />
				) : (
					<span className="text-xs text-[var(--muted-foreground)]">No logo</span>
				)}
			</div>
			<div className="space-y-2">
				<p className="text-sm font-medium">Business Logo</p>
				<p className="text-xs text-[var(--muted-foreground)]">The proposed size is 350px * 180px. No bigger than 2.5 MB</p>
				<div className="flex gap-2">
					<Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploadMut.isPending}>
						<Upload size={14} /> {uploadMut.isPending ? "Uploading..." : "Upload"}
					</Button>
					{displayUrl && (
						<Button size="sm" variant="outline" onClick={() => removeMut.mutate(undefined, { onSuccess: () => { setLocalUrl(null); toast.success("Logo removed."); } })} disabled={removeMut.isPending}>
							<Trash2 size={14} /> Remove
						</Button>
					)}
				</div>
			</div>
			<input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
		</div>
	);
}

function Field({ label, value, onChange, type = "text", placeholder }: {
	label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
	return (
		<div className="space-y-1.5">
			<label className="text-sm font-medium">{label}</label>
			<Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
		</div>
	);
}
