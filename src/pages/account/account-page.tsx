import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserCog, Mail, Shield, Calendar, Save, Camera, Trash2, Key, Plus, XCircle, Copy } from "lucide-react";
import { useAccount } from "@/api/general";
import { useUploadAvatar, useDeleteAvatar, useUpdateAccount, useChangePassword, useApiKeys, useApiKeyCreate, useApiKeyRevoke } from "@/api/account";
import { toast } from "sonner";

export function AccountPage() {
	const { data, isLoading, refetch } = useAccount();
	const user = data?.user;

	const [name, setName] = useState("");
	const [nameLoaded, setNameLoaded] = useState(false);

	const [currentPw, setCurrentPw] = useState("");
	const [newPw, setNewPw] = useState("");
	const [confirmPw, setConfirmPw] = useState("");

	const updateMut = useUpdateAccount();
	const passwordMut = useChangePassword();

	// Initialize name from API data once
	if (user?.name && !nameLoaded) {
		setName(user.name);
		setNameLoaded(true);
	}

	const handleSaveProfile = () => {
		if (!name.trim()) { toast.error("Name is required."); return; }
		updateMut.mutate({ name }, {
			onSuccess: (res) => { toast.success(res.message); refetch(); },
			onError: (err) => toast.error((err as { message?: string })?.message ?? "Failed to save."),
		});
	};

	const handleChangePassword = () => {
		if (newPw.length < 8) { toast.error("New password must be at least 8 characters."); return; }
		if (newPw !== confirmPw) { toast.error("Passwords do not match."); return; }
		passwordMut.mutate({ current_password: currentPw, new_password: newPw }, {
			onSuccess: (res) => { toast.success(res.message); setCurrentPw(""); setNewPw(""); setConfirmPw(""); },
			onError: (err) => toast.error((err as { message?: string })?.message ?? "Failed to change password."),
		});
	};

	if (isLoading) {
		return (
			<div className="flex h-40 items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-2xl space-y-6">
			<h1 className="text-2xl font-bold">Account</h1>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">
						<UserCog size={18} /> Profile
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<AvatarUpload currentUrl={user?.avatar_url} />
					<div className="space-y-2">
						<label className="text-sm font-medium">Name</label>
						<Input value={name} onChange={(e) => setName(e.target.value)} />
					</div>
					<div className="space-y-2">
						<label className="flex items-center gap-1 text-sm font-medium">
							<Mail size={14} /> Email
						</label>
						<Input defaultValue={user?.email ?? ""} disabled />
					</div>
					<div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
						<span className="flex items-center gap-1">
							<Shield size={14} /> Role: {user?.role === 1 ? "Admin" : "User"}
						</span>
						{user?.created_at && (
							<span className="flex items-center gap-1">
								<Calendar size={14} /> Joined: {new Date(user.created_at).toLocaleDateString()}
							</span>
						)}
					</div>
					<Button onClick={handleSaveProfile} disabled={updateMut.isPending}>
						<Save size={16} /> {updateMut.isPending ? "Saving..." : "Save Changes"}
					</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Change Password</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<label className="text-sm font-medium">Current Password</label>
						<Input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="Enter current password" />
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium">New Password</label>
						<Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Min 8 characters" />
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium">Confirm New Password</label>
						<Input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Confirm new password" />
					</div>
					<Button variant="outline" onClick={handleChangePassword} disabled={passwordMut.isPending}>
						{passwordMut.isPending ? "Updating..." : "Update Password"}
					</Button>
				</CardContent>
			</Card>

			<ApiKeysCard />
		</div>
	);
}

function AvatarUpload({ currentUrl }: { currentUrl?: string | null }) {
	const fileRef = useRef<HTMLInputElement>(null);
	const uploadMut = useUploadAvatar();
	const deleteMut = useDeleteAvatar();
	const [localUrl, setLocalUrl] = useState<string | null>(null);

	const displayUrl = localUrl ?? currentUrl;

	const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		e.target.value = "";
		setLocalUrl(URL.createObjectURL(file));
		uploadMut.mutate(file, {
			onSuccess: (res) => { if (res.avatar_url) setLocalUrl(res.avatar_url); toast.success("Avatar updated."); },
			onError: () => { setLocalUrl(null); toast.error("Upload failed."); },
		});
	};

	return (
		<div className="flex items-center gap-4">
			{displayUrl ? (
				<img src={displayUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
			) : (
				<div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--muted-foreground)]"><Camera size={24} /></div>
			)}
			<div className="flex gap-2">
				<Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploadMut.isPending}>
					<Camera size={14} /> {uploadMut.isPending ? "Uploading..." : "Change Photo"}
				</Button>
				{displayUrl && (
					<Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteMut.mutate(undefined, { onSuccess: () => { setLocalUrl(null); toast.success("Removed."); } })} disabled={deleteMut.isPending}>
						<Trash2 size={14} /> Remove
					</Button>
				)}
			</div>
			<input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
		</div>
	);
}

function ApiKeysCard() {
	const { data, isLoading } = useApiKeys();
	const createMut = useApiKeyCreate();
	const revokeMut = useApiKeyRevoke();
	const [showCreate, setShowCreate] = useState(false);
	const [keyName, setKeyName] = useState("");
	const [newKey, setNewKey] = useState("");

	const handleCreate = () => {
		if (!keyName.trim()) { toast.error("Name required"); return; }
		createMut.mutate({ name: keyName.trim() }, {
			onSuccess: (d) => { setNewKey(d.key); setKeyName(""); setShowCreate(false); toast.success("Key created. Copy it now — it won't be shown again."); },
			onError: (e) => toast.error((e as { error?: string })?.error ?? "Failed"),
		});
	};

	return (
		<Card>
			<CardHeader className="flex-row items-center justify-between">
				<CardTitle className="flex items-center gap-2 text-lg"><Key size={18} /> API Keys</CardTitle>
				<Button size="sm" variant="outline" onClick={() => setShowCreate(!showCreate)}><Plus size={14} /> New Key</Button>
			</CardHeader>
			<CardContent className="space-y-3">
				{newKey && (
					<div className="rounded border border-green-200 bg-green-50 p-3">
						<p className="text-xs font-medium text-green-700 mb-1">New key (copy now):</p>
						<div className="flex items-center gap-2">
							<code className="flex-1 text-xs break-all">{newKey}</code>
							<Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(newKey); toast.success("Copied!"); }}><Copy size={14} /></Button>
						</div>
					</div>
				)}
				{showCreate && (
					<div className="flex gap-2">
						<Input placeholder="Key name" value={keyName} onChange={(e) => setKeyName(e.target.value)} className="max-w-xs" />
						<Button size="sm" onClick={handleCreate} disabled={createMut.isPending}>{createMut.isPending ? "..." : "Create"}</Button>
						<Button size="sm" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
					</div>
				)}
				{isLoading ? <p className="text-sm text-[var(--muted-foreground)]">Loading...</p> : !(data?.keys ?? []).length ? (
					<p className="text-sm text-[var(--muted-foreground)]">No API keys yet.</p>
				) : (
					<div className="space-y-2">
						{data!.keys.map((k) => (
							<div key={k.id} className="flex items-center justify-between rounded border border-[var(--border)] px-3 py-2">
								<div>
									<p className="text-sm font-medium">{k.name}</p>
									<p className="text-xs text-[var(--muted-foreground)]">{k.prefix}••• · {k.status} · {new Date(k.created_at).toLocaleDateString()}</p>
								</div>
								{k.status === "active" && (
									<Button size="sm" variant="ghost" className="text-red-500" onClick={() => { if (confirm("Revoke this key?")) revokeMut.mutate(k.id, { onSuccess: () => toast.success("Revoked.") }); }}>
										<XCircle size={14} /> Revoke
									</Button>
								)}
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
