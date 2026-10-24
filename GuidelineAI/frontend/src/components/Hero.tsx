import { PipelineVisual } from "@/components/PipelineVisual";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { ArrowRight, Compass } from "lucide-react";
import { Link } from "react-router-dom";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grid" aria-hidden="true" />
      <div
        className="absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-accent-blue/10 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-7xl gap-16 px-4 pb-24 pt-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:pt-28">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-mist-700 bg-ink-900/60 px-3 py-1 text-xs font-medium text-accent-cyan">
            Search → Retrieve → Evaluate → Answer or Refuse
          </span>

          <h1 className="mt-6 text-4xl font-bold leading-[1.1] text-white sm:text-5xl lg:text-6xl">
            Clinical Answers,
            <br />
            Grounded in <span className="text-gradient-evidence">Evidence.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
            GuidelineAI retrieves relevant clinical guideline evidence, evaluates whether it is sufficient, and
            answers only within the boundaries of the indexed evidence.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link to="/app">
              <Button size="lg" className="w-full sm:w-auto">
                Ask Guideline
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                <Compass className="h-4 w-4" />
                Explore How It Works
              </Button>
            </a>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
          <PipelineVisual />
        </motion.div>
      </div>
    </section>
  );
}
