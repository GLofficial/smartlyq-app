import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface ModelOption {
	model: string;
	name: string;
	type: string;
	provider: string;
}

const ICON_BASE = "https://app.smartlyq.com/assets/img/icon/";

const PROVIDER_ICONS: Record<string, string> = {
	openai: "OpenAI.png",
	anthropic: "anthropic.png",
	deepseek: "Deepseek-logo-icon.png",
	gemini: "Gemini.png",
	imagen: "Gemini.png",
	xai: "Grok-Logo.webp",
	recraft: "Recraft.png",
	"black forest labs": "Black%20Forest%20Labs.png",
	bfl: "Black%20Forest%20Labs.png",
	pollo: "pollo-demo.png",
};

export function providerIcon(provider: string): string | null {
	const icon = PROVIDER_ICONS[provider.toLowerCase()];
	return icon ? ICON_BASE + icon : null;
}

interface Props {
	value: string;
	options: ModelOption[];
	onChange: (v: string) => void;
	placeholder?: string;
}

export function ModelSelectField({ value, options, onChange, placeholder = "— select model —" }: Props) {
	const [open, setOpen] = useState(false);
	const selected = options.find((o) => o.model === value);
	const icon = selected ? providerIcon(selected.provider) : null;

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					type="button"
					className="flex h-10 w-full items-center justify-between rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
				>
					<span className="flex items-center gap-2 truncate">
						{icon && <img src={icon} alt="" width={16} height={16} className="shrink-0 rounded-sm" />}
						<span className={selected ? "" : "text-[var(--muted-foreground)]"}>
							{selected ? selected.name : placeholder}
						</span>
					</span>
					<ChevronDown size={14} className="shrink-0 text-[var(--muted-foreground)]" />
				</button>
			</PopoverTrigger>
			<PopoverContent className="w-80 p-1" align="start">
				<div className="max-h-64 overflow-y-auto">
					{options.length === 0 ? (
						<p className="px-3 py-2 text-xs text-[var(--muted-foreground)]">
							No models available. Add models in the Models tab first.
						</p>
					) : (
						options.map((opt) => {
							const optIcon = providerIcon(opt.provider);
							const isSelected = opt.model === value;
							return (
								<button
									key={opt.model}
									type="button"
									onClick={() => { onChange(opt.model); setOpen(false); }}
									className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--accent)] ${isSelected ? "bg-[var(--accent)]" : ""}`}
								>
									<span className="flex items-center gap-2 min-w-0">
										{optIcon && <img src={optIcon} alt="" width={16} height={16} className="shrink-0 rounded-sm" />}
										<span className="truncate">{opt.name}</span>
										<span className="shrink-0 rounded bg-[var(--muted)] px-1.5 py-0.5 text-[10px] font-medium uppercase text-[var(--muted-foreground)]">
											{opt.provider}
										</span>
									</span>
									{isSelected && <Check size={14} className="ml-2 shrink-0 text-[var(--sq-primary)]" />}
								</button>
							);
						})
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}
