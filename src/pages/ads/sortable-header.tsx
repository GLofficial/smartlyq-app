import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface SortableHeaderProps {
	label: string;
	sortKey: string;
	currentKey: string | null;
	currentDir: "asc" | "desc";
	onSort: (key: string) => void;
	align?: "left" | "right";
}

export function SortableHeader({ label, sortKey, currentKey, currentDir, onSort, align }: SortableHeaderProps) {
	const isActive = currentKey === sortKey;
	return (
		<th className={`px-3 py-3 font-medium cursor-pointer select-none hover:text-[var(--foreground)] transition-colors ${align === "right" ? "text-right" : "text-left"}`}
			onClick={() => onSort(sortKey)}>
			<span className="inline-flex items-center gap-1">
				{label}
				{isActive ? (
					currentDir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />
				) : (
					<ArrowUpDown size={12} className="opacity-30" />
				)}
			</span>
		</th>
	);
}
