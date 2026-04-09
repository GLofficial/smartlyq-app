import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight, ChevronLeft, Bot, Check } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { cn } from "@/lib/cn";

const STEPS = ["Bot Type", "Details", "Training", "Appearance"];

export function ChatbotCreatePage() {
	const navigate = useNavigate();
	const [step, setStep] = useState(0);
	const [submitting, setSubmitting] = useState(false);
	const [form, setForm] = useState({
		bot_type: 1,
		title: "",
		instruction: "",
		welcome_message: "Hi! How can I help you today?",
		training_url: "",
		training_text: "",
		primary_color: "#377DEE",
	});

	const update = (key: string, value: string | number) =>
		setForm((prev) => ({ ...prev, [key]: value }));

	const handleSubmit = async () => {
		if (!form.title.trim()) {
			toast.error("Enter a chatbot name.");
			return;
		}
		setSubmitting(true);
		try {
			await apiClient.post("/api/spa/chatbot/save", form);
			toast.success("Chatbot created!");
			navigate("/my/chatbot");
		} catch (err) {
			toast.error((err as { message?: string })?.message ?? "Failed to create chatbot.");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="mx-auto max-w-2xl space-y-6">
			<h1 className="text-2xl font-bold">Create Chatbot</h1>

			{/* Step indicator */}
			<div className="flex items-center gap-2">
				{STEPS.map((label, i) => (
					<div key={label} className="flex items-center gap-2">
						<button
							type="button"
							onClick={() => setStep(i)}
							className={cn(
								"flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors",
								i <= step
									? "bg-[var(--sq-primary)] text-white"
									: "bg-[var(--muted)] text-[var(--muted-foreground)]",
							)}
						>
							{i < step ? <Check size={14} /> : i + 1}
						</button>
						<span className={cn("text-sm", i === step ? "font-medium" : "text-[var(--muted-foreground)]")}>
							{label}
						</span>
						{i < STEPS.length - 1 && <ChevronRight size={14} className="text-[var(--muted-foreground)]" />}
					</div>
				))}
			</div>

			{/* Step content */}
			<Card>
				<CardContent className="p-6 space-y-4">
					{step === 0 && (
						<>
							<CardTitle className="text-base mb-4">Choose Bot Type</CardTitle>
							<div className="grid gap-3 sm:grid-cols-2">
								{[
									{ value: 1, label: "Assistant / Q&A", desc: "AI-powered Q&A using your knowledge base" },
									{ value: 2, label: "GHL Booking", desc: "Appointment booking via GoHighLevel" },
									{ value: 3, label: "WooCommerce", desc: "E-commerce assistant for WooCommerce stores" },
									{ value: 4, label: "Shopify", desc: "E-commerce assistant for Shopify stores" },
								].map((type) => (
									<button
										key={type.value}
										type="button"
										onClick={() => update("bot_type", type.value)}
										className={cn(
											"rounded-lg border p-4 text-left transition-colors",
											form.bot_type === type.value
												? "border-[var(--sq-primary)] bg-[color-mix(in_srgb,var(--sq-primary)_8%,transparent)]"
												: "border-[var(--border)] hover:border-[var(--sq-primary)]",
										)}
									>
										<p className="font-medium">{type.label}</p>
										<p className="mt-1 text-xs text-[var(--muted-foreground)]">{type.desc}</p>
									</button>
								))}
							</div>
						</>
					)}

					{step === 1 && (
						<>
							<CardTitle className="text-base mb-4">Bot Details</CardTitle>
							<div className="space-y-3">
								<div className="space-y-1">
									<label className="text-sm font-medium">Name *</label>
									<Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="My Chatbot" />
								</div>
								<div className="space-y-1">
									<label className="text-sm font-medium">Instructions</label>
									<textarea
										className="flex min-h-[100px] w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
										value={form.instruction}
										onChange={(e) => update("instruction", e.target.value)}
										placeholder="You are a helpful assistant for..."
									/>
								</div>
								<div className="space-y-1">
									<label className="text-sm font-medium">Welcome Message</label>
									<Input value={form.welcome_message} onChange={(e) => update("welcome_message", e.target.value)} />
								</div>
							</div>
						</>
					)}

					{step === 2 && (
						<>
							<CardTitle className="text-base mb-4">Training Data</CardTitle>
							<div className="space-y-3">
								<div className="space-y-1">
									<label className="text-sm font-medium">Website URL</label>
									<Input value={form.training_url} onChange={(e) => update("training_url", e.target.value)} placeholder="https://example.com" />
									<p className="text-xs text-[var(--muted-foreground)]">We'll scrape this URL to train your chatbot</p>
								</div>
								<div className="space-y-1">
									<label className="text-sm font-medium">Additional Text</label>
									<textarea
										className="flex min-h-[120px] w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
										value={form.training_text}
										onChange={(e) => update("training_text", e.target.value)}
										placeholder="Paste additional knowledge here..."
									/>
								</div>
							</div>
						</>
					)}

					{step === 3 && (
						<>
							<CardTitle className="text-base mb-4">Appearance</CardTitle>
							<div className="space-y-3">
								<div className="space-y-1">
									<label className="text-sm font-medium">Primary Color</label>
									<div className="flex items-center gap-3">
										<input
											type="color"
											value={form.primary_color}
											onChange={(e) => update("primary_color", e.target.value)}
											className="h-10 w-14 cursor-pointer rounded border border-[var(--border)]"
										/>
										<Input value={form.primary_color} onChange={(e) => update("primary_color", e.target.value)} className="w-32" />
									</div>
								</div>
								<div className="rounded-lg border border-[var(--border)] p-4">
									<p className="text-sm font-medium mb-2">Preview</p>
									<div className="flex items-start gap-3 rounded-lg p-3" style={{ backgroundColor: form.primary_color + "15" }}>
										<Bot size={24} style={{ color: form.primary_color }} />
										<div className="rounded-lg bg-white p-3 shadow-sm text-sm">{form.welcome_message || "Hi!"}</div>
									</div>
								</div>
							</div>
						</>
					)}
				</CardContent>
			</Card>

			{/* Navigation */}
			<div className="flex items-center justify-between">
				<Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
					<ChevronLeft size={16} /> Back
				</Button>
				{step < STEPS.length - 1 ? (
					<Button onClick={() => setStep(step + 1)}>
						Next <ChevronRight size={16} />
					</Button>
				) : (
					<Button onClick={handleSubmit} disabled={submitting}>
						<Bot size={16} /> {submitting ? "Creating..." : "Create Chatbot"}
					</Button>
				)}
			</div>
		</div>
	);
}
