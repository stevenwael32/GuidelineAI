import { Card } from "@/components/ui/Card";

export default function Settings() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-white sm:text-4xl">Settings</h1>
      <p className="mt-2 text-slate-400">Connection and environment configuration.</p>

      <Card className="mt-10 p-6">
        <dl className="space-y-4 text-sm">
          <div className="flex justify-between gap-4 border-b border-mist-800 pb-4">
            <dt className="text-slate-500">Backend API base URL</dt>
            <dd className="font-medium text-slate-200">{apiBaseUrl}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Environment</dt>
            <dd className="font-medium text-slate-200">{import.meta.env.MODE}</dd>
          </div>
        </dl>
        <p className="mt-6 text-xs text-slate-500">
          Retrieval, safety-gate, and generation configuration (chunk size, distance threshold, embedding model, LLM)
          is set on the backend via <code className="text-accent-cyan">backend/.env</code> — see the project README.
        </p>
      </Card>
    </div>
  );
}
