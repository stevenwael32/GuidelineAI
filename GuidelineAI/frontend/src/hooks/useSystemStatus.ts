import { getSystemStatus } from "@/lib/api";
import type { SystemStatus } from "@/lib/types";
import { useEffect, useState } from "react";

export function useSystemStatus(pollMs = 30000) {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await getSystemStatus();
        if (active) {
          setStatus(data);
          setError(null);
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unavailable");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, pollMs);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [pollMs]);

  return { status, loading, error };
}
