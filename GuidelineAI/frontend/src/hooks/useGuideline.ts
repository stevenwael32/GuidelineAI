import { getGuideline } from "@/lib/api";
import type { GuidelineInfo } from "@/lib/types";
import { useEffect, useState } from "react";

export function useGuideline() {
  const [guideline, setGuideline] = useState<GuidelineInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getGuideline()
      .then((data) => active && setGuideline(data))
      .catch(() => active && setGuideline({ indexed: false, sections: [] }))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return { guideline, loading };
}
