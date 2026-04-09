import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserCog, Mail, Shield, Calendar } from "lucide-react";
import { useAccount } from "@/api/general";

export function AccountPage() {
	const { data, isLoading } = useAccount();
	const user = data?.user;

	return (
		<div className="mx-auto max-w-2xl space-y-6">
			<h1 className="text-2xl font-bold">Account</h1>

			{isLoading ? (
				<div className="flex h-40 items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
				</div>
			) : (
				<>
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-lg">
								<UserCog size={18} /> Profile
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<label className="text-sm font-medium">Name</label>
								<Input defaultValue={user?.name ?? ""} />
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
							<Button>Save Changes</Button>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Change Password</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<label className="text-sm font-medium">Current Password</label>
								<Input type="password" placeholder="Enter current password" />
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">New Password</label>
								<Input type="password" placeholder="Enter new password" />
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Confirm New Password</label>
								<Input type="password" placeholder="Confirm new password" />
							</div>
							<Button variant="outline">Update Password</Button>
						</CardContent>
					</Card>
				</>
			)}
		</div>
	);
}
