import { StatusBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { ComponentStatus } from "@/lib/types";

const STATUS_TEXT: Record<ComponentStatus["status"], string> = {
  ready: "Ready",
  warning: "Warning",
  unavailable: "Unavailable",
};

export function StatusCard({ component }: { component: ComponentStatus }) {
  return (
    <Card className="flex items-start justify-between gap-4 p-5">
      <div>
        <p className="text-sm font-semibold text-white">{component.name}</p>
        <p className="mt-1.5 text-sm text-slate-400">{component.detail}</p>
      </div>
      <StatusBadge status={component.status} label={STATUS_TEXT[component.status]} />
    </Card>
  );
}
