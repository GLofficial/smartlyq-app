import { useState, useCallback, createContext, useContext, type ReactNode } from "react";
import { Card, CardContent } from "./card";
import { Button } from "./button";

interface ConfirmOptions {
	title: string;
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	variant?: "default" | "destructive";
}

interface ConfirmContextType {
	confirm: (options: ConfirmOptions) => Promise<boolean | null>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function useConfirm() {
	const ctx = useContext(ConfirmContext);
	if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
	return ctx.confirm;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
	const [state, setState] = useState<{ options: ConfirmOptions; resolve: (v: boolean | null) => void } | null>(null);

	const confirm = useCallback((options: ConfirmOptions): Promise<boolean | null> => {
		return new Promise((resolve) => {
			setState({ options, resolve });
		});
	}, []);

	const handleResult = (result: boolean | null) => {
		state?.resolve(result);
		setState(null);
	};

	return (
		<ConfirmContext.Provider value={{ confirm }}>
			{children}
			{state && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => handleResult(null)}>
					<Card className="w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
						<CardContent className="p-6 space-y-4">
							<h3 className="text-lg font-semibold">{state.options.title}</h3>
							<p className="text-sm text-[var(--muted-foreground)]">{state.options.message}</p>
							<div className="flex justify-end gap-3">
								<Button variant="outline" onClick={() => handleResult(null)}>
									{state.options.cancelLabel ?? "Cancel"}
								</Button>
								<Button
									variant={state.options.variant === "destructive" ? "destructive" : "default"}
									onClick={() => handleResult(true)}
								>
									{state.options.confirmLabel ?? "Confirm"}
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			)}
		</ConfirmContext.Provider>
	);
}
