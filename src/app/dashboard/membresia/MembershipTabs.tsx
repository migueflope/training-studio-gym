"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CreditCard, History, Receipt } from "lucide-react";

interface MembershipTabsProps {
  activeContent: React.ReactNode;
  historyContent: React.ReactNode;
  paymentsContent: React.ReactNode;
}

type Tab = "active" | "history" | "payments";

const TABS: Array<{ id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: "active", label: "Plan actual", icon: CreditCard },
  { id: "history", label: "Historial", icon: History },
  { id: "payments", label: "Pagos", icon: Receipt },
];

export function MembershipTabs({
  activeContent,
  historyContent,
  paymentsContent,
}: MembershipTabsProps) {
  const searchParams = useSearchParams();
  const initial: Tab = searchParams.get("upload") === "1" ? "payments" : "active";
  const [tab, setTab] = useState<Tab>(initial);

  return (
    <div>
      <div className="flex gap-1 p-1 bg-secondary/40 rounded-xl border border-border mb-6 w-fit">
        {TABS.map((t) => {
          const isActive = tab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div>
        {tab === "active" && activeContent}
        {tab === "history" && historyContent}
        {tab === "payments" && paymentsContent}
      </div>
    </div>
  );
}
