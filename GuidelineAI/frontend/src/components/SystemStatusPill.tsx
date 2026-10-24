import { useSystemStatus } from "@/hooks/useSystemStatus";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const DOT_COLOR = {
  ready: "bg-state-ready",
  warning: "bg-state-boundary",
  unavailable: "bg-state-unavailable",
};

const LABEL = {
  ready: "All systems ready",
  warning: "Partial availability",
  unavailable: "System unavailable",
};

export function SystemStatusPill({ className }: { className?: string }) {
  const { status, loading, error } = useSystemStatus();

  const overall = error ? "unavailable" : status?.overall ?? "warning";

  return (
    <Link
      to="/status"
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-mist-700 bg-ink-900/70 px-3 py-1.5 text-xs text-slate-300 hover:border-mist-600 transition-colors",
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60",
            DOT_COLOR[overall]
          )}
        />
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", DOT_COLOR[overall])} />
      </span>
      {loading ? "Checking status…" : error ? "Backend unavailable" : LABEL[overall]}
    </Link>
  );
}
