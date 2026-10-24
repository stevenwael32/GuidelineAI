import { getHistory } from "@/lib/api";
import type { HistoryItem } from "@/lib/types";
import { useCallback, useEffect, useState } from "react";

export function useHistory(limit = 20) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    getHistory(limit)
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [limit]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { history, loading, refresh };
}
