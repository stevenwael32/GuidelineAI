import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, FileSearch, Search, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const STAGES = [
  { icon: Search, label: "Searching indexed guideline..." },
  { icon: FileSearch, label: "Retrieving relevant evidence..." },
  { icon: ShieldCheck, label: "Evaluating evidence..." },
  { icon: Sparkles, label: "Preparing grounded response..." },
];

export function PipelineLoader() {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((i) => Math.min(i + 1, STAGES.length - 1));
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel rounded-2xl p-6" role="status" aria-live="polite">
      <div className="space-y-3">
        {STAGES.map((stage, i) => {
          const active = i === stageIndex;
          const done = i < stageIndex;
          return (
            <div key={stage.label} className="flex items-center gap-3">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  done
                    ? "border-state-ready/50 bg-state-ready/10"
                    : active
                    ? "border-accent-cyan/50 bg-accent-cyan/10"
                    : "border-mist-700 bg-ink-900/60"
                }`}
              >
                {done ? (
                  <CheckCircle2 className="h-4 w-4 text-state-ready" />
                ) : (
                  <stage.icon className={`h-3.5 w-3.5 ${active ? "text-accent-cyan animate-pulse-glow" : "text-slate-600"}`} />
                )}
              </div>
              <span className={`text-sm transition-colors ${done ? "text-slate-500" : active ? "text-white font-medium" : "text-slate-600"}`}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
