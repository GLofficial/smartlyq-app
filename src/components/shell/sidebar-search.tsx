import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
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
	X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useWorkspaceStore } from "@/stores/workspace-store";

interface QuickAction {
	label: string;
	description: string;
	icon: React.ElementType;
	path: string;
	keywords: string[];
}

function getQuickActions(wsHash: string): QuickAction[] {
	const p = (sub: string) => `/w/${wsHash}/${sub}`;
	return [
		{ label: "Create Post", description: "Compose a new social media post", icon: PenSquare, path: p("social-media/create-post"), keywords: ["post", "social", "publish"] },
		{ label: "AI Captain", description: "Start an AI-powered task", icon: Sparkles, path: p("captain"), keywords: ["ai", "captain", "assistant"] },
		{ label: "New Contact", description: "Add a new CRM contact", icon: UserPlus, path: p("crm/contacts"), keywords: ["contact", "crm", "client"] },
		{ label: "New Deal", description: "Create a deal in the pipeline", icon: Briefcase, path: p("crm/pipeline"), keywords: ["deal", "pipeline", "sale"] },
		{ label: "Generate Image", description: "Create an AI-generated image", icon: ImagePlus, path: p("image-generator"), keywords: ["image", "generate", "art"] },
		{ label: "Generate Video", description: "Create an AI-generated video", icon: VideoIcon, path: p("text-to-video"), keywords: ["video", "generate", "clip"] },
		{ label: "Create Chatbot", description: "Build a new chatbot", icon: Bot, path: p("chatbot/create"), keywords: ["chatbot", "bot", "automate"] },
		{ label: "Use Template", description: "Start from an AI template", icon: FileText, path: p("templates"), keywords: ["template", "ai", "content"] },
		{ label: "View Analytics", description: "Check your social analytics", icon: BarChart3, path: p("social-media/analytics"), keywords: ["analytics", "stats", "report"] },
		{ label: "Media Library", description: "Browse your uploaded files", icon: FolderOpen, path: p("media"), keywords: ["media", "files", "upload"] },
	];
}

export function SidebarSearch({ collapsed }: { collapsed: boolean }) {
	const [searchOpen, setSearchOpen] = useState(false);
	const [quickOpen, setQuickOpen] = useState(false);

	return (
		<div className={cn("flex items-center gap-1.5", collapsed && "flex-col")}>
			{/* Search trigger */}
			<SearchTrigger collapsed={collapsed} open={searchOpen} setOpen={setSearchOpen} />
			{/* Quick actions trigger */}
			<QuickActionsTrigger collapsed={collapsed} open={quickOpen} setOpen={setQuickOpen} />

			{/* Search modal — centered overlay */}
			{searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
			{/* Quick actions — floating panel */}
			{quickOpen && <QuickActionsPanel onClose={() => setQuickOpen(false)} />}
		</div>
	);
}

function SearchTrigger({ collapsed, setOpen }: { collapsed: boolean; open: boolean; setOpen: (v: boolean) => void }) {
	// Cmd+K shortcut
	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				setOpen(true);
			}
		}
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [setOpen]);

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
		<button
			type="button"
			onClick={() => setOpen(true)}
			className="flex flex-1 items-center gap-2 rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--muted-foreground)] hover:bg-[var(--accent)] transition-colors"
		>
			<Search size={16} className="shrink-0" />
			<span className="flex-1 text-left">Search...</span>
			<kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-[var(--border)] bg-[var(--muted)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--muted-foreground)]">
				<Command size={10} />K
			</kbd>
		</button>
	);
}

function QuickActionsTrigger({ collapsed, open, setOpen }: { collapsed: boolean; open: boolean; setOpen: (v: boolean) => void }) {
	return (
		<button
			type="button"
			onClick={() => setOpen(!open)}
			className={cn(
				"flex items-center justify-center rounded-lg transition-colors shrink-0",
				collapsed ? "px-2 py-2" : "h-[38px] w-[38px]",
				open
					? "bg-[var(--sq-primary)] text-white"
					: "bg-[var(--sq-primary)] text-white hover:opacity-90",
			)}
			title="Quick Actions"
		>
			<Zap size={18} />
		</button>
	);
}

/** Full-screen centered search modal (like Cmd+K command palette) */
function SearchModal({ onClose }: { onClose: () => void }) {
	const [search, setSearch] = useState("");
	const [selectedIdx, setSelectedIdx] = useState(0);
	const wsHash = useWorkspaceStore((s) => s.activeWorkspaceHash);
	const QUICK_ACTIONS = useMemo(() => getQuickActions(wsHash ?? ""), [wsHash]);
	const navigate = useNavigate();
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		setTimeout(() => inputRef.current?.focus(), 50);
	}, []);

	const filtered = useMemo(() => {
		if (!search.trim()) return [];
		const q = search.toLowerCase();
		return QUICK_ACTIONS.filter(
			(a) =>
				a.label.toLowerCase().includes(q) ||
				a.description.toLowerCase().includes(q) ||
				a.keywords.some((k) => k.includes(q)),
		);
	}, [search]);

	useEffect(() => { setSelectedIdx(0); }, [filtered.length]);

	const handleSelect = useCallback((action: QuickAction) => {
		navigate(action.path);
		onClose();
	}, [navigate, onClose]);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1)); }
		else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx((i) => Math.max(i - 1, 0)); }
		else if (e.key === "Enter" && filtered[selectedIdx]) { e.preventDefault(); handleSelect(filtered[selectedIdx]); }
		else if (e.key === "Escape") { onClose(); }
	};

	return createPortal(
		<div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]" onClick={onClose}>
			{/* Backdrop */}
			<div className="absolute inset-0 bg-black/40" />

			{/* Modal */}
			<div
				className="relative w-full max-w-lg rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Search input */}
				<div className="flex items-center gap-3 border-b border-[var(--border)] px-4">
					<Search size={18} className="shrink-0 text-[var(--muted-foreground)]" />
					<input
						ref={inputRef}
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="Search for anything..."
						className="flex-1 bg-transparent py-4 text-base text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none"
					/>
					<button
						type="button"
						onClick={onClose}
						className="rounded border border-[var(--border)] px-2 py-0.5 text-xs font-medium text-[var(--muted-foreground)] hover:bg-[var(--accent)] transition-colors"
					>
						ESC
					</button>
				</div>

				{/* Results */}
				<div className="max-h-72 overflow-y-auto">
					{search.trim() === "" && (
						<p className="px-4 py-6 text-center text-sm text-[var(--muted-foreground)]">
							No recently viewed items.
						</p>
					)}
					{search.trim() !== "" && filtered.length === 0 && (
						<p className="px-4 py-6 text-center text-sm text-[var(--muted-foreground)]">
							No results found for "{search}"
						</p>
					)}
					{filtered.length > 0 && (
						<div className="p-2">
							{filtered.map((action, idx) => {
								const Icon = action.icon;
								return (
									<button
										key={action.path}
										type="button"
										onClick={() => handleSelect(action)}
										onMouseEnter={() => setSelectedIdx(idx)}
										className={cn(
											"flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
											idx === selectedIdx ? "bg-[var(--accent)]" : "",
										)}
									>
										<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)]">
											<Icon size={18} className="text-[var(--muted-foreground)]" />
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium text-[var(--foreground)]">{action.label}</p>
											<p className="text-xs text-[var(--muted-foreground)] truncate">{action.description}</p>
										</div>
									</button>
								);
							})}
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="flex items-center justify-end border-t border-[var(--border)] px-4 py-2">
					<span className="text-xs text-[var(--muted-foreground)]">
						Open on{" "}
						<kbd className="inline-flex items-center gap-0.5 rounded border border-[var(--border)] bg-[var(--muted)] px-1 py-0.5 text-[10px] font-medium">
							<Command size={9} /> K
						</kbd>
					</span>
				</div>
			</div>
		</div>,
		document.body,
	);
}

/** Quick actions floating panel — opens to the right of the sidebar */
function QuickActionsPanel({ onClose }: { onClose: () => void }) {
	const navigate = useNavigate();
	const panelRef = useRef<HTMLDivElement>(null);
	const wsHash = useWorkspaceStore((s) => s.activeWorkspaceHash);
	const QUICK_ACTIONS = useMemo(() => getQuickActions(wsHash ?? ""), [wsHash]);

	useEffect(() => {
		function handleClick(e: MouseEvent) {
			if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
				onClose();
			}
		}
		// Delay to avoid immediate close from the trigger click
		const timer = setTimeout(() => {
			document.addEventListener("mousedown", handleClick);
		}, 10);
		return () => { clearTimeout(timer); document.removeEventListener("mousedown", handleClick); };
	}, [onClose]);

	const handleSelect = (action: QuickAction) => {
		navigate(action.path);
		onClose();
	};

	return createPortal(
		<div
			ref={panelRef}
			className="fixed z-[100] w-80 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xl overflow-hidden animate-in fade-in slide-in-from-left-2 duration-150"
			style={{ top: 120, left: 240 }}
		>
			{/* Header */}
			<div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
				<h3 className="text-sm font-semibold text-[var(--foreground)]">Quick Actions</h3>
				<button
					type="button"
					onClick={onClose}
					className="rounded-md p-1 text-[var(--muted-foreground)] hover:bg-[var(--accent)] transition-colors"
				>
					<X size={16} />
				</button>
			</div>

			{/* Actions list */}
			<div className="max-h-96 overflow-y-auto p-2">
				{QUICK_ACTIONS.map((action) => {
					const Icon = action.icon;
					return (
						<button
							key={action.path}
							type="button"
							onClick={() => handleSelect(action)}
							className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left hover:bg-[var(--accent)] transition-colors"
						>
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)]">
								<Icon size={20} className="text-[var(--muted-foreground)]" />
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium text-[var(--foreground)]">{action.label}</p>
								<p className="text-xs text-[var(--muted-foreground)] truncate">{action.description}</p>
							</div>
						</button>
					);
				})}
			</div>
		</div>,
		document.body,
	);
}
