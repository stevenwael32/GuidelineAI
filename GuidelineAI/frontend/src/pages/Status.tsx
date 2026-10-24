import { StatusCard } from "@/components/StatusCard";
import { StatusBadge } from "@/components/ui/Badge";
import { useSystemStatus } from "@/hooks/useSystemStatus";
import { formatDate } from "@/lib/utils";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function Status() {
  const { status, loading, error } = useSystemStatus(15000);

  return (
    <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">System Status</h1>
          <p className="mt-2 text-slate-400">Live health of every component in the evidence pipeline.</p>
        </div>
        {status && <StatusBadge status={status.overall} label={status.overall === "ready" ? "All systems ready" : status.overall === "warning" ? "Partial availability" : "Unavailable"} />}
      </div>

      {error && (
        <div className="mt-8 flex items-center gap-3 rounded-2xl border border-state-unavailable/30 bg-state-unavailable/5 p-5 text-sm text-slate-300">
          <AlertCircle className="h-5 w-5 shrink-0 text-state-unavailable" />
          No connection to the GuidelineAI backend. Start the backend service and refresh.
        </div>
      )}

      {loading && !status && (
        <div className="mt-8 flex items-center gap-2 text-sm text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Checking system status…
        </div>
      )}

      {status && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {status.components.map((c) => (
              <StatusCard key={c.name} component={c} />
            ))}
          </div>
          <p className="mt-6 text-xs text-slate-500">Last checked {formatDate(status.checked_at)} · refreshes every 15s</p>
        </>
      )}
    </div>
  );
}
