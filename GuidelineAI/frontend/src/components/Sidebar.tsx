import { Logo } from "@/components/Logo";
import { useGuideline } from "@/hooks/useGuideline";
import type { HistoryItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  BookOpen,
  CircleDot,
  History,
  Plus,
  Settings as SettingsIcon,
  Users,
  X,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
  history: HistoryItem[];
  onSelectHistory: (id: string) => void;
  onNewQuestion: () => void;
  activeQueryId: string | null;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const STATUS_DOT: Record<string, string> = {
  answered: "bg-state-ready",
  refused: "bg-state-boundary",
  generation_unavailable: "bg-state-unavailable",
  not_indexed: "bg-state-urgent",
};

const NAV_ITEMS = [
  { label: "Guideline", to: "/guideline", icon: BookOpen },
  { label: "System Status", to: "/status", icon: CircleDot },
  { label: "Analytics", to: "/analytics", icon: BarChart3 },
  { label: "Team", to: "/team", icon: Users },
  { label: "Settings", to: "/settings", icon: SettingsIcon },
];

export function Sidebar({ history, onSelectHistory, onNewQuestion, activeQueryId, mobileOpen, onCloseMobile }: SidebarProps) {
  const { guideline } = useGuideline();
  const location = useLocation();

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between p-5">
        <Link to="/"><Logo /></Link>
        <button className="rounded-lg p-1.5 text-slate-400 hover:bg-mist-800 lg:hidden" onClick={onCloseMobile} aria-label="Close sidebar">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="px-4">
        <button
          onClick={onNewQuestion}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-mist-700 bg-ink-800/70 py-2.5 text-sm font-semibold text-white transition-colors hover:border-accent-cyan/40 hover:bg-ink-700/70"
        >
          <Plus className="h-4 w-4" />
          New Question
        </button>
      </div>

      <div className="mt-6 flex-1 overflow-y-auto px-4">
        <p className="flex items-center gap-1.5 px-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <History className="h-3.5 w-3.5" />
          Recent Questions
        </p>
        <div className="mt-2 space-y-1">
          {history.length === 0 && <p className="px-1 py-3 text-xs text-slate-600">No questions yet.</p>}
          {history.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectHistory(item.id)}
              className={cn(
                "block w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-mist-800",
                activeQueryId === item.id ? "bg-mist-800 text-white" : "text-slate-400"
              )}
            >
              <div className="flex items-center gap-2">
                <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", STATUS_DOT[item.status] || "bg-state-unavailable")} />
                <span className="truncate">{item.query}</span>
              </div>
            </button>
          ))}
        </div>

        <p className="mt-6 px-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Navigate</p>
        <div className="mt-2 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-slate-300 transition-colors hover:bg-mist-800 hover:text-white",
                location.pathname === item.to && "bg-mist-800 text-white"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="border-t border-mist-800 p-4">
        <p className="px-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Indexed Guideline</p>
        <div className="mt-2 rounded-xl border border-mist-700 bg-ink-900/60 p-3">
          <p className="truncate text-sm font-medium text-slate-200">
            {guideline?.indexed ? guideline.document_name : "No guideline indexed"}
          </p>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className={cn("h-1.5 w-1.5 rounded-full", guideline?.indexed ? "bg-state-ready" : "bg-state-unavailable")} />
            <span className="text-xs text-slate-500">{guideline?.indexed ? "Indexed" : "Not indexed"}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="glass-panel sticky top-16 hidden h-[calc(100vh-4rem)] w-72 shrink-0 rounded-none border-y-0 border-l-0 lg:block">
        {content}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={onCloseMobile} />
          <div className="glass-panel absolute left-0 top-0 h-full w-80 max-w-[85vw] border-l-0">{content}</div>
        </div>
      )}
    </>
  );
}
