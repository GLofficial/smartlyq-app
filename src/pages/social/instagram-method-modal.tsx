import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
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

/**
 * Custom portal modal — intentionally NOT using shadcn's Dialog because its
 * translate(-50%,-50%) positioning was fighting with tailwindcss-animate's
 * slide-in transforms in a way that left the modal stuck in the top-left
 * quadrant. Using fixed+flex gives bulletproof viewport centering.
 */
export function InstagramMethodModal({ open, onClose, onConfirm }: Props) {
	const [selected, setSelected] = useState<IgMethod>("facebook");

	// Lock body scroll while modal is open + close on Escape.
	useEffect(() => {
		if (!open) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}
		window.addEventListener("keydown", onKey);
		return () => {
			document.body.style.overflow = prev;
			window.removeEventListener("keydown", onKey);
		};
	}, [open, onClose]);

	if (!open) return null;

	return createPortal(
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-150"
			onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
			role="dialog"
			aria-modal="true"
		>
			<div
				className="relative bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-xl p-6 w-full max-w-2xl"
				onMouseDown={(e) => e.stopPropagation()}
			>
				<button
					type="button"
					onClick={onClose}
					className="absolute top-4 right-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
					aria-label="Close"
				>
					<X size={16} />
				</button>

				<h2 className="text-lg font-semibold leading-none tracking-tight mb-4">Connect Instagram</h2>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					{METHODS.map((m) => (
						<MethodCard
							key={m.id}
							method={m}
							selected={selected === m.id}
							onSelect={() => setSelected(m.id)}
						/>
					))}
				</div>

				<div className="mt-5 flex justify-end gap-2">
					<Button variant="outline" onClick={onClose}>Close</Button>
					<Button onClick={() => onConfirm(selected)}>Connect</Button>
				</div>
			</div>
		</div>,
		document.body,
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
