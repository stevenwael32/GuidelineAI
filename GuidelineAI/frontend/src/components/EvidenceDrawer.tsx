import { EvidenceCard } from "@/components/EvidenceCard";
import { RetrievalDetailsPanel } from "@/components/RetrievalDetails";
import type { EvidenceItem, RetrievalDetails as RetrievalDetailsType } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import { FileSearch, X } from "lucide-react";

interface EvidenceDrawerProps {
  open: boolean;
  onClose: () => void;
  evidence: EvidenceItem[];
  retrieval: RetrievalDetailsType | null;
}

export function EvidenceDrawer({ open, onClose, evidence, retrieval }: EvidenceDrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Desktop: right slide-over */}
          <motion.aside
            className="glass-panel fixed right-0 top-0 z-50 hidden h-full w-full max-w-md flex-col border-y-0 border-r-0 sm:flex"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            role="dialog"
            aria-label="Evidence drawer"
          >
            <DrawerBody evidence={evidence} retrieval={retrieval} onClose={onClose} />
          </motion.aside>

          {/* Mobile: bottom sheet */}
          <motion.div
            className="glass-panel fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-2xl border-x-0 border-b-0 sm:hidden"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            role="dialog"
            aria-label="Evidence panel"
          >
            <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-mist-600" />
            <DrawerBody evidence={evidence} retrieval={retrieval} onClose={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function DrawerBody({
  evidence,
  retrieval,
  onClose,
}: {
  evidence: EvidenceItem[];
  retrieval: RetrievalDetailsType | null;
  onClose: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between border-b border-mist-800 p-5">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <FileSearch className="h-4.5 w-4.5 text-accent-cyan" />
            Evidence
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">Retrieved from indexed guideline</p>
        </div>
        <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-mist-800" aria-label="Close evidence panel">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {evidence.length === 0 ? (
          <p className="text-sm text-slate-500">No evidence was retrieved for this question.</p>
        ) : (
          <div className="space-y-4">
            {evidence.map((e) => (
              <EvidenceCard key={e.chunk_id} evidence={e} />
            ))}
          </div>
        )}
        {retrieval && <RetrievalDetailsPanel retrieval={retrieval} />}
      </div>
    </>
  );
}
