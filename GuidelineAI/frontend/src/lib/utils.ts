import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const REFUSAL_REASON_LABELS: Record<string, string> = {
  retrieval_similarity_insufficient: "Retrieval similarity insufficient",
  urgent_clinical_red_flags: "Urgent clinical red flags",
  pediatric_scope_mismatch: "Pediatric scope mismatch",
  exact_dose_not_supported: "Exact dose not supported",
  no_retrieval: "No usable evidence retrieved",
  mechanical_distance_gate: "Distance threshold exceeded",
};

export function refusalReasonLabel(reason: string): string {
  return REFUSAL_REASON_LABELS[reason] || reason.replace(/_/g, " ");
}

export function isUrgent(reasons: string[]): boolean {
  return reasons.includes("urgent_clinical_red_flags");
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
