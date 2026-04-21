import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, Search, Pin, ExternalLink } from "lucide-react";
import { cn } from "@/lib/cn";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { apiClient } from "@/lib/api-client";
import { STORAGE_KEYS } from "@/lib/constants";
import { toast } from "sonner";
import { queryClient } from "@/lib/query-client";
import type { Workspace } from "@/lib/types";

export function WorkspaceSwitcher() {
	const workspaces = useWorkspaceStore((s) => s.workspaces);
	const activeId = useWorkspaceStore((s) => s.activeWorkspaceId);
	const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);

	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [pinnedIds, setPinnedIds] = useState<Set<number>>(() => {
		try {
			const saved = localStorage.getItem("sq_pinned_workspaces");
			return saved ? new Set(JSON.parse(saved)) : new Set<number>();
		} catch {
			return new Set<number>();
		}
	});
	const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });

	const triggerRef = useRef<HTMLButtonElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const activeWs = workspaces.find((w) => w.id === activeId);

	const openPanel = useCallback(() => {
		if (triggerRef.current) {
			const rect = triggerRef.current.getBoundingClientRect();
			setPanelPos({ top: rect.top, left: rect.right + 8 });
		}
		setOpen(true);
	}, []);

	// Close on outside click
	useEffect(() => {
		if (!open) return;
		function handleClick(e: MouseEvent) {
			const target = e.target as Node;
			if (
				panelRef.current && !panelRef.current.contains(target) &&
				triggerRef.current && !triggerRef.current.contains(target)
			) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, [open]);

	useEffect(() => {
		if (open) {
			setTimeout(() => inputRef.current?.focus(), 50);
		} else {
			setSearch("");
		}
	}, [open]);

	const togglePin = (id: number) => {
		setPinnedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			localStorage.setItem("sq_pinned_workspaces", JSON.stringify([...next]));
			return next;
		});
	};

	const navigate = useNavigate();
	const location = useLocation();

	const handleSwitch = async (wsId: number) => {
		if (wsId === activeId) { setOpen(false); return; }
		const targetWs = workspaces.find((w) => w.id === wsId);
		if (!targetWs?.hash_id) { toast.error("Workspace hash not found."); return; }

		try {
			const res = await apiClient.post<{ access_token: string; active_workspace_hash: string }>(
				"/api/spa/workspace/switch",
				{ workspace_id: wsId },
			);
			localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, res.access_token);

			// Clear all cached data BEFORE updating state — prevents components
			// from re-rendering and reading stale cache from the old workspace
			queryClient.clear();

			setActiveWorkspace(wsId, res.active_workspace_hash);
			setOpen(false);

			// Navigate to same subpath under new workspace hash (no full reload)
			const currentSubpath = location.pathname.replace(/^\/w\/[A-Za-z0-9_-]{22}\/?/, "");
			navigate(`/w/${res.active_workspace_hash}/${currentSubpath || "dashboard"}`);
		} catch {
			toast.error("Failed to switch workspace.");
		}
	};

	const q = search.toLowerCase();
	const filtered = workspaces.filter((ws) => ws.name.toLowerCase().includes(q));
	const pinned = filtered.filter((ws) => pinnedIds.has(ws.id));
	const rest = filtered.filter((ws) => !pinnedIds.has(ws.id));

	return (
		<>
			{/* Trigger */}
			<button
				ref={triggerRef}
				type="button"
				onClick={() => (open ? setOpen(false) : openPanel())}
				className="flex w-full items-center gap-2 rounded-lg bg-[var(--sidebar-accent)] px-3 py-2 hover:bg-[color-mix(in_srgb,var(--sidebar-accent)_80%,var(--sidebar-border))] transition-colors"
			>
				<WorkspaceIcon
					name={activeWs?.name ?? "W"}
					iconUrl={activeWs?.icon_url ?? null}
					seed={activeWs?.id ?? 0}
					className="h-7 w-7 rounded-md text-[11px]"
				/>
				<div className="flex-1 min-w-0 text-left">
					<p className="truncate text-sm font-medium text-[var(--sidebar-foreground)]">
						{activeWs?.name ?? "Workspace"}
					</p>
				</div>
				<ChevronDown
					size={16}
					className={cn(
						"shrink-0 text-[var(--muted-foreground)] transition-transform duration-200",
						open && "rotate-180",
					)}
				/>
			</button>

			{/* Floating panel — portalled to body, positioned next to sidebar */}
			{open &&
				createPortal(
					<div
						ref={panelRef}
						className="fixed z-[100] w-80 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xl overflow-hidden animate-in fade-in slide-in-from-left-2 duration-150"
						style={{ top: panelPos.top, left: panelPos.left }}
					>
						{/* Search */}
						<div className="p-3 border-b border-[var(--border)]">
							<div className="relative">
								<Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
								<input
									ref={inputRef}
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									placeholder="Search for a workspace..."
									className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] py-2.5 pl-9 pr-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
								/>
							</div>
						</div>

						{/* List */}
						<div className="max-h-80 overflow-y-auto p-2">
							{pinned.length > 0 && (
								<>
									<p className="px-2 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
										Pinned
									</p>
									{pinned.map((ws) => (
										<WorkspaceRow key={ws.id} ws={ws} isActive={ws.id === activeId} isPinned onSwitch={handleSwitch} onTogglePin={togglePin} />
									))}
								</>
							)}
							{rest.length > 0 && (
								<>
									<p className="px-2 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
										{pinned.length > 0 ? "All Workspaces" : "Workspaces"}
									</p>
									{rest.map((ws) => (
										<WorkspaceRow key={ws.id} ws={ws} isActive={ws.id === activeId} isPinned={false} onSwitch={handleSwitch} onTogglePin={togglePin} />
									))}
								</>
							)}
							{filtered.length === 0 && (
								<p className="px-2 py-6 text-center text-sm text-[var(--muted-foreground)]">
									No workspaces found
								</p>
							)}
						</div>
					</div>,
					document.body,
				)}
		</>
	);
}

function WorkspaceRow({
	ws, isActive, isPinned, onSwitch, onTogglePin,
}: {
	ws: Workspace;
	isActive: boolean;
	isPinned: boolean;
	onSwitch: (id: number) => void;
	onTogglePin: (id: number) => void;
}) {
	return (
		<div
			className={cn(
				"group flex items-center gap-3 rounded-lg px-2.5 py-2.5 cursor-pointer transition-colors",
				isActive ? "bg-[color-mix(in_srgb,var(--sq-primary)_10%,transparent)]" : "hover:bg-[var(--accent)]",
			)}
			onClick={() => onSwitch(ws.id)}
			onKeyDown={(e) => e.key === "Enter" && onSwitch(ws.id)}
			role="button"
			tabIndex={0}
		>
			<WorkspaceIcon
				name={ws.name}
				iconUrl={ws.icon_url ?? null}
				seed={ws.id}
				className="h-10 w-10 rounded-lg text-sm"
			/>
			<div className="flex-1 min-w-0">
				<p className={cn("truncate text-sm font-medium", isActive ? "text-[var(--sq-primary)]" : "text-[var(--foreground)]")}>
					{ws.name}
				</p>
				<p className="truncate text-xs text-[var(--muted-foreground)]">{ws.slug || "workspace"}</p>
			</div>
			<div className="flex items-center gap-0.5 shrink-0">
				<button
					type="button"
					onClick={(e) => { e.stopPropagation(); onTogglePin(ws.id); }}
					className={cn(
						"rounded-md p-1.5 transition-colors",
						isPinned ? "text-[var(--sq-primary)]" : "text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100",
						"hover:bg-[var(--accent)]",
					)}
					title={isPinned ? "Unpin" : "Pin"}
				>
					<Pin size={14} className={isPinned ? "fill-current" : ""} />
				</button>
				<button
					type="button"
					onClick={(e) => { e.stopPropagation(); onSwitch(ws.id); }}
					className="rounded-md p-1.5 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 hover:bg-[var(--accent)] transition-colors"
					title="Open"
				>
					<ExternalLink size={14} />
				</button>
			</div>
		</div>
	);
}

const FALLBACK_COLORS = [
	"bg-blue-500", "bg-emerald-500", "bg-orange-500", "bg-purple-500",
	"bg-pink-500", "bg-cyan-500", "bg-amber-500", "bg-indigo-500",
];

function WorkspaceIcon({
	name, iconUrl, seed, className,
}: {
	name: string;
	iconUrl: string | null;
	seed: number;
	className?: string;
}) {
	// Track broken-image state so a failed <img> fetch falls back to the initial
	// tile instead of showing a broken-image glyph.
	const [failed, setFailed] = useState(false);
	const showImg = !!iconUrl && !failed;
	const initial = (name || "W").charAt(0).toUpperCase();
	const color = FALLBACK_COLORS[Math.abs(seed) % FALLBACK_COLORS.length];
	return (
		<div className={cn("flex shrink-0 items-center justify-center overflow-hidden font-bold text-white", !showImg && color, className)}>
			{showImg ? (
				<img
					src={iconUrl!}
					alt={name}
					loading="lazy"
					onError={() => setFailed(true)}
					className="h-full w-full object-cover"
				/>
			) : (
				<span>{initial}</span>
			)}
		</div>
	);
}
