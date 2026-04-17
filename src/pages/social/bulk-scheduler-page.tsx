import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Check, AlertCircle, ArrowRight, Download } from "lucide-react";
import { useBulkAccounts, useBulkImport, useBulkCreate } from "@/api/bulk-scheduler";
import { PlatformIcon } from "./platform-icon";
import { toast } from "sonner";

type Step = 1 | 2 | 3 | 4;

export function BulkSchedulerPage() {
	const [step, setStep] = useState<Step>(1);
	const [csvFile, setCsvFile] = useState<File | null>(null);
	const [imported, setImported] = useState<{ headers: string[]; rows: string[][]; total_rows: number } | null>(null);
	const [selectedAccountIds, setSelectedAccountIds] = useState<number[]>([]);
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const { data: accountsData } = useBulkAccounts();
	const importMut = useBulkImport();
	const createMut = useBulkCreate();

	const accounts = accountsData?.accounts ?? [];

	const handleFileChoose = (f: File) => {
		setCsvFile(f);
	};

	const handleImport = () => {
		if (!csvFile) { toast.error("Choose a CSV file first."); return; }
		importMut.mutate(csvFile, {
			onSuccess: (r) => {
				setImported(r);
				setStep(2);
				toast.success(`Imported ${r.total_rows} rows.`);
			},
			onError: (err) => toast.error((err as Error).message || "Failed to parse CSV"),
		});
	};

	const toggleAccount = (id: number) => {
		setSelectedAccountIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
	};

	const handleSchedule = () => {
		if (!imported) { toast.error("No data to schedule."); return; }
		if (selectedAccountIds.length === 0) { toast.error("Select at least one account."); return; }
		const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
		createMut.mutate(
			{ rows: imported.rows, account_ids: selectedAccountIds, timezone: userTimezone },
			{
				onSuccess: (r) => {
					toast.success(`Scheduled ${r.created} posts.`);
					if (r.errors && r.errors.length > 0) toast.warning(`${r.errors.length} rows had errors.`);
					setStep(4);
				},
				onError: (err) => toast.error((err as Error).message || "Failed to schedule"),
			},
		);
	};

	const downloadTemplate = () => {
		const csv = "content,scheduled_time,media_url\n\"Hello world!\",\"2026-05-01 10:00:00\",\"\"\n\"Another post\",\"2026-05-01 14:30:00\",\"https://example.com/img.jpg\"\n";
		const blob = new Blob([csv], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url; a.download = "bulk-schedule-template.csv"; a.click();
		URL.revokeObjectURL(url);
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Bulk Scheduler</h1>
					<p className="text-sm text-[var(--muted-foreground)] mt-1">Import posts from a CSV file and schedule them to your social accounts.</p>
				</div>
				<Button variant="outline" onClick={downloadTemplate}><Download size={14} /> Download CSV Template</Button>
			</div>

			{/* Step indicator */}
			<div className="flex items-center gap-2">
				{[
					{ n: 1, label: "Upload CSV" },
					{ n: 2, label: "Preview Data" },
					{ n: 3, label: "Select Accounts" },
					{ n: 4, label: "Schedule" },
				].map((s, i) => (
					<div key={s.n} className="flex-1 flex items-center gap-2">
						<div className={`flex items-center gap-2 ${step >= s.n ? "text-[var(--sq-primary)]" : "text-[var(--muted-foreground)]"}`}>
							<div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= s.n ? "bg-[var(--sq-primary)] text-white" : "bg-[var(--muted)]"}`}>
								{step > s.n ? <Check size={14} /> : s.n}
							</div>
							<span className="text-sm font-medium hidden sm:block">{s.label}</span>
						</div>
						{i < 3 && <div className={`flex-1 h-px ${step > s.n ? "bg-[var(--sq-primary)]" : "bg-[var(--border)]"}`} />}
					</div>
				))}
			</div>

			{/* Step 1: Upload */}
			{step === 1 && (
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Upload Your CSV File</CardTitle>
						<p className="text-sm text-[var(--muted-foreground)]">Each row in the CSV will become a social media post.</p>
					</CardHeader>
					<CardContent>
						<div
							className="border-2 border-dashed border-[var(--border)] rounded-lg p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-[var(--sq-primary)] transition-colors"
							onClick={() => fileInputRef.current?.click()}
							onDragOver={(e) => { e.preventDefault(); }}
							onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFileChoose(f); }}
						>
							<Upload size={40} className="text-[var(--muted-foreground)]/60" />
							{csvFile ? (
								<>
									<p className="text-sm font-semibold">{csvFile.name}</p>
									<p className="text-xs text-[var(--muted-foreground)]">{(csvFile.size / 1024).toFixed(1)} KB</p>
								</>
							) : (
								<>
									<p className="text-sm font-semibold">Drag &amp; drop your CSV file here</p>
									<p className="text-xs text-[var(--muted-foreground)]">or click to browse</p>
								</>
							)}
							<input
								ref={fileInputRef}
								type="file"
								accept=".csv"
								className="hidden"
								onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileChoose(f); }}
							/>
						</div>
						<div className="flex justify-end mt-4">
							<Button onClick={handleImport} disabled={!csvFile || importMut.isPending}>
								<FileText size={14} /> {importMut.isPending ? "Parsing..." : "Import & Preview"}
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Step 2: Preview */}
			{step === 2 && imported && (
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Preview — {imported.total_rows} rows</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="overflow-x-auto border border-[var(--border)] rounded max-h-[400px] overflow-y-auto">
							<table className="w-full text-sm">
								<thead className="sticky top-0 bg-[var(--muted)]/50">
									<tr>
										<th className="px-3 py-2 text-left text-xs font-semibold">#</th>
										{imported.headers.map((h, i) => (
											<th key={i} className="px-3 py-2 text-left text-xs font-semibold">{h}</th>
										))}
									</tr>
								</thead>
								<tbody>
									{imported.rows.slice(0, 50).map((row, i) => (
										<tr key={i} className="border-t border-[var(--border)]">
											<td className="px-3 py-2 text-xs text-[var(--muted-foreground)]">{i + 1}</td>
											{row.map((cell, j) => (
												<td key={j} className="px-3 py-2 text-xs truncate max-w-[240px]">{cell}</td>
											))}
										</tr>
									))}
								</tbody>
							</table>
							{imported.rows.length > 50 && (
								<p className="text-xs text-[var(--muted-foreground)] text-center py-2">+ {imported.rows.length - 50} more rows...</p>
							)}
						</div>
						<div className="flex justify-between mt-4">
							<Button variant="outline" onClick={() => setStep(1)}>Back</Button>
							<Button onClick={() => setStep(3)}>Next <ArrowRight size={14} /></Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Step 3: Select Accounts */}
			{step === 3 && (
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Select Accounts</CardTitle>
						<p className="text-sm text-[var(--muted-foreground)]">Choose which accounts will receive these posts.</p>
					</CardHeader>
					<CardContent>
						{accounts.length === 0 ? (
							<p className="text-sm text-[var(--muted-foreground)] py-4">No connected accounts. Connect at least one account first.</p>
						) : (
							<div className="grid gap-2 sm:grid-cols-2 max-h-[400px] overflow-y-auto">
								{accounts.map((acc) => {
									const selected = selectedAccountIds.includes(acc.id);
									return (
										<button
											key={acc.id}
											onClick={() => toggleAccount(acc.id)}
											className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${selected ? "border-[var(--sq-primary)] bg-[var(--sq-primary)]/5" : "border-[var(--border)] hover:bg-[var(--muted)]/30"}`}
										>
											<div className="relative shrink-0">
												{acc.avatar ? (
													<img src={acc.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
												) : (
													<div className="h-9 w-9 rounded-full bg-[var(--muted)] flex items-center justify-center text-sm font-semibold">
														{acc.name.charAt(0).toUpperCase()}
													</div>
												)}
												<div className="absolute -bottom-0.5 -right-0.5 bg-[var(--card)] rounded-full p-0.5">
													<PlatformIcon platform={acc.platform} size={12} />
												</div>
											</div>
											<div className="min-w-0 flex-1">
												<p className="text-sm font-semibold truncate">{acc.name}</p>
												<p className="text-xs text-[var(--muted-foreground)] truncate">{acc.username || acc.platform}</p>
											</div>
											{selected && <Check size={16} className="text-[var(--sq-primary)] shrink-0" />}
										</button>
									);
								})}
							</div>
						)}
						<div className="flex justify-between mt-4">
							<Button variant="outline" onClick={() => setStep(2)}>Back</Button>
							<Button onClick={handleSchedule} disabled={selectedAccountIds.length === 0 || createMut.isPending}>
								{createMut.isPending ? "Scheduling..." : `Schedule ${imported?.total_rows ?? 0} posts`}
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Step 4: Done */}
			{step === 4 && (
				<Card>
					<CardContent className="flex flex-col items-center gap-3 py-12">
						<div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
							<Check size={32} className="text-green-600" />
						</div>
						<h3 className="text-lg font-semibold">{createMut.data?.message ?? "Done"}</h3>
						<p className="text-sm text-[var(--muted-foreground)]">{createMut.data?.created ?? 0} posts scheduled successfully.</p>
						{createMut.data?.errors && createMut.data.errors.length > 0 && (
							<div className="w-full max-w-md border border-amber-200 bg-amber-50 rounded p-3 mt-2">
								<p className="text-xs font-semibold text-amber-700 flex items-center gap-1"><AlertCircle size={12} /> {createMut.data.errors.length} rows had errors</p>
								<ul className="mt-1 text-xs text-amber-700 list-disc list-inside space-y-0.5">
									{createMut.data.errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
								</ul>
							</div>
						)}
						<Button onClick={() => { setStep(1); setCsvFile(null); setImported(null); setSelectedAccountIds([]); }}>
							Schedule Another Batch
						</Button>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
