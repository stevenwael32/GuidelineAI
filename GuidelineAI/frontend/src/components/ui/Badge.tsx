import { cn } from "@/lib/utils";
import type { ComponentHealth } from "@/lib/types";
import { AlertTriangle, CheckCircle2, CircleSlash, ShieldAlert } from "lucide-react";

const STATE_STYLES: Record<ComponentHealth, string> = {
  ready: "bg-state-ready/10 text-state-ready border-state-ready/30",
  warning: "bg-state-boundary/10 text-state-boundary border-state-boundary/30",
  unavailable: "bg-state-unavailable/10 text-state-unavailable border-state-unavailable/30",
};

const STATE_ICON: Record<ComponentHealth, typeof CheckCircle2> = {
  ready: CheckCircle2,
  warning: AlertTriangle,
  unavailable: CircleSlash,
};

export function StatusBadge({
  status,
  label,
  urgent = false,
}: {
  status: ComponentHealth;
  label: string;
  urgent?: boolean;
}) {
  const Icon = urgent ? ShieldAlert : STATE_ICON[status];
  const classes = urgent ? "bg-state-urgent/10 text-state-urgent border-state-urgent/30" : STATE_STYLES[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        classes
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-mist-700 bg-ink-800/80 px-2.5 py-1 text-xs font-medium text-slate-300",
        className
      )}
    >
      {children}
    </span>
  );
}
