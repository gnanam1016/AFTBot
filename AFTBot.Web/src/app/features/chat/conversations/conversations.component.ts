import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { ChatSessionSummary, ChatSession, ChatMessage } from '../../../core/models/chat.models';

@Component({
  selector: 'app-conversations',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="conversations-page">
      <header class="dash-header">
        <div class="header-container">
          <div class="brand">
            <span class="logo">🦅</span>
            <div>
              <h1>Conversations & Transcripts</h1>
              <p>Apex Falcon Technologies Live & Historical Visitor Chats</p>
            </div>
          </div>
          <div class="nav-actions">
            <a routerLink="/dashboard" class="btn-outline">📊 Dashboard</a>
            <a routerLink="/leads" class="btn-outline">👥 Leads</a>
            <a routerLink="/conversations" class="btn-outline active">💬 Conversations</a>
            <a routerLink="/" class="btn-outline">Website</a>
            <button class="btn-logout" (click)="logout()" title="Sign out of Admin Portal">🚪 Logout</button>
          </div>
        </div>
      </header>

      <main class="conversations-content">
        <!-- Toolbar & Filter -->
        <div class="filter-bar">
          <div class="search-box">
            <input 
              type="text" 
              placeholder="Search by visitor name, phone, email, purpose, or session ID..." 
              [(ngModel)]="searchTerm" 
              (ngModelChange)="filterSessions()" />
          </div>

          <div class="select-filters">
            <select [(ngModel)]="statusFilter" (change)="filterSessions()">
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Abandoned">Abandoned</option>
            </select>

            <select [(ngModel)]="purposeFilter" (change)="filterSessions()">
              <option value="">All Purposes</option>
              <option value="Software / Product Enquiry">Software / Product</option>
              <option value="Training">Training</option>
              <option value="Internship">Internship</option>
              <option value="Software Development">Software Development</option>
              <option value="AI / IoT Solutions">AI / IoT Solutions</option>
              <option value="School / College Solutions">School / College Solutions</option>
              <option value="Other">Other</option>
            </select>

            <button class="btn-refresh" (click)="loadSessions()">↻ Refresh</button>
          </div>
        </div>

        <div class="main-layout" [class.has-drawer]="selectedSession() !== null">
          <!-- Sessions Table -->
          <div class="table-container">
            <table class="sessions-table">
              <thead>
                <tr>
                  <th>Session</th>
                  <th>Visitor</th>
                  <th>Purpose</th>
                  <th>Messages</th>
                  <th>Started</th>
                  <th>Status</th>
                  <th>Lead</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                @if (loading()) {
                  <tr>
                    <td colspan="8" class="empty-cell">Loading conversations...</td>
                  </tr>
                } @else if (filteredSessions().length === 0) {
                  <tr>
                    <td colspan="8" class="empty-cell">No conversations found.</td>
                  </tr>
                } @else {
                  @for (s of filteredSessions(); track s.chatSessionId) {
                    <tr [class.selected-row]="selectedSession()?.chatSessionId === s.chatSessionId">
                      <td class="session-id-col">
                        <span class="session-badge" [title]="s.sessionId">
                          #{{ s.chatSessionId }}
                        </span>
                      </td>
                      <td class="visitor-col">
                        <strong>{{ s.visitorName || 'Anonymous Visitor' }}</strong>
                        @if (s.visitorMobile) {
                          <span class="sub-contact">📞 {{ s.visitorMobile }}</span>
                        }
                        @if (s.visitorEmail) {
                          <span class="sub-contact">✉️ {{ s.visitorEmail }}</span>
                        }
                      </td>
                      <td class="purpose-col">
                        <span class="purpose-badge">{{ s.purpose || 'General Enquiry' }}</span>
                      </td>
                      <td class="count-col">
                        <span class="msg-count-pill">{{ s.messageCount || 0 }} msgs</span>
                      </td>
                      <td class="date-col">
                        {{ s.startedDate | date:'short' }}
                      </td>
                      <td>
                        <span class="status-pill" [ngClass]="(s.status || 'active').toLowerCase()">
                          {{ s.status }}
                        </span>
                      </td>
                      <td>
                        @if (s.leadId) {
                          <a [routerLink]="['/leads', s.leadId]" class="lead-link" title="View Lead Dossier">
                            Lead #{{ s.leadId }} →
                          </a>
                        } @else {
                          <span class="no-lead">—</span>
                        }
                      </td>
                      <td>
                        <button class="btn-transcript" (click)="viewTranscript(s)">
                          {{ selectedSession()?.chatSessionId === s.chatSessionId ? 'Viewing' : 'View Chat' }}
                        </button>
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>

          <!-- Side Transcript Drawer -->
          @if (selectedSession(); as active) {
            <aside class="transcript-drawer">
              <div class="drawer-header">
                <div>
                  <h3>Chat #{{ active.chatSessionId }}</h3>
                  <p class="drawer-sub">
                    {{ active.visitorName || 'Visitor' }} • 
                    {{ active.startedDate | date:'medium' }}
                  </p>
                </div>
                <button class="btn-close" (click)="closeTranscript()">✕</button>
              </div>

              <div class="drawer-body">
                @if (transcriptLoading()) {
                  <div class="loading-state">Loading transcript...</div>
                } @else if (activeMessages().length === 0) {
                  <div class="empty-state">No messages in this conversation.</div>
                } @else {
                  <div class="messages-list">
                    @for (msg of activeMessages(); track msg.chatMessageId) {
                      <div class="msg-row" [ngClass]="msg.senderType.toLowerCase()">
                        <div class="msg-bubble">
                          <div class="msg-sender">
                            <span>{{ msg.senderType === 'Bot' ? '🦅 AFTBot' : (active.visitorName || 'Visitor') }}</span>
                            <span class="msg-timestamp">{{ msg.createdDate | date:'shortTime' }}</span>
                          </div>
                          <div class="msg-text">{{ msg.message }}</div>
                          @if (msg.quickReplies && msg.quickReplies.length > 0) {
                            <div class="quick-replies-view">
                              @for (qr of msg.quickReplies; track qr) {
                                <span class="qr-pill">{{ qr }}</span>
                              }
                            </div>
                          }
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>

              <div class="drawer-footer">
                @if (active.leadId) {
                  <a [routerLink]="['/leads', active.leadId]" class="btn-goto-lead">
                    View Lead Dossier (#{{ active.leadId }}) →
                  </a>
                }
                <div class="meta-row">
                  <span>Session Key:</span>
                  <code>{{ active.sessionId }}</code>
                </div>
              </div>
            </aside>
          }
        </div>
      </main>
    </div>
  `,
  styles: [`
    .conversations-page {
      min-height: 100vh;
      background: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .dash-header {
      background: #0f172a;
      color: #ffffff;
      padding: 20px 24px;

      .header-container {
        max-width: 1400px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 16px;
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 12px;
        .logo { font-size: 28px; }
        h1 { margin: 0; font-size: 20px; }
        p { margin: 2px 0 0 0; font-size: 13px; color: #94a3b8; }
      }

      .nav-actions {
        display: flex;
        gap: 10px;

        .btn-outline {
          color: #ffffff;
          border: 1px solid #475569;
          text-decoration: none;
          padding: 6px 14px;
          border-radius: 6px;
          font-size: 13px;
          transition: background 0.2s;

          &:hover, &.active { background: #1e293b; border-color: #3b82f6; }
        }

        .btn-logout {
          background: #ef4444;
          color: #ffffff;
          border: none;
          padding: 6px 14px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;

          &:hover { background: #dc2626; }
        }
      }
    }

    .conversations-content {
      max-width: 1400px;
      margin: 24px auto;
      padding: 0 24px;
    }

    .filter-bar {
      background: #ffffff;
      padding: 16px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      margin-bottom: 20px;
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;

      .search-box {
        flex: 1;
        min-width: 280px;

        input {
          width: 100%;
          padding: 8px 14px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 14px;
          box-sizing: border-box;
        }
      }

      .select-filters {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;

        select {
          padding: 8px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 14px;
          background: #ffffff;
        }

        .btn-refresh {
          background: #f1f5f9;
          color: #334155;
          border: 1px solid #cbd5e1;
          padding: 8px 14px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.2s;

          &:hover { background: #e2e8f0; }
        }
      }
    }

    .main-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
      transition: all 0.3s ease;

      &.has-drawer {
        grid-template-columns: 1fr 450px;

        @media (max-width: 1024px) {
          grid-template-columns: 1fr;
        }
      }
    }

    .table-container {
      background: #ffffff;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      overflow-x: auto;
    }

    .sessions-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 14px;

      th {
        background: #f8fafc;
        padding: 12px 16px;
        color: #475569;
        font-weight: 600;
        border-bottom: 1px solid #e2e8f0;
      }

      td {
        padding: 14px 16px;
        border-bottom: 1px solid #f1f5f9;
        vertical-align: middle;
      }

      tr.selected-row {
        background: #eff6ff;
      }

      .session-id-col {
        font-weight: 600;
        .session-badge {
          background: #f1f5f9;
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 12px;
          color: #334155;
        }
      }

      .visitor-col {
        strong { display: block; color: #0f172a; margin-bottom: 2px; }
        .sub-contact { display: block; font-size: 12px; color: #64748b; }
      }

      .purpose-badge {
        display: inline-block;
        background: #e0f2fe;
        color: #0369a1;
        padding: 3px 8px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 500;
      }

      .msg-count-pill {
        background: #f1f5f9;
        color: #475569;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
      }

      .status-pill {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;

        &.active { background: #dcfce7; color: #166534; }
        &.completed { background: #e0e7ff; color: #3730a3; }
        &.abandoned { background: #fee2e2; color: #991b1b; }
      }

      .lead-link {
        color: #2563eb;
        text-decoration: none;
        font-weight: 600;
        font-size: 13px;

        &:hover { text-decoration: underline; }
      }

      .no-lead { color: #cbd5e1; }

      .btn-transcript {
        background: #2563eb;
        color: #ffffff;
        border: none;
        padding: 5px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;

        &:hover { background: #1d4ed8; }
      }

      .empty-cell {
        text-align: center;
        padding: 40px;
        color: #94a3b8;
      }
    }

    .transcript-drawer {
      background: #ffffff;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      height: 750px;
      position: sticky;
      top: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);

      .drawer-header {
        padding: 16px 20px;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;

        h3 { margin: 0; font-size: 16px; color: #0f172a; }
        .drawer-sub { margin: 4px 0 0 0; font-size: 12px; color: #64748b; }
        .btn-close {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #94a3b8;
          padding: 0;

          &:hover { color: #0f172a; }
        }
      }

      .drawer-body {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
      }

      .drawer-footer {
        padding: 14px 16px;
        border-top: 1px solid #e2e8f0;
        background: #f8fafc;
        border-bottom-left-radius: 12px;
        border-bottom-right-radius: 12px;

        .btn-goto-lead {
          display: block;
          text-align: center;
          background: #0f172a;
          color: #ffffff;
          text-decoration: none;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 10px;

          &:hover { background: #1e293b; }
        }

        .meta-row {
          font-size: 11px;
          color: #64748b;
          display: flex;
          gap: 6px;
          align-items: center;

          code {
            background: #e2e8f0;
            padding: 2px 4px;
            border-radius: 4px;
            font-size: 10px;
            color: #1e293b;
            word-break: break-all;
          }
        }
      }
    }

    .messages-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .msg-row {
      display: flex;
      flex-direction: column;

      &.bot {
        align-items: flex-start;
        .msg-bubble {
          background: #f1f5f9;
          border-left: 3px solid #2563eb;
        }
      }

      &.visitor {
        align-items: flex-end;
        .msg-bubble {
          background: #eff6ff;
          border-right: 3px solid #10b981;
        }
      }
    }

    .msg-bubble {
      max-width: 90%;
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 13px;
      line-height: 1.4;

      .msg-sender {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        font-size: 11px;
        font-weight: 600;
        color: #475569;
        margin-bottom: 4px;
      }

      .msg-timestamp { font-weight: normal; color: #94a3b8; }
      .msg-text { white-space: pre-wrap; color: #1e293b; }

      .quick-replies-view {
        margin-top: 8px;
        display: flex;
        flex-wrap: wrap;
        gap: 6px;

        .qr-pill {
          font-size: 11px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #2563eb;
          padding: 2px 8px;
          border-radius: 12px;
        }
      }
    }

    .loading-state, .empty-state {
      text-align: center;
      padding: 40px 10px;
      color: #94a3b8;
      font-size: 13px;
    }
  `]
})
export class ConversationsComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  readonly allSessions = signal<ChatSessionSummary[]>([]);
  readonly filteredSessions = signal<ChatSessionSummary[]>([]);
  readonly loading = signal<boolean>(true);

  readonly selectedSession = signal<ChatSessionSummary | null>(null);
  readonly activeMessages = signal<ChatMessage[]>([]);
  readonly transcriptLoading = signal<boolean>(false);

  searchTerm = '';
  statusFilter = '';
  purposeFilter = '';

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.loading.set(true);
    this.api.getRecentSessions(100).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success && res.data) {
          this.allSessions.set(res.data);
          this.filterSessions();
        }
      },
      error: () => this.loading.set(false)
    });
  }

  filterSessions(): void {
    const term = this.searchTerm.trim().toLowerCase();
    const status = this.statusFilter;
    const purpose = this.purposeFilter;

    const filtered = this.allSessions().filter(s => {
      const name = (s.visitorName || '').toLowerCase();
      const mobile = (s.visitorMobile || '').toLowerCase();
      const email = (s.visitorEmail || '').toLowerCase();
      const sPurpose = (s.purpose || '').toLowerCase();
      const sessId = (s.sessionId || '').toLowerCase();
      const chatSessId = (s.chatSessionId || '').toString();

      const matchesTerm = !term ||
        name.includes(term) ||
        mobile.includes(term) ||
        email.includes(term) ||
        sPurpose.includes(term) ||
        sessId.includes(term) ||
        chatSessId.includes(term);

      const matchesStatus = !status || s.status === status;
      const matchesPurpose = !purpose || s.purpose === purpose;

      return matchesTerm && matchesStatus && matchesPurpose;
    });

    this.filteredSessions.set(filtered);
  }

  viewTranscript(session: ChatSessionSummary): void {
    this.selectedSession.set(session);
    this.transcriptLoading.set(true);
    this.activeMessages.set([]);

    const key = session.chatSessionId.toString();
    this.api.getSession(key).subscribe({
      next: (res) => {
        this.transcriptLoading.set(false);
        if (res.success && res.data) {
          this.activeMessages.set(res.data.messages || []);
        }
      },
      error: () => this.transcriptLoading.set(false)
    });
  }

  closeTranscript(): void {
    this.selectedSession.set(null);
    this.activeMessages.set([]);
  }

  logout(): void {
    this.auth.logout();
  }
}
