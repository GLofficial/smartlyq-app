import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserCog, Mail, Shield, Calendar, Save } from "lucide-react";
import { useAccount } from "@/api/general";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

export function AccountPage() {
	const { data, isLoading, refetch } = useAccount();
	const user = data?.user;

	const [name, setName] = useState("");
	const [nameLoaded, setNameLoaded] = useState(false);
	const [savingProfile, setSavingProfile] = useState(false);

	const [currentPw, setCurrentPw] = useState("");
	const [newPw, setNewPw] = useState("");
	const [confirmPw, setConfirmPw] = useState("");
	const [savingPw, setSavingPw] = useState(false);

	// Initialize name from API data once
	if (user?.name && !nameLoaded) {
		setName(user.name);
		setNameLoaded(true);
	}

	const handleSaveProfile = async () => {
		if (!name.trim()) {
			toast.error("Name is required.");
			return;
		}
		setSavingProfile(true);
		try {
			const res = await apiClient.post<{ message: string }>("/api/spa/account/update", { name });
			toast.success(res.message);
			refetch();
		} catch (err) {
			toast.error((err as { message?: string })?.message ?? "Failed to save.");
		} finally {
			setSavingProfile(false);
		}
	};

	const handleChangePassword = async () => {
		if (newPw.length < 8) {
			toast.error("New password must be at least 8 characters.");
			return;
		}
		if (newPw !== confirmPw) {
			toast.error("Passwords do not match.");
			return;
		}
		setSavingPw(true);
		try {
			const res = await apiClient.post<{ message: string }>("/api/spa/account/password", {
				current_password: currentPw,
				new_password: newPw,
			});
			toast.success(res.message);
			setCurrentPw("");
			setNewPw("");
			setConfirmPw("");
		} catch (err) {
			toast.error((err as { message?: string })?.message ?? "Failed to change password.");
		} finally {
			setSavingPw(false);
		}
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
					<Button onClick={handleSaveProfile} disabled={savingProfile}>
						<Save size={16} /> {savingProfile ? "Saving..." : "Save Changes"}
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
					<Button variant="outline" onClick={handleChangePassword} disabled={savingPw}>
						{savingPw ? "Updating..." : "Update Password"}
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
