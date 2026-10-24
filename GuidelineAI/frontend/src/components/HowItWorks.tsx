import { motion } from "framer-motion";
import { BrainCircuit, CheckCircle2, FileSearch, FileText, Layers, Sparkles } from "lucide-react";

const STEPS = [
  {
    step: "01",
    icon: FileText,
    label: "PDF",
    title: "Clinical Guideline",
    body: "The source guideline is processed and indexed.",
  },
  {
    step: "02",
    icon: Layers,
    label: "CHUNK",
    title: "Structured Evidence",
    body: "The guideline is divided into retrievable chunks.",
  },
  {
    step: "03",
    icon: BrainCircuit,
    label: "EMBED",
    title: "Semantic Representation",
    body: "Chunks are converted into embeddings.",
  },
  {
    step: "04",
    icon: FileSearch,
    label: "RETRIEVE",
    title: "Relevant Evidence",
    body: "Chroma retrieves relevant guideline sections.",
  },
  {
    step: "05",
    icon: CheckCircle2,
    label: "EVALUATE",
    title: "Evidence Check",
    body: "Similarity and safety/refusal logic evaluate whether the evidence is sufficient.",
  },
  {
    step: "06",
    icon: Sparkles,
    label: "ANSWER",
    title: "Grounded Response",
    body: "The system answers only when the evidence supports it.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative mx-auto max-w-7xl scroll-mt-24 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent-cyan">The Pipeline</p>
        <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">From Guideline to Answer</h2>
        <p className="mt-4 text-slate-400">
          Every question follows the same transparent path — search, retrieve, evaluate, then answer or refuse.
        </p>
      </div>

      <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STEPS.map((s, i) => (
          <motion.div
            key={s.step}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.07, duration: 0.5 }}
            className="glass-panel group relative overflow-hidden rounded-2xl p-6 transition-colors hover:border-mist-600"
          >
            <div className="flex items-start justify-between">
              <span className="font-display text-4xl font-extrabold text-white/10 transition-colors group-hover:text-accent-cyan/20">
                {s.step}
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-mist-700 bg-ink-800/80">
                <s.icon className="h-5 w-5 text-accent-cyan" />
              </div>
            </div>
            <p className="mt-3 text-[11px] font-bold uppercase tracking-widest text-accent-teal">{s.label}</p>
            <h3 className="mt-1 text-lg font-semibold text-white">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.body}</p>
            {i < STEPS.length - 1 && (
              <div className="absolute -right-2 top-1/2 hidden h-px w-4 bg-gradient-to-r from-accent-cyan/40 to-transparent lg:block" />
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
