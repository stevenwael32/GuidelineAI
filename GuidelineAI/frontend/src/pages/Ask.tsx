import { AnswerCard } from "@/components/AnswerCard";
import { EvidenceDrawer } from "@/components/EvidenceDrawer";
import { PipelineLoader } from "@/components/PipelineLoader";
import { QueryComposer } from "@/components/QueryComposer";
import { RefusalCard } from "@/components/RefusalCard";
import { Sidebar } from "@/components/Sidebar";
import { useGuideline } from "@/hooks/useGuideline";
import { useHistory } from "@/hooks/useHistory";
import { ApiError, getQueryById, postQuery } from "@/lib/api";
import type { QueryResponse } from "@/lib/types";
import { motion } from "framer-motion";
import { AlertCircle, Menu } from "lucide-react";
import { useState } from "react";

export default function Ask() {
  const { guideline, loading: guidelineLoading } = useGuideline();
  const { history, refresh } = useHistory();

  const [result, setResult] = useState<QueryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const canQuery = !guidelineLoading && guideline?.indexed === true;

  async function handleSubmit(query: string) {
    setLoading(true);
    setError(null);
    try {
      const response = await postQuery(query);
      setResult(response);
      refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong while processing the request.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectHistory(id: string) {
    setLoading(true);
    setError(null);
    try {
      const response = await getQueryById(id);
      setResult(response);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load this question.");
    } finally {
      setLoading(false);
    }
  }

  function handleNewQuestion() {
    setResult(null);
    setError(null);
    setMobileSidebarOpen(false);
  }

  return (
    <div className="mx-auto flex max-w-7xl">
      <Sidebar
        history={history}
        onSelectHistory={handleSelectHistory}
        onNewQuestion={handleNewQuestion}
        activeQueryId={result?.id ?? null}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-10">
        <div className="mb-6 flex items-center gap-3 lg:hidden">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="rounded-lg border border-mist-700 p-2 text-slate-300 hover:bg-mist-800"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <h1 className="text-2xl font-bold text-white sm:text-3xl">Ask the Guideline</h1>
        <p className="mt-2 text-slate-400">Search the indexed clinical guideline for evidence-supported answers.</p>

        <div className="mt-8">
          <QueryComposer onSubmit={handleSubmit} disabled={!canQuery} loading={loading} />
        </div>

        {!guidelineLoading && !guideline?.indexed && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-state-unavailable/30 bg-state-unavailable/5 p-5 text-sm text-slate-300">
            <AlertCircle className="h-5 w-5 shrink-0 text-state-unavailable" />
            <div>
              <p className="font-medium text-white">No clinical guideline is currently indexed.</p>
              <p className="mt-1 text-slate-400">
                Index a guideline PDF on the backend to start asking questions.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-state-unavailable/30 bg-state-unavailable/5 p-5 text-sm text-slate-300">
            <AlertCircle className="h-5 w-5 shrink-0 text-state-unavailable" />
            <p>{error}</p>
          </div>
        )}

        <div className="mt-6">
          {loading && <PipelineLoader />}

          {!loading && result && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              {result.refused ? (
                <RefusalCard result={result} onViewEvidence={() => setDrawerOpen(true)} />
              ) : (
                <AnswerCard result={result} onViewEvidence={() => setDrawerOpen(true)} />
              )}
            </motion.div>
          )}
        </div>
      </main>

      <EvidenceDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        evidence={result?.evidence ?? []}
        retrieval={result?.retrieval ?? null}
      />
    </div>
  );
}
