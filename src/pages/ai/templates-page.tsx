import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Star, FileText } from "lucide-react";
import { useTemplates } from "@/api/tools";

export function TemplatesPage() {
	const { data, isLoading } = useTemplates();
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState("");

	const filtered = (data?.templates ?? []).filter((t) => {
		if (search && !t.name.toLowerCase().includes(search.toLowerCase()) &&
			!t.description.toLowerCase().includes(search.toLowerCase())) return false;
		if (category && t.category !== category) return false;
		return true;
	});

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Templates</h1>

			<div className="flex flex-wrap items-center gap-3">
				<div className="relative flex-1 min-w-[200px] max-w-sm">
					<Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
					<Input placeholder="Search templates..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
				</div>
				<div className="flex flex-wrap gap-2">
					<Button variant={category === "" ? "default" : "outline"} size="sm" onClick={() => setCategory("")}>All</Button>
					{(data?.categories ?? []).map((cat) => (
						<Button key={cat} variant={category === cat ? "default" : "outline"} size="sm" onClick={() => setCategory(cat)}>
							{cat}
						</Button>
					))}
				</div>
			</div>

			{isLoading ? (
				<div className="flex h-40 items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
				</div>
			) : (
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{filtered.map((t) => (
						<Card key={t.id} className="cursor-pointer transition-all hover:border-[var(--sq-primary)] hover:shadow-md">
							<CardContent className="p-4">
								<div className="flex items-start gap-3">
									<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--sq-primary)_10%,transparent)]">
										{t.icon ? <span className="text-lg">{t.icon}</span> : <FileText size={18} className="text-[var(--sq-primary)]" />}
									</div>
									<div className="min-w-0 flex-1">
										<div className="flex items-center gap-1">
											<p className="font-medium text-sm">{t.name}</p>
											{t.premium && <Star size={12} className="text-yellow-500 fill-yellow-500" />}
										</div>
										<p className="mt-1 text-xs text-[var(--muted-foreground)] line-clamp-2">{t.description}</p>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{!isLoading && filtered.length === 0 && (
				<p className="text-center text-sm text-[var(--muted-foreground)]">No templates found.</p>
			)}
		</div>
	);
}
