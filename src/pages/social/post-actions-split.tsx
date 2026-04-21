import { useState } from "react";
import { Send, Clock, CheckSquare, Repeat, ListOrdered, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type PostActionKey = "post_now" | "send_for_approval" | "recurring" | "add_to_queue";

interface Option {
	key: PostActionKey;
	label: string;
	description: string;
	icon: typeof Send;
	iconColor: string;
}

const OPTIONS: Option[] = [
	{
		key: "post_now",
		label: "Post Now",
		description: "Send out this post to the selected social channels/accounts",
		icon: Send,
		iconColor: "text-[var(--sq-primary)]",
	},
	{
		key: "send_for_approval",
		label: "Send Post for Approval",
		description: "Send for approval first within your agency or organization",
		icon: CheckSquare,
		iconColor: "text-emerald-600",
	},
	{
		key: "recurring",
		label: "Schedule Recurring Posts",
		description: "Schedule a recurring post for a time frame",
		icon: Repeat,
		iconColor: "text-violet-600",
	},
	{
		key: "add_to_queue",
		label: "Add to Queue",
		description: "Add this post to the selected category queue",
		icon: ListOrdered,
		iconColor: "text-orange-600",
	},
];

interface Props {
	disabled?: boolean;
	isSubmitting?: boolean;
	onAction: (action: PostActionKey) => void;
}

/**
 * Split-button: primary click fires Post Now. Chevron opens a popover with the 3 alternate
 * publish modes (Send for Approval, Schedule Recurring, Add to Queue). Save Draft and
 * Schedule Post remain as independent buttons to the left — this split is only the
 * "publish" decision.
 */
export function PostActionsSplit({ disabled, isSubmitting, onAction }: Props) {
	const [open, setOpen] = useState(false);

	function pick(action: PostActionKey) {
		setOpen(false);
		onAction(action);
	}

	return (
		<div className="flex-1 min-w-[140px] sm:min-w-[170px] flex">
			<Button
				className="flex-1 rounded-r-none text-xs sm:text-sm"
				disabled={disabled || isSubmitting}
				onClick={() => onAction("post_now")}
			>
				<Send className="w-4 h-4" /> Post Now
			</Button>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						className="rounded-l-none border-l border-white/30 px-2"
						disabled={disabled || isSubmitting}
						aria-label="More publish options"
					>
						<ChevronDown className="w-4 h-4" />
					</Button>
				</PopoverTrigger>
				<PopoverContent align="end" className="w-[340px] p-0 overflow-hidden">
					<ul>
						{OPTIONS.map((opt) => {
							const Icon = opt.icon;
							return (
								<li key={opt.key}>
									<button
										type="button"
										onClick={() => pick(opt.key)}
										className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-[var(--muted)]/60 transition-colors"
									>
										<Icon size={18} className={`${opt.iconColor} mt-0.5 shrink-0`} />
										<div className="min-w-0">
											<p className="text-sm font-medium text-[var(--foreground)]">{opt.label}</p>
											<p className="text-xs text-[var(--muted-foreground)] mt-0.5">{opt.description}</p>
										</div>
									</button>
								</li>
							);
						})}
					</ul>
				</PopoverContent>
			</Popover>
		</div>
	);
}

// Optional alt entry: a standalone scheduled-post option that the caller might want to
// expose as a second dropdown chevron. Kept separate so callers can control placement.
export const SCHEDULE_OPTION = {
	key: "scheduled" as const,
	label: "Schedule Post",
	description: "Schedule a post for a later date or time",
	icon: Clock,
	iconColor: "text-sky-600",
};
