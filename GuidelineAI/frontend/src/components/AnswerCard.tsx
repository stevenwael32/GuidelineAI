import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { QueryResponse } from "@/lib/types";
import { CheckCircle2, FileSearch, PauseCircle } from "lucide-react";

export function AnswerCard({ result, onViewEvidence }: { result: QueryResponse; onViewEvidence: () => void }) {
  const isAnswered = result.status === "answered";

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2">
        {isAnswered ? (
          <CheckCircle2 className="h-5 w-5 text-state-ready" />
        ) : (
          <PauseCircle className="h-5 w-5 text-state-unavailable" />
        )}
        <h3 className="text-base font-semibold text-white">
          {isAnswered ? "Evidence-supported response" : "Response generation unavailable"}
        </h3>
      </div>

      {isAnswered ? (
        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-200">{result.answer}</p>
      ) : (
        <p className="mt-4 text-sm leading-relaxed text-slate-300">{result.recommendation}</p>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-mist-800 pt-4">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-state-ready/30 bg-state-ready/10 px-2.5 py-1 text-xs font-medium text-state-ready">
          <span className="h-1.5 w-1.5 rounded-full bg-state-ready" />
          Evidence status: Sufficient
        </span>

        <Button variant="secondary" size="sm" onClick={onViewEvidence}>
          <FileSearch className="h-4 w-4" />
          View supporting evidence
        </Button>
      </div>
    </Card>
  );
}
