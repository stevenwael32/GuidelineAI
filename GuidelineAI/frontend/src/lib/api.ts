import axios, { AxiosError } from "axios";
import type {
  AnalyticsSummary,
  EvaluationReport,
  GuidelineInfo,
  HistoryItem,
  QueryResponse,
  SystemStatus,
} from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

function unwrap(err: unknown): never {
  const axErr = err as AxiosError<{ detail?: string }>;
  if (axErr.response) {
    const detail = axErr.response.data?.detail || "Something went wrong while processing the request.";
    throw new ApiError(detail, axErr.response.status);
  }
  throw new ApiError("No connection to the GuidelineAI backend.");
}

export async function health(): Promise<{ status: string }> {
  try {
    const res = await api.get("/api/health");
    return res.data;
  } catch (err) {
    unwrap(err);
  }
}

export async function getSystemStatus(): Promise<SystemStatus> {
  try {
    const res = await api.get<SystemStatus>("/api/system/status");
    return res.data;
  } catch (err) {
    unwrap(err);
  }
}

export async function getGuideline(): Promise<GuidelineInfo> {
  try {
    const res = await api.get<GuidelineInfo>("/api/guideline");
    return res.data;
  } catch (err) {
    unwrap(err);
  }
}

export async function postQuery(query: string): Promise<QueryResponse> {
  try {
    const res = await api.post<QueryResponse>("/api/query", { query });
    return res.data;
  } catch (err) {
    unwrap(err);
  }
}

export async function getHistory(limit = 25): Promise<HistoryItem[]> {
  try {
    const res = await api.get<HistoryItem[]>("/api/query/history", { params: { limit } });
    return res.data;
  } catch (err) {
    unwrap(err);
  }
}

export async function getQueryById(id: string): Promise<QueryResponse> {
  try {
    const res = await api.get<QueryResponse>(`/api/query/${id}`);
    return res.data;
  } catch (err) {
    unwrap(err);
  }
}

export async function getAnalytics(): Promise<AnalyticsSummary> {
  try {
    const res = await api.get<AnalyticsSummary>("/api/analytics");
    return res.data;
  } catch (err) {
    unwrap(err);
  }
}

export async function getEvaluation(): Promise<EvaluationReport> {
  try {
    const res = await api.get<EvaluationReport>("/api/evaluation");
    return res.data;
  } catch (err) {
    unwrap(err);
  }
}
