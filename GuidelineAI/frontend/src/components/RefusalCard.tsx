import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { QueryResponse } from "@/lib/types";
import { isUrgent, refusalReasonLabel } from "@/lib/utils";
import { FileSearch, ShieldAlert, TriangleAlert } from "lucide-react";

export function RefusalCard({ result, onViewEvidence }: { result: QueryResponse; onViewEvidence: () => void }) {
  const urgent = isUrgent(result.refusal_reasons);

  return (
    <Card
      className={`p-6 ${
        urgent ? "border-state-urgent/40 bg-state-urgent/[0.04]" : "border-state-boundary/40 bg-state-boundary/[0.04]"
      }`}
    >
      <div className="flex items-center gap-2">
        {urgent ? (
          <ShieldAlert className="h-5 w-5 text-state-urgent" />
        ) : (
          <TriangleAlert className="h-5 w-5 text-state-boundary" />
        )}
        <h3 className="text-base font-semibold text-white">Evidence boundary reached</h3>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-200">{result.recommendation}</p>

      {result.refusal_reasons.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Reason</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {result.refusal_reasons.map((reason) => (
              <span
                key={reason}
                className={`rounded-full border px-3 py-1 text-xs font-medium ${
                  reason === "urgent_clinical_red_flags"
                    ? "border-state-urgent/40 bg-state-urgent/10 text-state-urgent"
                    : "border-state-boundary/40 bg-state-boundary/10 text-state-boundary"
                }`}
              >
                {refusalReasonLabel(reason)}
              </span>
            ))}
          </div>
        </div>
      )}

      {result.question_suggestion && (
        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Recommendation</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">{result.question_suggestion}</p>
        </div>
      )}

      {result.evidence.length > 0 && (
        <div className="mt-5 border-t border-mist-800 pt-4">
          <Button variant="secondary" size="sm" onClick={onViewEvidence}>
            <FileSearch className="h-4 w-4" />
            View supporting evidence
          </Button>
        </div>
      )}
    </Card>
  );
}
