import { createContext, useContext, useState, type ReactNode } from "react";

interface AdFilters {
	accounts: string; // "meta:1,google:2" or ""
	dateFrom: string; // "YYYY-MM-DD"
	dateTo: string;
	dateLabel: string; // "Last 30 Days"
}

interface AdContextValue extends AdFilters {
	setAccounts: (accounts: string) => void;
	setDateRange: (from: string, to: string, label: string) => void;
	queryString: string; // "&accounts=...&date_from=...&date_to=..."
}

const defaultFrom = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
const defaultTo = new Date().toISOString().slice(0, 10);

const AdContext = createContext<AdContextValue>({
	accounts: "", dateFrom: defaultFrom, dateTo: defaultTo, dateLabel: "Last 30 Days",
	setAccounts: () => {}, setDateRange: () => {}, queryString: "",
});

export function AdManagerProvider({ children }: { children: ReactNode }) {
	const [accounts, setAccounts] = useState("");
	const [dateFrom, setDateFrom] = useState(defaultFrom);
	const [dateTo, setDateTo] = useState(defaultTo);
	const [dateLabel, setDateLabel] = useState("Last 30 Days");

	const setDateRange = (from: string, to: string, label: string) => {
		setDateFrom(from);
		setDateTo(to);
		setDateLabel(label);
	};

	// Build query string for API calls
	let qs = `&date_from=${dateFrom}&date_to=${dateTo}`;
	if (accounts) qs += `&accounts=${encodeURIComponent(accounts)}`;

	return (
		<AdContext.Provider value={{ accounts, dateFrom, dateTo, dateLabel, setAccounts, setDateRange, queryString: qs }}>
			{children}
		</AdContext.Provider>
	);
}

export function useAdContext() {
	return useContext(AdContext);
}
