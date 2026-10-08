import { 
  User, 
  ExecutiveMetrics, 
  SIUCase, 
  EvidenceGraphData, 
  AIBrief, 
  AuditLogEntry 
} from '../types';

const API_BASE = '/api/v1';

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('claimshield_token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('claimshield_token');
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || `HTTP Error ${res.status}`);
    }

    return res.json();
  }

  // Auth
  async login(username: string): Promise<{ access_token: string; user: User }> {
    const data = await this.request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username }),
    });
    this.setToken(data.access_token);
    return data;
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // Overview
  async getMetrics(): Promise<ExecutiveMetrics> {
    return this.request<ExecutiveMetrics>('/overview/metrics');
  }

  async getTrends(): Promise<any[]> {
    return this.request<any[]>('/overview/trends');
  }

  // SIU Queue
  async getQueue(capacity = 20, sortBy = 'priority', tier?: string, fwaPattern?: string): Promise<{
    total_available_cases: number;
    capacity_limit: number;
    allocated_count: number;
    cases: SIUCase[];
  }> {
    const params = new URLSearchParams({
      capacity: capacity.toString(),
      sort_by: sortBy,
    });
    if (tier) params.append('tier', tier);
    if (fwaPattern) params.append('fwa_pattern', fwaPattern);

    return this.request(`/siu/queue?${params.toString()}`);
  }

  async getEscalations(): Promise<any[]> {
    return this.request('/siu/escalations');
  }

  // Case Investigation
  async getCaseDetails(caseId: string): Promise<{
    case: SIUCase;
    provider_details: any;
    scheme_similarity: any;
    total_claims_count: number;
    data_quality_status: string;
  }> {
    return this.request(`/cases/${caseId}`);
  }

  async getEvidenceGraph(caseId: string): Promise<EvidenceGraphData> {
    return this.request(`/cases/${caseId}/evidence-graph`);
  }

  async getAIBrief(caseId: string): Promise<AIBrief> {
    return this.request(`/cases/${caseId}/brief`);
  }

  async getCaseClaims(caseId: string, limit = 50, offset = 0): Promise<any> {
    return this.request(`/cases/${caseId}/claims?limit=${limit}&offset=${offset}`);
  }

  async submitDecision(caseId: string, payload: {
    decision: string;
    disposition: string;
    investigator_notes: string;
    recommended_action: string;
  }): Promise<any> {
    return this.request(`/cases/${caseId}/decision`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Graph
  async getCaseSubgraph(caseId: string, depth = 2): Promise<any> {
    return this.request(`/graph/case/${caseId}?depth=${depth}`);
  }

  async getSuspiciousClusters(): Promise<any[]> {
    return this.request('/graph/clusters');
  }

  async getFullGraph(): Promise<any> {
    return this.request('/graph/full');
  }

  // Simulations
  async runCounterfactual(caseId: string, excludeEntityIds: string[]): Promise<any> {
    return this.request('/simulate/counterfactual', {
      method: 'POST',
      body: JSON.stringify({ case_id: caseId, exclude_entity_ids: excludeEntityIds }),
    });
  }

  async runRedTeam(schemeType: string, intensityMultiplier = 1.5, claimCount = 40): Promise<any> {
    return this.request('/simulate/redteam', {
      method: 'POST',
      body: JSON.stringify({
        scheme_type: schemeType,
        intensity_multiplier: intensityMultiplier,
        claim_count: claimCount,
      }),
    });
  }

  // Analytics & Audit
  async getDetectorPerf(): Promise<any> {
    return this.request('/analytics/detector-perf');
  }

  async getAuditLogs(limit = 50): Promise<AuditLogEntry[]> {
    return this.request(`/audit/logs?limit=${limit}`);
  }

  async verifyAuditIntegrity(): Promise<any> {
    return this.request('/audit/verify');
  }
}

export const api = new ApiService();
