import { useState, useMemo } from "react";
import { Check, ChevronDown, ChevronUp, Search, AlertTriangle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { PlatformBrandIcon, PLATFORM_BRANDS } from "../platform-brands";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface SocialAccount {
  id: number;
  platform: string;
  account_name: string;
  account_username: string;
  profile_picture: string;
  token_status: string;
}

interface AccountSelectorProps {
  accounts: SocialAccount[];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Group accounts by their normalised platform key (e.g. facebook, instagram). */
function groupByPlatform(accounts: SocialAccount[]) {
  const groups: Record<string, SocialAccount[]> = {};
  for (const acc of accounts) {
    const key = acc.platform;
    if (!groups[key]) groups[key] = [];
    groups[key].push(acc);
  }
  return groups;
}

function platformLabel(platform: string): string {
  return PLATFORM_BRANDS[platform]?.label ?? platform;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PostAccountSelector({ accounts, selectedIds, onSelectionChange }: AccountSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  /* Filtered list -------------------------------------------------- */
  const filteredAccounts = useMemo(() => {
    if (!search.trim()) return accounts;
    const q = search.toLowerCase();
    return accounts.filter(
      (a) =>
        a.account_name.toLowerCase().includes(q) ||
        a.account_username.toLowerCase().includes(q) ||
        platformLabel(a.platform).toLowerCase().includes(q),
    );
  }, [accounts, search]);

  const grouped = useMemo(() => groupByPlatform(filteredAccounts), [filteredAccounts]);

  /* Selection helpers ---------------------------------------------- */
  const toggle = (id: number) => {
    onSelectionChange(
      selectedIds.includes(id) ? selectedIds.filter((i) => i !== id) : [...selectedIds, id],
    );
  };

  const selectAll = () => onSelectionChange(filteredAccounts.map((a) => a.id));
  const deselectAll = () => onSelectionChange([]);
  const allSelected = filteredAccounts.length > 0 && filteredAccounts.every((a) => selectedIds.includes(a.id));

  /* Accounts that need reconnection -------------------------------- */
  const needsReconnect = accounts.filter((a) => a.token_status !== "active" && a.token_status !== "ok");

  /* Selected accounts for the pill strip --------------------------- */
  const selectedAccounts = accounts.filter((a) => selectedIds.includes(a.id));

  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <p className="text-sm font-semibold text-primary mb-3">Select Accounts</p>

      <Popover open={open} onOpenChange={setOpen}>
        {/* Trigger ------------------------------------------------- */}
        <PopoverTrigger asChild>
          <button className="w-full flex items-center justify-between border-2 border-primary/30 rounded-lg px-4 py-2.5 hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-1 overflow-hidden">
              {selectedAccounts.length > 0 ? (
                <div className="flex -space-x-1.5 overflow-x-auto">
                  {selectedAccounts.map((acc) => (
                    <SelectedPill key={acc.id} account={acc} />
                  ))}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Select accounts...</span>
              )}
            </div>
            {open ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
            )}
          </button>
        </PopoverTrigger>

        {/* Dropdown content ---------------------------------------- */}
        <PopoverContent align="start" sideOffset={4} className="w-[var(--radix-popover-trigger-width)] p-0">
          {/* Search input */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search accounts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Select / Deselect All header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
              All Accounts
            </span>
            <button
              onClick={allSelected ? deselectAll : selectAll}
              className="text-xs font-medium text-primary hover:underline"
            >
              {allSelected ? "Deselect All" : "Select All"}
            </button>
          </div>

          {/* Reconnect warning */}
          {needsReconnect.length > 0 && (
            <div className="mx-3 mt-3 mb-1 bg-warning/15 border border-warning/30 rounded-lg px-4 py-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
              <p className="text-sm">
                <span className="font-semibold text-foreground">
                  {needsReconnect.length} account{needsReconnect.length > 1 ? "s" : ""} need
                  {needsReconnect.length === 1 ? "s" : ""} reconnecting.
                </span>{" "}
                <span className="text-muted-foreground">Token expired or revoked.</span>
              </p>
            </div>
          )}

          {/* Grouped account list */}
          <div className="max-h-[320px] overflow-y-auto py-1">
            {Object.entries(grouped).map(([platform, accs]) => (
              <div key={platform}>
                <div className="px-4 pt-3 pb-1">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {platformLabel(platform)}
                  </span>
                </div>
                {accs.map((acc) => (
                  <AccountRow
                    key={acc.id}
                    account={acc}
                    selected={selectedIds.includes(acc.id)}
                    onToggle={() => toggle(acc.id)}
                  />
                ))}
              </div>
            ))}
            {filteredAccounts.length === 0 && (
              <p className="px-4 py-6 text-sm text-muted-foreground text-center">No accounts found</p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

/** Small avatar pill shown in the collapsed trigger strip. */
function SelectedPill({ account }: { account: SocialAccount }) {
  return (
    <div className="relative shrink-0">
      {account.profile_picture ? (
        <img
          src={account.profile_picture}
          alt={account.account_name}
          className="w-9 h-9 rounded-full border-2 border-card object-cover"
        />
      ) : (
        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-bold border-2 border-card">
          {account.account_name.charAt(0).toUpperCase()}
        </div>
      )}
      <div
        className={cn(
          "absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white border border-card",
          PLATFORM_BRANDS[account.platform]?.color ?? "bg-muted",
        )}
      >
        <PlatformBrandIcon platformId={account.platform} size={8} className="w-4 h-4" />
      </div>
    </div>
  );
}

/** Single account row inside the dropdown list. */
function AccountRow({
  account,
  selected,
  onToggle,
}: {
  account: SocialAccount;
  selected: boolean;
  onToggle: () => void;
}) {
  const needsReconnect = account.token_status !== "active" && account.token_status !== "ok";

  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/40 transition-colors"
    >
      {/* Checkbox */}
      <div
        className={cn(
          "w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors",
          selected ? "bg-primary" : "border-2 border-muted-foreground/30",
        )}
      >
        {selected && <Check className="w-3 h-3 text-primary-foreground" />}
      </div>

      {/* Avatar with platform badge */}
      <div className="relative shrink-0">
        {account.profile_picture ? (
          <img
            src={account.profile_picture}
            alt={account.account_name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
            {account.account_name.charAt(0).toUpperCase()}
          </div>
        )}
        <div
          className={cn(
            "absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white border-2 border-card",
            PLATFORM_BRANDS[account.platform]?.color ?? "bg-muted",
          )}
        >
          <PlatformBrandIcon platformId={account.platform} size={10} className="w-5 h-5" />
        </div>
      </div>

      {/* Name and username */}
      <div className="flex flex-col items-start min-w-0">
        <span className="text-sm text-foreground truncate max-w-full flex items-center gap-1.5">
          {account.account_name}
          {needsReconnect && (
            <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 shrink-0" title="Needs reconnection" />
          )}
        </span>
        {account.account_username && (
          <span className="text-xs text-muted-foreground truncate max-w-full">
            @{account.account_username}
          </span>
        )}
      </div>
    </button>
  );
}
