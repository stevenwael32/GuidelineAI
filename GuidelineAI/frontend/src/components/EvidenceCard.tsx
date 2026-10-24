import { Card } from "@/components/ui/Card";
import type { EvidenceItem } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, FileText } from "lucide-react";
import { useState } from "react";

export function EvidenceCard({ evidence }: { evidence: EvidenceItem }) {
  const [expanded, setExpanded] = useState(false);
  const preview = evidence.text.length > 320 ? `${evidence.text.slice(0, 320)}…` : evidence.text;

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink-800 text-[11px] font-bold text-accent-cyan">
            {evidence.rank}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Evidence {String(evidence.rank).padStart(2, "0")}
          </span>
        </div>
        <span className="rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-2.5 py-1 text-xs font-semibold text-accent-cyan">
          {evidence.similarity_percent.toFixed(2)}% similarity
        </span>
      </div>

      {evidence.section && <p className="mt-3 text-sm font-semibold text-white">{evidence.section}</p>}

      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
        {evidence.start_page != null && evidence.start_page >= 0 && (
          <span>
            Pages {evidence.start_page}–{evidence.end_page}
          </span>
        )}
        <span className="flex items-center gap-1">
          <FileText className="h-3 w-3" />
          {evidence.chunk_id}
        </span>
      </div>

      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-300">
        {expanded ? evidence.text : preview}
      </p>

      {evidence.text.length > 320 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 flex items-center gap-1 text-xs font-medium text-accent-cyan hover:text-accent-cyan/80"
        >
          {expanded ? "Show less" : "View full evidence"}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      )}
    </Card>
  );
}
