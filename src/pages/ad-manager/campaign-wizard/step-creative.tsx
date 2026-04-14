import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Image, Video, Layers, Grid3X3, Clapperboard, Check, Upload, Plus } from "lucide-react";
import type { WizardState } from "./wizard-types";

const FORMATS = [
	{ id: "image", label: "Single Image", desc: "One image with text", icon: Image },
	{ id: "video", label: "Video", desc: "Short or long-form video", icon: Video },
	{ id: "carousel", label: "Carousel", desc: "Multiple scrollable cards", icon: Layers },
	{ id: "collection", label: "Collection", desc: "Cover image with items", icon: Grid3X3 },
	{ id: "stories", label: "Stories Ad", desc: "Full-screen vertical", icon: Clapperboard },
] as const;

const CTAS = ["Shop Now", "Learn More", "Sign Up", "Contact Us", "Download", "Get Offer", "Book Now", "Subscribe"];
const PREVIEW_TABS = ["Feed", "Stories", "Reels"] as const;

export function StepCreative({ state, update }: { state: WizardState; update: (p: Partial<WizardState>) => void }) {
	const [previewTab, setPreviewTab] = useState<string>("Feed");

	const setHeadline = (i: number, v: string) => {
		const h = [...state.headlines]; h[i] = v; update({ headlines: h });
	};
	const addHeadline = () => { if (state.headlines.length < 5) update({ headlines: [...state.headlines, ""] }); };
	const setDesc = (i: number, v: string) => {
		const d = [...state.descriptions]; d[i] = v; update({ descriptions: d });
	};
	const addDesc = () => { if (state.descriptions.length < 5) update({ descriptions: [...state.descriptions, ""] }); };

	return (
		<div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
			<h2 className="text-lg font-semibold text-[var(--foreground)]">Ad Creative</h2>
			<p className="text-sm text-[var(--muted-foreground)] mb-5">Choose your format and create your {state.platform || ""} ad content.</p>

			{/* Ad Format */}
			<div className="mb-5">
				<label className="text-sm font-medium text-[var(--foreground)]">Ad Format</label>
				<div className="grid grid-cols-3 lg:grid-cols-5 gap-3 mt-2">
					{FORMATS.map((f) => {
						const sel = state.creative_format === f.id;
						return (
							<div key={f.id} onClick={() => update({ creative_format: f.id })}
								className={`flex flex-col items-center gap-2 rounded-lg border p-3 cursor-pointer transition-all text-center ${
									sel ? "border-[var(--sq-primary)] bg-[var(--sq-primary)]/5" : "border-[var(--border)] hover:border-[var(--muted-foreground)]"
								}`}>
								{sel && <Check size={12} className="text-[var(--sq-primary)] self-end" />}
								<f.icon size={20} className={sel ? "text-[var(--sq-primary)]" : "text-[var(--muted-foreground)]"} />
								<p className="text-xs font-medium">{f.label}</p>
								<p className="text-[10px] text-[var(--muted-foreground)]">{f.desc}</p>
							</div>
						);
					})}
				</div>
			</div>

			{/* Dynamic Creative Toggle */}
			<div className="flex items-center justify-between rounded-lg border border-[var(--border)] px-4 py-3 mb-5">
				<div>
					<p className="text-sm font-medium text-[var(--foreground)]">Dynamic Creative</p>
					<p className="text-xs text-[var(--muted-foreground)]">Automatically generate optimized ad variations</p>
				</div>
				<button onClick={() => update({ dynamic_creative: !state.dynamic_creative })}
					className={`relative h-6 w-11 rounded-full transition-colors ${state.dynamic_creative ? "bg-[var(--sq-primary)]" : "bg-gray-300"}`}>
					<span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${state.dynamic_creative ? "translate-x-5" : "translate-x-0.5"}`} />
				</button>
			</div>

			<div className="grid grid-cols-2 gap-6">
				{/* Left: Upload + Text */}
				<div className="space-y-4">
					{/* Image Upload */}
					<div>
						<label className="text-sm font-medium text-[var(--foreground)]">Image</label>
						<div className="mt-1 flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-[var(--border)] p-6 text-center cursor-pointer hover:border-[var(--muted-foreground)]">
							<Upload size={24} className="text-[var(--muted-foreground)]" />
							<p className="text-xs text-[var(--muted-foreground)]">Drop images here or click to upload</p>
							<p className="text-[10px] text-[var(--muted-foreground)]">JPG, GIF or PNG</p>
						</div>
					</div>
					{/* Video Upload */}
					<div>
						<label className="text-sm font-medium text-[var(--muted-foreground)]">Video <span className="text-xs">(optional)</span></label>
						<div className="mt-1 flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-[var(--border)] p-4 text-center cursor-pointer hover:border-[var(--muted-foreground)]">
							<Video size={20} className="text-[var(--muted-foreground)]" />
							<p className="text-[10px] text-[var(--muted-foreground)]">Drop video here or click to upload / MP4, MOV or WebM</p>
						</div>
					</div>
					{/* Primary Text */}
					<div>
						<div className="flex items-center justify-between">
							<label className="text-sm font-medium text-[var(--foreground)]">Primary Text</label>
							<span className="text-[10px] text-[var(--muted-foreground)]">125 chars recommended</span>
						</div>
						<Textarea value={state.primary_text} onChange={(e) => update({ primary_text: e.target.value })}
							placeholder="Write your ad copy..." className="mt-1" rows={3} />
						<p className="text-[10px] text-[var(--muted-foreground)] text-right mt-0.5">{state.primary_text.length}/125</p>
					</div>
					{/* Headlines */}
					<div>
						<label className="text-sm font-medium text-[var(--foreground)]">Headlines <span className="text-xs text-[var(--muted-foreground)]">(up to 5, 40 chars)</span></label>
						{state.headlines.map((h, i) => (
							<Input key={i} value={h} onChange={(e) => setHeadline(i, e.target.value)} maxLength={40}
								placeholder={`Headline ${i + 1}`} className="mt-1" />
						))}
						{state.headlines.length < 5 && (
							<button onClick={addHeadline} className="mt-1 text-xs text-[var(--sq-primary)] font-medium hover:underline flex items-center gap-1"><Plus size={12} /> Add Headline</button>
						)}
					</div>
					{/* Descriptions */}
					<div>
						<label className="text-sm font-medium text-[var(--foreground)]">Descriptions <span className="text-xs text-[var(--muted-foreground)]">(up to 5, 30 chars)</span></label>
						{state.descriptions.map((d, i) => (
							<Input key={i} value={d} onChange={(e) => setDesc(i, e.target.value)} maxLength={30}
								placeholder={`Description ${i + 1}`} className="mt-1" />
						))}
						{state.descriptions.length < 5 && (
							<button onClick={addDesc} className="mt-1 text-xs text-[var(--sq-primary)] font-medium hover:underline flex items-center gap-1"><Plus size={12} /> Add Description</button>
						)}
					</div>
					{/* CTA + URL */}
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="text-sm font-medium text-[var(--foreground)]">Call to Action</label>
							<select value={state.cta} onChange={(e) => update({ cta: e.target.value })}
								className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm">
								{CTAS.map((c) => <option key={c} value={c}>{c}</option>)}
							</select>
						</div>
						<div>
							<label className="text-sm font-medium text-[var(--foreground)]">Destination URL</label>
							<Input value={state.destination_url} onChange={(e) => update({ destination_url: e.target.value })}
								placeholder="https://example.com/landing" className="mt-1" />
						</div>
					</div>
				</div>

				{/* Right: Ad Preview */}
				<div>
					<label className="text-sm font-medium text-[var(--foreground)]">Ad Preview</label>
					<div className="mt-1 rounded-lg border border-[var(--border)] p-4">
						{/* Preview Tabs */}
						<div className="flex gap-1 mb-3 border-b border-[var(--border)] pb-2">
							{PREVIEW_TABS.map((t) => (
								<button key={t} onClick={() => setPreviewTab(t)}
									className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
										previewTab === t ? "bg-[var(--muted)] text-[var(--foreground)]" : "text-[var(--muted-foreground)]"
									}`}>{t}</button>
							))}
						</div>
						{/* Mockup */}
						<div className="bg-[var(--muted)] rounded-lg p-4 min-h-[300px]">
							<div className="flex items-center gap-2 mb-3">
								<div className="h-8 w-8 rounded-full bg-[var(--border)]" />
								<div>
									<p className="text-xs font-medium text-[var(--foreground)]">Your Business</p>
									<p className="text-[10px] text-[var(--muted-foreground)]">Sponsored</p>
								</div>
							</div>
							<p className="text-xs text-[var(--foreground)] mb-3">{state.primary_text || "Your ad text will appear here."}</p>
							<div className="aspect-square bg-[var(--border)] rounded-lg flex items-center justify-center mb-3">
								{state.image_url ? <img src={state.image_url} alt="" className="w-full h-full object-cover rounded-lg" /> : <Image size={32} className="text-[var(--muted-foreground)]" />}
							</div>
							<div className="flex items-center justify-between bg-[var(--card)] rounded-lg px-3 py-2">
								<div>
									<p className="text-[10px] text-[var(--muted-foreground)]">{state.destination_url || "yourwebsite.com"}</p>
									<p className="text-xs font-medium text-[var(--foreground)]">{state.headlines[0] || "Your Headline Here"}</p>
								</div>
								<button className="rounded bg-[var(--sq-primary)] px-3 py-1 text-[10px] font-medium text-white">{state.cta || "Shop Now"}</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
