import { useState } from "react";
import { Search, PlusCircle, ChevronDown, ChevronUp, AlertTriangle, Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { PlatformBrandIcon, PLATFORM_BRANDS } from "../platform-brands";

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface SocialAccount {
  id: number;
  platform: string;
  name: string;
  profile_pic?: string;
  status?: string;
}

interface AccountSelectorProps {
  accounts: SocialAccount[];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
}

export function PostAccountSelector({ accounts, selectedIds, onSelectionChange }: AccountSelectorProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const safeAccounts = Array.isArray(accounts) ? accounts : [];

  const filteredAccounts = safeAccounts.filter(
    (acc) =>
      (acc.name ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (acc.platform ?? "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const needsReconnect = safeAccounts.filter((a) => a.status === "expired" || a.status === "revoked" || a.status === "disconnected");

  const toggleAccount = (accId: number) => {
    const newSelected = selectedIds.includes(accId)
      ? selectedIds.filter((id) => id !== accId)
      : [...selectedIds, accId];
    onSelectionChange(newSelected);
  };

  const selectAll = () => onSelectionChange(filteredAccounts.map((a) => a.id));
  const unselectAll = () => onSelectionChange([]);

  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <p className="text-sm font-semibold text-primary mb-3">Select Accounts</p>

      {/* Selected accounts strip */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-full flex items-center justify-between border-2 border-primary/30 rounded-lg px-4 py-2.5 hover:border-primary/50 transition-colors"
      >
        <div className="flex items-center gap-1 flex-1 min-w-0">
          {selectedIds.length > 0 ? (
            <div className="flex flex-wrap gap-x-2 gap-y-2 py-1 pr-1">
              {selectedIds.map((accId) => {
                const acc = safeAccounts.find((a) => a.id === accId);
                if (!acc) return null;
                const brand = PLATFORM_BRANDS[acc.platform];
                const Icon = brand?.Icon;
                return (
                  <div key={accId} className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold overflow-hidden">
                      {acc.profile_pic ? (
                        <img src={acc.profile_pic} alt="" className="w-full h-full object-cover" />
                      ) : (
                        (acc.name ?? "?").charAt(0).toUpperCase()
                      )}
                    </div>
                    <div
                      className={cn(
                        "absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white border-2 border-card",
                        brand?.color ?? "bg-muted",
                      )}
                    >
                      {Icon && <Icon size={10} />}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Select accounts...</span>
          )}
        </div>
        {showDropdown ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {showDropdown && (
        <div className="mt-2 border border-border rounded-lg bg-card shadow-lg overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Connect new account */}
          <div className="px-4 py-3 border-b border-border">
            <button className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium">
              <PlusCircle className="w-5 h-5" />
              Connect a new Account
            </button>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">All Accounts</span>
            <button
              onClick={selectedIds.length === filteredAccounts.length ? unselectAll : selectAll}
              className="text-xs font-medium text-primary hover:underline"
            >
              {selectedIds.length === filteredAccounts.length ? "Unselect All" : "Select All"}
            </button>
          </div>

          {/* Warning banner */}
          {needsReconnect.length > 0 && (
            <div className="mx-3 mt-3 mb-1 bg-warning/15 border border-warning/30 rounded-lg px-4 py-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
              <p className="text-sm">
                <span className="font-semibold text-foreground">
                  {needsReconnect.length} account{needsReconnect.length > 1 ? "s" : ""} needs reconnecting.
                </span>{" "}
                <span className="text-muted-foreground">Token expired or revoked.</span>{" "}
                <button className="text-primary font-medium hover:underline">Reconnect now</button>
              </p>
            </div>
          )}

          {/* Account list */}
          <div className="max-h-[320px] overflow-y-auto py-2">
            {filteredAccounts.map((acc) => {
              const isSelected = selectedIds.includes(acc.id);
              const brand = PLATFORM_BRANDS[acc.platform];
              return (
                <button
                  key={acc.id}
                  onClick={() => toggleAccount(acc.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors"
                >
                  <div className={cn("w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors", isSelected ? "bg-primary" : "border-2 border-muted-foreground/30")}>
                    {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold overflow-hidden">
                      {acc.profile_pic ? (
                        <img src={acc.profile_pic} alt="" className="w-full h-full object-cover" />
                      ) : (
                        (acc.name ?? "?").charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className={cn("absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-primary-foreground border-2 border-card", brand?.color ?? "bg-muted")}>
                      <PlatformBrandIcon platformId={acc.platform} size={10} />
                    </div>
                  </div>
                  <span className="text-sm text-foreground text-left">{acc.name}</span>
                </button>
              );
            })}
            {filteredAccounts.length === 0 && (
              <p className="px-4 py-6 text-sm text-muted-foreground text-center">No accounts found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
