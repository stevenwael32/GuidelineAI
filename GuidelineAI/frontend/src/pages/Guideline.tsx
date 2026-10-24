import { Card } from "@/components/ui/Card";
import { getGuideline } from "@/lib/api";
import type { GuidelineInfo } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import { BrainCircuit, ChevronDown, Database, FileStack, FileText, Layers } from "lucide-react";
import { useEffect, useState } from "react";

const PIPELINE = [
  { icon: FileText, label: "PDF" },
  { icon: Layers, label: "Text" },
  { icon: FileStack, label: "Chunks" },
  { icon: BrainCircuit, label: "Embeddings" },
  { icon: Database, label: "Chroma" },
];

export default function Guideline() {
  const [info, setInfo] = useState<GuidelineInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTechnical, setShowTechnical] = useState(false);

  useEffect(() => {
    getGuideline()
      .then(setInfo)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-white sm:text-4xl">Indexed Guideline</h1>
      <p className="mt-2 text-slate-400">What GuidelineAI has actually processed and indexed.</p>

      {loading && <p className="mt-10 text-sm text-slate-500">Loading guideline status…</p>}

      {!loading && info && !info.indexed && (
        <Card className="mt-10 p-8 text-center">
          <p className="text-lg font-semibold text-white">No clinical guideline is currently indexed.</p>
          <p className="mt-2 text-sm text-slate-400">
            Place a guideline PDF in <code className="text-accent-cyan">data/guidelines/</code> and run{" "}
            <code className="text-accent-cyan">python backend/scripts/build_index.py</code>.
          </p>
        </Card>
      )}

      {!loading && info?.indexed && (
        <>
          <Card className="mt-10 p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent-cyan">{info.document_name}</p>
            <h2 className="mt-2 text-2xl font-bold text-white">{info.display_title}</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat label="Chunks" value={info.chunk_count ?? "—"} />
              <Stat label="Sections" value={info.sections.length} />
              <Stat label="Chunk size" value={`${info.chunk_size_tokens} tok`} />
              <Stat label="Overlap" value={`${info.chunk_overlap_tokens} tok`} />
            </div>
          </Card>

          <div className="mt-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Processing Pipeline</h3>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {PIPELINE.map((step, i) => (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <div className="glass-panel flex items-center gap-2 rounded-xl px-4 py-3">
                    <step.icon className="h-4 w-4 text-accent-cyan" />
                    <span className="text-sm font-medium text-slate-200">{step.label}</span>
                  </div>
                  {i < PIPELINE.length - 1 && <div className="h-px w-6 bg-mist-600" />}
                </motion.div>
              ))}
            </div>
          </div>

          {info.sections.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Sections</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {info.sections.map((s) => (
                  <span key={s} className="rounded-full border border-mist-700 bg-ink-800/70 px-3 py-1.5 text-xs text-slate-300">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8">
            <button
              onClick={() => setShowTechnical((v) => !v)}
              className="flex w-full items-center justify-between rounded-xl border border-mist-700 bg-ink-900/60 px-5 py-4 text-left text-sm font-semibold text-white hover:border-mist-600"
              aria-expanded={showTechnical}
            >
              Technical Details
              <ChevronDown className={`h-4 w-4 transition-transform ${showTechnical ? "rotate-180" : ""}`} />
            </button>
            {showTechnical && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="overflow-hidden rounded-xl border border-t-0 border-mist-700 bg-ink-900/40 px-5 py-4"
              >
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <Detail label="Embedding model" value={info.embedding_model} />
                  <Detail label="Embedding dimension" value={info.embedding_dimension} />
                  <Detail label="Vector database" value={info.vector_database} />
                  <Detail label="Collection" value={info.collection} />
                  <Detail label="Source PDF" value={info.source_pdf} />
                  <Detail label="Last indexed" value={info.last_indexed_at ? formatDate(info.last_indexed_at) : "—"} />
                </dl>
              </motion.div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex justify-between gap-4 border-b border-mist-800 py-2">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-200">{value ?? "—"}</dd>
    </div>
  );
}
