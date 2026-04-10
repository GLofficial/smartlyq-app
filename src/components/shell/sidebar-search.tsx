import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
	Search,
	Command,
	PenSquare,
	UserPlus,
	Bot,
	ImagePlus,
	VideoIcon,
	FileText,
	Sparkles,
	BarChart3,
	FolderOpen,
	Briefcase,
	Zap,
} from "lucide-react";
import { cn } from "@/lib/cn";

interface QuickAction {
	label: string;
	description: string;
	icon: React.ElementType;
	path: string;
	keywords: string[];
}

const QUICK_ACTIONS: QuickAction[] = [
	{
		label: "Create Post",
		description: "Compose a new social media post",
		icon: PenSquare,
		path: "/my/social-media/create-post",
		keywords: ["post", "social", "publish", "create"],
	},
	{
		label: "AI Captain",
		description: "Start an AI-powered task",
		icon: Sparkles,
		path: "/my/captain",
		keywords: ["ai", "captain", "assistant", "chat"],
	},
	{
		label: "New Contact",
		description: "Add a new CRM contact",
		icon: UserPlus,
		path: "/my/crm/contacts",
		keywords: ["contact", "crm", "person", "client", "add"],
	},
	{
		label: "New Deal",
		description: "Create a deal in the pipeline",
		icon: Briefcase,
		path: "/my/crm/pipeline",
		keywords: ["deal", "pipeline", "sale", "opportunity"],
	},
	{
		label: "Generate Image",
		description: "Create an AI-generated image",
		icon: ImagePlus,
		path: "/my/image-generator",
		keywords: ["image", "picture", "generate", "ai", "art"],
	},
	{
		label: "Generate Video",
		description: "Create an AI-generated video",
		icon: VideoIcon,
		path: "/my/text-to-video",
		keywords: ["video", "generate", "ai", "clip"],
	},
	{
		label: "Create Chatbot",
		description: "Build a new chatbot",
		icon: Bot,
		path: "/my/chatbot/create",
		keywords: ["chatbot", "bot", "automate", "create"],
	},
	{
		label: "Use Template",
		description: "Start from an AI template",
		icon: FileText,
		path: "/my/templates",
		keywords: ["template", "ai", "content", "write"],
	},
	{
		label: "View Analytics",
		description: "Check your social analytics",
		icon: BarChart3,
		path: "/my/social-media/analytics",
		keywords: ["analytics", "stats", "report", "data"],
	},
	{
		label: "Media Library",
		description: "Browse your uploaded files",
		icon: FolderOpen,
		path: "/my/media",
		keywords: ["media", "files", "upload", "library", "images"],
	},
];

export function SidebarSearch({ collapsed }: { collapsed: boolean }) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [selectedIdx, setSelectedIdx] = useState(0);
	const navigate = useNavigate();
	const popoverRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// Close on outside click
	useEffect(() => {
		if (!open) return;
		function handleClick(e: MouseEvent) {
			if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, [open]);

	// Cmd+K shortcut
	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				setOpen((prev) => !prev);
			}
		}
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);

	// Focus on open
	useEffect(() => {
		if (open) {
			setTimeout(() => inputRef.current?.focus(), 50);
			setSearch("");
			setSelectedIdx(0);
		}
	}, [open]);

	const filtered = useMemo(() => {
		if (!search.trim()) return QUICK_ACTIONS;
		const q = search.toLowerCase();
		return QUICK_ACTIONS.filter(
			(a) =>
				a.label.toLowerCase().includes(q) ||
				a.description.toLowerCase().includes(q) ||
				a.keywords.some((k) => k.includes(q)),
		);
	}, [search]);

	// Reset index when results change
	useEffect(() => {
		setSelectedIdx(0);
	}, [filtered.length]);

	const handleSelect = (action: QuickAction) => {
		navigate(action.path);
		setOpen(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1));
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setSelectedIdx((i) => Math.max(i - 1, 0));
		} else if (e.key === "Enter" && filtered[selectedIdx]) {
			e.preventDefault();
			handleSelect(filtered[selectedIdx]);
		} else if (e.key === "Escape") {
			setOpen(false);
		}
	};

	if (collapsed) {
		return (
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="flex items-center justify-center rounded-md px-2 py-2 text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] transition-colors"
				title="Search (⌘K)"
			>
				<Search size={18} />
			</button>
		);
	}

	return (
		<div className="relative" ref={popoverRef}>
			{/* Trigger bar */}
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="flex w-full items-center gap-2 rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--muted-foreground)] hover:bg-[var(--accent)] transition-colors"
			>
				<Search size={16} className="shrink-0" />
				<span className="flex-1 text-left">Search...</span>
				<kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-[var(--border)] bg-[var(--muted)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--muted-foreground)]">
					<Command size={10} />K
				</kbd>
			</button>

			{/* Popover */}
			{open && (
				<div className="absolute left-0 right-0 top-full z-50 mt-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-lg overflow-hidden">
					{/* Search input */}
					<div className="p-3 border-b border-[var(--border)]">
						<div className="relative">
							<Search
								size={16}
								className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
							/>
							<input
								ref={inputRef}
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								onKeyDown={handleKeyDown}
								placeholder="Search or jump to..."
								className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] py-2 pl-9 pr-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
							/>
						</div>
					</div>

					{/* Quick actions */}
					<div className="max-h-72 overflow-y-auto p-2">
						<p className="px-2 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
							<Zap size={10} className="inline mr-1" />
							Quick Actions
						</p>
						{filtered.map((action, idx) => {
							const Icon = action.icon;
							return (
								<button
									key={action.path}
									type="button"
									onClick={() => handleSelect(action)}
									onMouseEnter={() => setSelectedIdx(idx)}
									className={cn(
										"flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors",
										idx === selectedIdx
											? "bg-[var(--accent)]"
											: "hover:bg-[var(--accent)]",
									)}
								>
									<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)]">
										<Icon size={18} />
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium text-[var(--foreground)]">
											{action.label}
										</p>
										<p className="text-xs text-[var(--muted-foreground)] truncate">
											{action.description}
										</p>
									</div>
								</button>
							);
						})}
						{filtered.length === 0 && (
							<p className="px-2 py-4 text-center text-sm text-[var(--muted-foreground)]">
								No results found
							</p>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
