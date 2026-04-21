import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { PlatformIcon } from "./platform-icon";

type IgMethod = "facebook" | "direct";

interface Props {
	open: boolean;
	onClose: () => void;
	onConfirm: (method: IgMethod) => void;
}

const METHODS: Array<{
	id: IgMethod;
	title: string;
	icon: "facebook" | "instagram";
	requirements: string[];
}> = [
	{
		id: "facebook",
		title: "Connect Via Facebook",
		icon: "facebook",
		requirements: [
			"Your Instagram profile is a Business/Creator account",
			"You are an admin of your Facebook Page",
			"Your Facebook Page is linked to Instagram Business profile",
		],
	},
	{
		id: "direct",
		title: "Connect Via Instagram",
		icon: "instagram",
		requirements: [
			"Your Instagram profile is a Business/Creator account",
			"Login credentials for the Instagram account",
		],
	},
];

export function InstagramMethodModal({ open, onClose, onConfirm }: Props) {
	const [selected, setSelected] = useState<IgMethod>("facebook");

	return (
		<Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
			{/*
			  Force hard centering with inline style to beat any stray transform from parent
			  layout or lingering animation transform. Tailwind's translate-x-[-50%] gets
			  combined with the slide-in animation transforms by tailwindcss-animate and can
			  end up at a non-center resting position on some browser/version combos.
			*/}
			<DialogContent
				className="max-w-2xl"
				style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
			>
				<DialogHeader>
					<DialogTitle className="text-lg">Connect Instagram</DialogTitle>
				</DialogHeader>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-2">
					{METHODS.map((m) => (
						<MethodCard
							key={m.id}
							method={m}
							selected={selected === m.id}
							onSelect={() => setSelected(m.id)}
						/>
					))}
				</div>

				<DialogFooter className="gap-2">
					<Button variant="outline" onClick={onClose}>Close</Button>
					<Button onClick={() => onConfirm(selected)}>Connect</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function MethodCard({
	method, selected, onSelect,
}: {
	method: typeof METHODS[number];
	selected: boolean;
	onSelect: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onSelect}
			className={`relative text-left rounded-lg border-2 p-4 transition-colors ${
				selected
					? "border-[var(--sq-primary)] bg-[var(--sq-primary)]/5"
					: "border-[var(--border)] hover:border-[var(--muted-foreground)]/40"
			}`}
		>
			{/* Radio indicator top-right */}
			<div className={`absolute top-3 right-3 h-4 w-4 rounded-full border-2 ${
				selected ? "border-[var(--sq-primary)]" : "border-[var(--muted-foreground)]/50"
			}`}>
				{selected && <div className="h-2 w-2 m-[1px] rounded-full bg-[var(--sq-primary)]" />}
			</div>

			<div className="flex items-center gap-2 mb-3 pr-6">
				<PlatformIcon platform={method.icon} size={22} />
				<span className="text-sm font-semibold">{method.title}</span>
			</div>

			<p className="text-xs font-semibold mb-2">Before proceeding, ensure the following:</p>
			<ul className="space-y-1.5">
				{method.requirements.map((req) => (
					<li key={req} className="flex items-start gap-2 text-xs text-[var(--muted-foreground)]">
						<Check size={13} className="text-emerald-600 mt-0.5 shrink-0" />
						<span>{req}</span>
					</li>
				))}
			</ul>
		</button>
	);
}
