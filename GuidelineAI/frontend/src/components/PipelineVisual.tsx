import { motion } from "framer-motion";
import { CheckCircle2, FileText, Search, Sparkles } from "lucide-react";

const STAGES = [
  {
    icon: FileText,
    title: "Guideline PDF",
    detail: "Hypertension in adults (NICE NG136)",
  },
  {
    icon: Search,
    title: "Semantic Retrieval",
    detail: "Top-ranked relevant chunks",
  },
  {
    icon: CheckCircle2,
    title: "Evidence Evaluation",
    detail: "Similarity + safety gates checked",
  },
  {
    icon: Sparkles,
    title: "Grounded Response",
    detail: "Answer supported by evidence",
  },
];

export function PipelineVisual() {
  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute left-6 top-10 bottom-10 w-px bg-gradient-to-b from-accent-cyan/60 via-accent-blue/40 to-transparent"
        aria-hidden="true"
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute -left-[3px] h-2 w-2 rounded-full bg-accent-cyan shadow-[0_0_10px_2px_rgba(56,225,255,0.8)]"
            animate={{ top: ["0%", "100%"] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "linear", delay: i * 1.05 }}
          />
        ))}
      </div>

      <div className="space-y-4">
        {STAGES.map((stage, i) => (
          <motion.div
            key={stage.title}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.12, duration: 0.5 }}
            className="glass-panel relative flex items-center gap-4 rounded-2xl p-4 pl-14"
          >
            <div className="absolute left-3 flex h-6 w-6 items-center justify-center rounded-full border border-mist-600 bg-ink-900">
              <stage.icon className="h-3.5 w-3.5 text-accent-cyan" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{stage.title}</p>
              <p className="text-xs text-slate-400">{stage.detail}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
