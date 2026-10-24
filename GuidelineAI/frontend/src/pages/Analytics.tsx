import { Card } from "@/components/ui/Card";
import { getAnalytics } from "@/lib/api";
import { refusalReasonLabel } from "@/lib/utils";
import type { AnalyticsSummary } from "@/lib/types";
import { BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  answered: "#34D399",
  refused: "#F5B84E",
  generation_unavailable: "#7C8AA6",
  not_indexed: "#FB6A6A",
};

const CHART_TOOLTIP_STYLE = {
  background: "#0B111F",
  border: "1px solid rgba(226,236,255,0.16)",
  borderRadius: 12,
  color: "#E2ECFF",
  fontSize: 12,
};

export default function Analytics() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 py-20 text-sm text-slate-500 sm:px-6 lg:px-8">Loading analytics…</div>;
  }

  if (!data || !data.has_data) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-mist-700 bg-ink-900/60">
          <BarChart3 className="h-6 w-6 text-accent-cyan" />
        </div>
        <h1 className="mt-6 text-3xl font-bold text-white">No analytics data yet</h1>
        <p className="mt-3 text-slate-400">Ask GuidelineAI a question to start building real usage analytics.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-white sm:text-4xl">Analytics</h1>
      <p className="mt-2 text-slate-400">Real usage data from every question asked to GuidelineAI.</p>

      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <MetricCard label="Total Questions" value={data.total_questions} />
        <MetricCard label="Answered" value={data.answered} />
        <MetricCard label="Refused" value={data.refused} />
        <MetricCard
          label="Avg. Similarity"
          value={data.average_similarity_percent ? `${data.average_similarity_percent.toFixed(1)}%` : "—"}
        />
        <MetricCard
          label="Evidence-Supported Rate"
          value={data.evidence_supported_rate ? `${data.evidence_supported_rate.toFixed(1)}%` : "—"}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {data.questions_over_time.length > 0 && (
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-white">Questions Over Time</h3>
            <div className="mt-6 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.questions_over_time}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(226,236,255,0.08)" />
                  <XAxis dataKey="date" stroke="#7C8AA6" fontSize={11} />
                  <YAxis stroke="#7C8AA6" fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Line type="monotone" dataKey="count" stroke="#38E1FF" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {data.status_distribution.length > 0 && (
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-white">Answer / Refusal Distribution</h3>
            <div className="mt-6 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.status_distribution} dataKey="count" nameKey="status" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {data.status_distribution.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || "#4C8DFF"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap gap-3">
              {data.status_distribution.map((entry) => (
                <span key={entry.status} className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLORS[entry.status] || "#4C8DFF" }} />
                  {entry.status.replace(/_/g, " ")} ({entry.count})
                </span>
              ))}
            </div>
          </Card>
        )}

        {data.similarity_distribution.length > 0 && (
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-white">Similarity Distribution</h3>
            <div className="mt-6 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.similarity_distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(226,236,255,0.08)" />
                  <XAxis dataKey="bucket" stroke="#7C8AA6" fontSize={11} />
                  <YAxis stroke="#7C8AA6" fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Bar dataKey="count" fill="#2DD9C4" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {data.refusal_reason_distribution.length > 0 && (
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-white">Refusal Reason Distribution</h3>
            <div className="mt-6 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.refusal_reason_distribution.map((r) => ({ ...r, label: refusalReasonLabel(r.reason) }))}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(226,236,255,0.08)" />
                  <XAxis type="number" stroke="#7C8AA6" fontSize={11} allowDecimals={false} />
                  <YAxis type="category" dataKey="label" stroke="#7C8AA6" fontSize={11} width={160} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Bar dataKey="count" fill="#F5B84E" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-5">
      <p className="text-2xl font-bold text-white sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </Card>
  );
}
