import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Image, Video, Layers, FileText, Check } from "lucide-react";
import type { WizardState } from "./wizard-layout";

const FORMATS = [
	{ id: "image", label: "Single Image", icon: Image },
	{ id: "video", label: "Video", icon: Video },
	{ id: "carousel", label: "Carousel", icon: Layers },
	{ id: "text", label: "Text Only", icon: FileText },
] as const;

const CTAS = ["LEARN_MORE", "SHOP_NOW", "SIGN_UP", "CONTACT_US", "DOWNLOAD", "GET_OFFER", "BOOK_NOW", "SUBSCRIBE"];

export function StepCreative({ state, update }: { state: WizardState; update: (p: Partial<WizardState>) => void }) {
	const c = state.creative;
	const setC = (partial: Partial<typeof c>) => update({ creative: { ...c, ...partial } });

	return (
		<div>
			<h2 className="text-lg font-semibold mb-1">Ad Creative</h2>
			<p className="text-sm text-[var(--muted-foreground)] mb-6">Design your ad content.</p>

			{/* Format */}
			<div className="mb-6">
				<label className="text-sm font-medium text-[var(--foreground)]">Ad Format</label>
				<div className="grid grid-cols-4 gap-3 mt-2">
					{FORMATS.map((f) => {
						const selected = c.format === f.id;
						return (
							<Card key={f.id} className={`cursor-pointer transition-all ${selected ? "ring-2 ring-[var(--sq-primary)]" : "hover:shadow-md"}`}
								onClick={() => setC({ format: f.id })}>
								<CardContent className="flex flex-col items-center gap-2 p-4 relative">
									{selected && <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-[var(--sq-primary)] flex items-center justify-center"><Check size={10} className="text-white" /></div>}
									<f.icon size={20} className={selected ? "text-[var(--sq-primary)]" : "text-[var(--muted-foreground)]"} />
									<span className="text-xs font-medium">{f.label}</span>
								</CardContent>
							</Card>
						);
					})}
				</div>
			</div>

			<div className="grid grid-cols-2 gap-6">
				<div className="space-y-4">
					<div>
						<label className="text-sm font-medium text-[var(--foreground)]">Headline</label>
						<Input value={c.headline} onChange={(e) => setC({ headline: e.target.value })} placeholder="Your headline here..." className="mt-1" />
						<p className="text-[11px] text-[var(--muted-foreground)] mt-1">{c.headline.length}/40 characters</p>
					</div>
					<div>
						<label className="text-sm font-medium text-[var(--foreground)]">Description</label>
						<Textarea value={c.description} onChange={(e) => setC({ description: e.target.value })} placeholder="Describe your offer..." className="mt-1" rows={3} />
					</div>
					<div>
						<label className="text-sm font-medium text-[var(--foreground)]">Destination URL</label>
						<Input value={c.destination_url} onChange={(e) => setC({ destination_url: e.target.value })} placeholder="https://..." className="mt-1" />
					</div>
				</div>

				<div className="space-y-4">
					<div>
						<label className="text-sm font-medium text-[var(--foreground)]">Call to Action</label>
						<div className="grid grid-cols-2 gap-2 mt-2">
							{CTAS.map((cta) => (
								<button key={cta} onClick={() => setC({ cta })}
									className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
										c.cta === cta ? "border-[var(--sq-primary)] bg-[var(--sq-primary)]/5 text-[var(--sq-primary)]" : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
									}`}>{cta.replace(/_/g, " ")}</button>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
