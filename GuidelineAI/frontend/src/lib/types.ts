export interface EvidenceItem {
  rank: number;
  chunk_id: string;
  section: string | null;
  start_page: number | null;
  end_page: number | null;
  similarity: number;
  similarity_percent: number;
  distance: number;
  text: string;
}

export interface RetrievalDetails {
  top_k: number;
  retrieved_chunks: number;
  top_similarity_percent: number | null;
  top_distance: number | null;
  distance_threshold: number;
  embedding_model: string;
  collection: string;
}

export type QueryStatus = "answered" | "refused" | "generation_unavailable" | "not_indexed";

export interface QueryResponse {
  id: string;
  query: string;
  status: QueryStatus;
  answer: string | null;
  refused: boolean;
  confidence: "sufficient" | "insufficient";
  refusal_reasons: string[];
  recommendation: string | null;
  question_suggestion: string | null;
  evidence: EvidenceItem[];
  retrieval: RetrievalDetails | null;
  created_at: string;
}

export interface HistoryItem {
  id: string;
  query: string;
  status: QueryStatus;
  refused: boolean;
  confidence: string;
  top_similarity_percent: number | null;
  created_at: string;
}

export interface GuidelineInfo {
  indexed: boolean;
  document_name?: string | null;
  display_title?: string | null;
  chunk_count?: number | null;
  embedding_model?: string | null;
  embedding_dimension?: number | null;
  vector_database?: string | null;
  collection?: string | null;
  chunk_size_tokens?: number | null;
  chunk_overlap_tokens?: number | null;
  source_pdf?: string | null;
  sections: string[];
  last_indexed_at?: string | null;
}

export type ComponentHealth = "ready" | "warning" | "unavailable";

export interface ComponentStatus {
  name: string;
  status: ComponentHealth;
  detail: string;
}

export interface SystemStatus {
  overall: ComponentHealth;
  components: ComponentStatus[];
  checked_at: string;
}

export interface AnalyticsSummary {
  has_data: boolean;
  total_questions: number;
  answered: number;
  refused: number;
  generation_unavailable: number;
  average_similarity_percent: number | null;
  evidence_supported_rate: number | null;
  questions_over_time: { date: string; count: number }[];
  status_distribution: { status: string; count: number }[];
  similarity_distribution: { bucket: string; count: number }[];
  refusal_reason_distribution: { reason: string; count: number }[];
}

export interface EvaluationTestResult {
  name: string;
  query: string;
  expected_behavior: string;
  refused: boolean;
  refusal_reasons: string[];
  passed: boolean;
  detail: string;
}

export interface EvaluationReport {
  available: boolean;
  tests: EvaluationTestResult[];
  quality_gate_1: Record<string, unknown> | null;
  quality_gate_2: Record<string, unknown> | null;
  quality_gate_3: Record<string, unknown> | null;
}
