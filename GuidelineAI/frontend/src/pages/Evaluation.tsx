import { Card } from "@/components/ui/Card";
import { getEvaluation } from "@/lib/api";
import type { EvaluationReport } from "@/lib/types";
import { CheckCircle2, FlaskConical, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function Evaluation() {
  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEvaluation()
      .then(setReport)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="mx-auto max-w-5xl px-4 py-20 text-sm text-slate-500 sm:px-6 lg:px-8">Running evaluation…</div>;
  }

  if (!report || !report.available) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-mist-700 bg-ink-900/60">
          <FlaskConical className="h-6 w-6 text-accent-cyan" />
        </div>
        <h1 className="mt-6 text-3xl font-bold text-white">Evaluation unavailable</h1>
        <p className="mt-3 text-slate-400">Index a guideline to run retrieval, refusal, and quality-gate tests.</p>
      </div>
    );
  }

  const gate1 = report.quality_gate_1 as Record<string, any> | null;
  const gate2 = report.quality_gate_2 as Record<string, any> | null;
  const gate3 = report.quality_gate_3 as Record<string, any> | null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-white sm:text-4xl">Evaluation</h1>
      <p className="mt-2 text-slate-400">Real refusal tests and quality gates, run against the live pipeline.</p>

      <div className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Refusal Tests</h2>
        <div className="mt-4 space-y-3">
          {report.tests.map((test) => (
            <Card key={test.name} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">{test.name}</p>
                  <p className="mt-1 text-xs text-slate-500">"{test.query}"</p>
                  <p className="mt-2 text-sm text-slate-400">{test.detail}</p>
                  {test.refusal_reasons.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {test.refusal_reasons.map((r) => (
                        <span key={r} className="rounded-full border border-mist-700 bg-ink-800/70 px-2 py-0.5 text-[11px] text-slate-300">
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {test.passed ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-state-ready" />
                ) : (
                  <XCircle className="h-5 w-5 shrink-0 text-state-urgent" />
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {gate1?.available && (
        <QualityGate
          title="Quality Gate 1 — Confidence Threshold Calibration"
          rows={[
            ["Source", gate1.source],
            ["Examples", gate1.examples],
            ["Configured distance threshold", gate1.configured_distance_threshold],
            ["Calibrated threshold", gate1.threshold?.toFixed?.(4)],
            ["Precision", gate1.precision?.toFixed?.(3)],
            ["Recall", gate1.recall?.toFixed?.(3)],
            ["F1", gate1.f1?.toFixed?.(3)],
          ]}
        />
      )}

      {gate2?.available && (
        <QualityGate
          title="Quality Gate 2 — Unsupported-Claim Detection"
          rows={[
            ["Query", gate2.query],
            ["Faithfulness", `${gate2.faithfulness_percent?.toFixed?.(2)}%`],
            ["Unsupported claims", gate2.unsupported_claim_count],
            ["Citation accuracy", `${gate2.citation_accuracy_percent?.toFixed?.(2)}%`],
          ]}
        />
      )}

      {gate3?.available && (
        <div className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Quality Gate 3 — Precision@k Benchmark
          </h2>
          <Card className="mt-4 overflow-x-auto p-5">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-slate-500">
                  <th className="pb-3 pr-4">Question</th>
                  <th className="pb-3 pr-4">P@1</th>
                  <th className="pb-3 pr-4">P@3</th>
                  <th className="pb-3 pr-4">P@5</th>
                  <th className="pb-3 pr-4">Citation Acc.</th>
                  <th className="pb-3">Faithfulness</th>
                </tr>
              </thead>
              <tbody>
                {gate3.rows.map((row: any) => (
                  <tr key={row.question} className="border-t border-mist-800">
                    <td className="py-3 pr-4 text-slate-300">{row.question}</td>
                    <td className="py-3 pr-4 text-slate-400">{(row.precision_at_1 * 100).toFixed(0)}%</td>
                    <td className="py-3 pr-4 text-slate-400">{(row.precision_at_3 * 100).toFixed(0)}%</td>
                    <td className="py-3 pr-4 text-slate-400">{(row.precision_at_5 * 100).toFixed(0)}%</td>
                    <td className="py-3 pr-4 text-slate-400">{(row.citation_accuracy * 100).toFixed(0)}%</td>
                    <td className="py-3 text-slate-400">{(row.faithfulness * 100).toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </div>
  );
}

function QualityGate({ title, rows }: { title: string; rows: [string, unknown][] }) {
  return (
    <div className="mt-10">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">{title}</h2>
      <Card className="mt-4 p-5">
        <dl className="grid gap-2.5 text-sm sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 border-b border-mist-800 py-2 last:border-0">
              <dt className="text-slate-500">{label}</dt>
              <dd className="font-medium text-slate-200">{String(value ?? "—")}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}
