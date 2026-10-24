import type { RetrievalDetails as RetrievalDetailsType } from "@/lib/types";
import { motion } from "framer-motion";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

export function RetrievalDetailsPanel({ retrieval }: { retrieval: RetrievalDetailsType }) {
  const [open, setOpen] = useState(false);

  const rows: [string, string | number][] = [
    ["Top similarity", retrieval.top_similarity_percent != null ? `${retrieval.top_similarity_percent.toFixed(2)}%` : "—"],
    ["Top distance", retrieval.top_distance != null ? retrieval.top_distance.toFixed(4) : "—"],
    ["Retrieved chunks", retrieval.retrieved_chunks],
    ["Top-k", retrieval.top_k],
    ["Distance threshold", retrieval.distance_threshold.toFixed(2)],
    ["Embedding model", retrieval.embedding_model],
    ["Collection", retrieval.collection],
  ];

  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-300"
        aria-expanded={open}
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Retrieval Details
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <motion.dl
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-3 grid gap-2 overflow-hidden rounded-xl border border-mist-800 bg-ink-900/40 p-4 text-xs sm:grid-cols-2"
        >
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4">
              <dt className="text-slate-500">{label}</dt>
              <dd className="font-medium text-slate-300">{value}</dd>
            </div>
          ))}
        </motion.dl>
      )}
    </div>
  );
}
