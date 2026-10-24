import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { CornerDownLeft, Loader2, Search, X } from "lucide-react";
import { useRef, useState } from "react";

const SUGGESTIONS = [
  "When should a patient be referred for same-day specialist review?",
  "What does the guideline recommend for resistant hypertension?",
  "What are the recommended treatment steps?",
];

interface QueryComposerProps {
  onSubmit: (query: string) => void;
  disabled: boolean;
  loading: boolean;
}

export function QueryComposer({ onSubmit, disabled, loading }: QueryComposerProps) {
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isEmpty = value.trim().length === 0;

  function submit() {
    setTouched(true);
    if (isEmpty || disabled || loading) return;
    onSubmit(value.trim());
    setValue("");
    setTouched(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div>
      <div
        className={cn(
          "glass-panel rounded-2xl p-4 transition-colors",
          touched && isEmpty ? "border-state-boundary/50" : "focus-within:border-accent-cyan/40"
        )}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || loading}
          rows={3}
          placeholder="Ask a question about the indexed clinical guideline..."
          aria-label="Ask a question about the indexed clinical guideline"
          aria-invalid={touched && isEmpty}
          className="w-full resize-none bg-transparent text-base text-slate-100 placeholder:text-slate-500 focus:outline-none disabled:opacity-50"
        />

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <CornerDownLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">⌘ / Ctrl + Enter to send</span>
          </div>

          <div className="flex items-center gap-2">
            {value.length > 0 && !loading && (
              <button
                type="button"
                onClick={() => setValue("")}
                className="rounded-lg p-2 text-slate-500 hover:bg-mist-800 hover:text-slate-300"
                aria-label="Clear question"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <Button onClick={submit} disabled={disabled || loading} size="md">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {loading ? "Searching…" : "Ask Guideline"}
            </Button>
          </div>
        </div>
      </div>

      {touched && isEmpty && (
        <p className="mt-2 text-xs text-state-boundary" role="alert">
          Enter a question before sending.
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            disabled={disabled || loading}
            onClick={() => {
              setValue(s);
              onSubmit(s);
              setValue("");
            }}
            className="rounded-full border border-mist-700 bg-ink-900/50 px-3.5 py-1.5 text-xs text-slate-400 transition-colors hover:border-accent-cyan/40 hover:text-slate-200 disabled:opacity-40"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
