import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";
import { Eye, ScanSearch, ShieldCheck, Sparkles } from "lucide-react";

const PRINCIPLES = [
  {
    n: "01",
    icon: Sparkles,
    title: "Evidence First",
    body: "Responses are grounded in retrieved guideline content.",
  },
  {
    n: "02",
    icon: ScanSearch,
    title: "Retrieval Aware",
    body: "Relevant guideline sections are retrieved before generating a response.",
  },
  {
    n: "03",
    icon: ShieldCheck,
    title: "Safety Boundaries",
    body: "When the evidence is insufficient or a safety gate is triggered, the system refuses rather than guessing.",
  },
  {
    n: "04",
    icon: Eye,
    title: "Transparent",
    body: "Inspect the retrieved evidence, sections, pages, and retrieval details.",
  },
];

export function TrustSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          Built around <span className="text-gradient-evidence">evidence</span>, not assumptions.
        </h2>
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PRINCIPLES.map((p, i) => (
          <motion.div
            key={p.n}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
          >
            <Card className="h-full p-6 transition-transform duration-300 hover:-translate-y-1 hover:border-mist-600">
              <span className="text-xs font-semibold text-accent-cyan/80">{p.n}</span>
              <div className="mt-3 flex h-10 w-10 items-center justify-center rounded-xl border border-mist-700 bg-ink-800/80">
                <p.icon className="h-5 w-5 text-accent-cyan" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-white">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{p.body}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
