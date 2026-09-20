import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, ChatMessage, ChatSession, ChatSessionSummary, CreateSessionRequest, SendMessageRequest } from '../models/chat.models';
import { DashboardSummary, Lead, LeadFilter, PagedResult } from '../models/lead.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = this.resolveBaseUrl();

  private resolveBaseUrl(): string {
    if (typeof window !== 'undefined') {
      if ((window as any).__AFTBOT_API_URL__) {
        return (window as any).__AFTBOT_API_URL__;
      }
      const params = new URLSearchParams(window.location.search);
      const queryApi = params.get('apiUrl') || params.get('api');
      if (queryApi) {
        return queryApi;
      }
    }
    return environment.apiUrl || 'http://localhost:5000/api';
  }

  // Chat APIs
  initializeSession(req: CreateSessionRequest): Observable<ApiResponse<ChatSession>> {
    return this.http.post<ApiResponse<ChatSession>>(`${this.baseUrl}/chat/session`, req);
  }

  sendMessage(req: SendMessageRequest): Observable<ApiResponse<ChatMessage>> {
    return this.http.post<ApiResponse<ChatMessage>>(`${this.baseUrl}/chat/message`, req);
  }

  getSession(sessionId: string): Observable<ApiResponse<ChatSession>> {
    return this.http.get<ApiResponse<ChatSession>>(`${this.baseUrl}/chat/session/${sessionId}`);
  }

  getRecentSessions(limit: number = 50): Observable<ApiResponse<ChatSessionSummary[]>> {
    return this.http.get<ApiResponse<ChatSessionSummary[]>>(`${this.baseUrl}/chat/sessions`, {
      params: { limit: limit.toString() }
    });
  }

  // Lead & Dashboard APIs
  getDashboardSummary(): Observable<ApiResponse<DashboardSummary>> {
    return this.http.get<ApiResponse<DashboardSummary>>(`${this.baseUrl}/dashboard/summary`);
  }

  getLeads(filter: LeadFilter): Observable<ApiResponse<PagedResult<Lead>>> {
    let params: any = {
      pageNumber: filter.pageNumber.toString(),
      pageSize: filter.pageSize.toString()
    };
    if (filter.purpose) params.purpose = filter.purpose;
    if (filter.status) params.status = filter.status;
    if (filter.priority) params.priority = filter.priority;
    if (filter.product) params.product = filter.product;
    if (filter.searchTerm) params.searchTerm = filter.searchTerm;
    if (filter.startDate) params.startDate = filter.startDate;
    if (filter.endDate) params.endDate = filter.endDate;

    return this.http.get<ApiResponse<PagedResult<Lead>>>(`${this.baseUrl}/leads`, { params });
  }

  getLeadById(id: number): Observable<ApiResponse<Lead>> {
    return this.http.get<ApiResponse<Lead>>(`${this.baseUrl}/leads/${id}`);
  }

  updateLeadStatus(id: number, status: string): Observable<ApiResponse<Lead>> {
    return this.http.put<ApiResponse<Lead>>(`${this.baseUrl}/leads/${id}/status`, { leadStatus: status });
  }
}
