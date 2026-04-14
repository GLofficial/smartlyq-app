import { useState, useMemo } from "react";

type SortDir = "asc" | "desc";

export function useSort<T>(items: T[], defaultKey?: keyof T) {
	const [sortKey, setSortKey] = useState<keyof T | null>(defaultKey ?? null);
	const [sortDir, setSortDir] = useState<SortDir>("desc");

	const toggle = (key: keyof T) => {
		if (sortKey === key) {
			setSortDir((d) => (d === "asc" ? "desc" : "asc"));
		} else {
			setSortKey(key);
			setSortDir("desc");
		}
	};

	const sorted = useMemo(() => {
		if (!sortKey) return items;
		return [...items].sort((a, b) => {
			const av = a[sortKey];
			const bv = b[sortKey];
			if (av == null && bv == null) return 0;
			if (av == null) return 1;
			if (bv == null) return -1;
			const cmp = typeof av === "number" && typeof bv === "number"
				? av - bv
				: String(av).localeCompare(String(bv));
			return sortDir === "asc" ? cmp : -cmp;
		});
	}, [items, sortKey, sortDir]);

	return { sorted, sortKey, sortDir, toggle };
}
