import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Lead } from '../../core/models/lead.models';
import { ChatSession } from '../../core/models/chat.models';

@Component({
  selector: 'app-lead-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="lead-detail-page">
      <header class="dash-header">
        <div class="header-container">
          <div class="brand">
            <span class="logo">🦅</span>
            <div>
              <h1>Lead Dossier #{{ leadId }}</h1>
              <p>Apex Falcon Lead Details & Conversation Transcript</p>
            </div>
          </div>
          <div class="nav-actions">
            <a routerLink="/dashboard" class="btn-outline">📊 Dashboard</a>
            <a routerLink="/leads" class="btn-outline">👥 Leads</a>
            <a routerLink="/conversations" class="btn-outline">💬 Conversations</a>
            <a routerLink="/users" class="btn-outline">👤 Users</a>
            <a routerLink="/" class="btn-outline">Website</a>
            <button class="btn-logout" (click)="logout()" title="Sign out of Admin Portal">🚪 Logout</button>
          </div>
        </div>
      </header>

      <main class="detail-content">
        @if (loading()) {
          <div class="loading-state">Loading lead details...</div>
        } @else if (lead(); as item) {
          <!-- Action Bar: Status Transitions -->
          <div class="status-action-bar">
            <span class="bar-label">Current Status: <strong class="curr-status">{{ item.leadStatus }}</strong></span>
            <div class="status-buttons">
              <button 
                class="btn-status" 
                [class.active]="item.leadStatus === 'New'" 
                (click)="updateStatus('New')">
                New
              </button>
              <button 
                class="btn-status contacted" 
                [class.active]="item.leadStatus === 'Contacted'" 
                (click)="updateStatus('Contacted')">
                📞 Mark Contacted
              </button>
              <button 
                class="btn-status qualified" 
                [class.active]="item.leadStatus === 'Qualified'" 
                (click)="updateStatus('Qualified')">
                ✅ Mark Qualified
              </button>
              <button 
                class="btn-status demo" 
                [class.active]="item.leadStatus === 'DemoScheduled'" 
                (click)="updateStatus('DemoScheduled')">
                📅 Schedule Demo
              </button>
              <button 
                class="btn-status converted" 
                [class.active]="item.leadStatus === 'Converted'" 
                (click)="updateStatus('Converted')">
                🤝 Converted
              </button>
              <button 
                class="btn-status lost" 
                [class.active]="item.leadStatus === 'Lost'" 
                (click)="updateStatus('Lost')">
                ❌ Lost
              </button>
              <button 
                class="btn-status closed" 
                [class.active]="item.leadStatus === 'Closed'" 
                (click)="updateStatus('Closed')">
                📁 Closed
              </button>
            </div>
          </div>

          <div class="grid-layout">
            <!-- Left Column: Lead Info & Scoring -->
            <div class="info-column">
              <!-- Lead Summary Card -->
              <div class="card lead-summary-card">
                <div class="card-header">
                  <div>
                    <h2>{{ item.name }}</h2>
                    <span class="sub-created">Captured {{ item.createdDate | date:'medium' }}</span>
                  </div>
                  <span class="priority-badge" [ngClass]="item.leadPriority.toLowerCase()">
                    {{ item.leadPriority }} Priority
                  </span>
                </div>

                <div class="info-list">
                  <div class="info-item">
                    <span class="label">Mobile:</span>
                    <span class="value">
                      @if (item.mobile) {
                        <a [href]="'tel:' + item.mobile" class="contact-link">{{ item.mobile }}</a>
                      } @else {
                        <span class="muted">Not provided</span>
                      }
                    </span>
                  </div>
                  <div class="info-item">
                    <span class="label">Email:</span>
                    <span class="value">
                      @if (item.email) {
                        <a [href]="'mailto:' + item.email" class="contact-link">{{ item.email }}</a>
                      } @else {
                        <span class="muted">Not provided</span>
                      }
                    </span>
                  </div>
                  <div class="info-item">
                    <span class="label">Purpose:</span>
                    <span class="value badge-purpose">{{ item.purpose }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Interested Product:</span>
                    <span class="value">{{ item.interestedProduct || 'General' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Organization Type:</span>
                    <span class="value">{{ item.organizationType || 'Not specified' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Callback Requested:</span>
                    <span class="value" [class.urgent-call]="item.contactRequested">
                      {{ item.contactRequested ? '🔥 Yes (Urgent)' : 'No' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Lead Scoring Breakdown Card -->
              <div class="card scoring-card">
                <div class="score-header">
                  <h3>Lead Qualification Score</h3>
                  <div class="score-meter-box">
                    <span class="score-num">{{ item.leadScore }}</span>
                    <span class="score-max">/100</span>
                  </div>
                </div>

                <div class="score-progress-bar">
                  <div 
                    class="score-fill" 
                    [style.width.%]="item.leadScore"
                    [ngClass]="item.leadScore >= 65 ? 'high-score' : (item.leadScore >= 35 ? 'med-score' : 'low-score')">
                  </div>
                </div>

                <div class="breakdown-grid">
                  <div class="breakdown-item" [class.achieved]="!!item.mobile">
                    <span class="chk">{{ item.mobile ? '✓' : '○' }}</span>
                    <span class="b-label">Mobile Number</span>
                    <span class="b-pts">+20 pts</span>
                  </div>
                  <div class="breakdown-item" [class.achieved]="!!item.email">
                    <span class="chk">{{ item.email ? '✓' : '○' }}</span>
                    <span class="b-label">Email Address</span>
                    <span class="b-pts">+10 pts</span>
                  </div>
                  <div class="breakdown-item" [class.achieved]="!!item.requirement">
                    <span class="chk">{{ item.requirement ? '✓' : '○' }}</span>
                    <span class="b-label">Requirement Stated</span>
                    <span class="b-pts">+20 pts</span>
                  </div>
                  <div class="breakdown-item" [class.achieved]="!!item.interestedProduct">
                    <span class="chk">{{ item.interestedProduct ? '✓' : '○' }}</span>
                    <span class="b-label">Product / Solution</span>
                    <span class="b-pts">+15 pts</span>
                  </div>
                  <div class="breakdown-item" [class.achieved]="!!item.additionalDetails || (item.details && item.details.length > 0)">
                    <span class="chk">{{ (item.additionalDetails || (item.details && item.details.length > 0)) ? '✓' : '○' }}</span>
                    <span class="b-label">Scope / Questionnaire</span>
                    <span class="b-pts">+15 pts</span>
                  </div>
                  <div class="breakdown-item" [class.achieved]="item.contactRequested">
                    <span class="chk">{{ item.contactRequested ? '✓' : '○' }}</span>
                    <span class="b-label">Contact / Callback</span>
                    <span class="b-pts">+20 pts</span>
                  </div>
                </div>
              </div>

              <!-- Requirement & Custom Questionnaire Details -->
              <div class="card req-card">
                <h3>Requirement Description</h3>
                <p class="req-text">{{ item.requirement || 'No detailed requirement submitted.' }}</p>
                
                @if (item.additionalDetails) {
                  <div class="extra-details">
                    <h4>Additional Details</h4>
                    <p>{{ item.additionalDetails }}</p>
                  </div>
                }

                @if (item.details && item.details.length > 0) {
                  <div class="details-section">
                    <h4>Purpose-Specific Questionnaire Answers</h4>
                    <div class="detail-tags-grid">
                      @for (d of item.details; track d.leadDetailId) {
                        <div class="detail-tag-item">
                          <span class="dt-name">{{ d.fieldName }}:</span>
                          <span class="dt-val">{{ d.fieldValue }}</span>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>

              <!-- Visitor Session Metadata -->
              <div class="card meta-card">
                <h3>Visitor Metadata</h3>
                <div class="info-list small">
                  <div class="info-item">
                    <span class="label">IP Address:</span>
                    <span class="value">{{ item.ipAddress || '127.0.0.1' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">User Agent:</span>
                    <span class="value ua-text">{{ item.userAgent || 'Web Browser' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Session ID:</span>
                    <span class="value">#{{ item.chatSessionId }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column: Conversation Transcript -->
            <div class="transcript-column">
              <div class="card transcript-card">
                <div class="transcript-header">
                  <h3>Full Conversation Transcript</h3>
                  @if (conversation(); as chat) {
                    <span class="chat-count-pill">{{ chat.messages.length }} messages</span>
                  }
                </div>

                <div class="messages-container">
                  @if (conversation(); as chat) {
                    @if (chat.messages.length === 0) {
                      <p class="empty-text">No messages recorded for this session.</p>
                    } @else {
                      @for (msg of chat.messages; track msg.chatMessageId) {
                        <div class="transcript-bubble" [ngClass]="msg.senderType.toLowerCase()">
                          <div class="msg-header">
                            <strong>{{ msg.senderType === 'Bot' ? '🦅 AFTBot' : '👤 ' + (item.name || 'Visitor') }}</strong>
                            <span class="msg-time">{{ msg.createdDate | date:'shortTime' }}</span>
                          </div>
                          <div class="msg-body">{{ msg.message }}</div>
                          @if (msg.quickReplies && msg.quickReplies.length > 0) {
                            <div class="qr-list">
                              @for (qr of msg.quickReplies; track qr) {
                                <span class="qr-item">{{ qr }}</span>
                              }
                            </div>
                          }
                        </div>
                      }
                    }
                  } @else {
                    <p class="empty-text">Loading conversation transcript...</p>
                  }
                </div>
              </div>
            </div>
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .lead-detail-page {
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

          &:hover { background: #1e293b; border-color: #3b82f6; }
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

    .detail-content {
      max-width: 1400px;
      margin: 24px auto;
      padding: 0 24px;
    }

    .status-action-bar {
      background: #ffffff;
      padding: 14px 20px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;

      .bar-label {
        font-size: 14px;
        color: #475569;
        .curr-status { color: #0f172a; font-weight: 700; margin-left: 4px; }
      }

      .status-buttons {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;

        .btn-status {
          background: #f1f5f9;
          color: #334155;
          border: 1px solid #cbd5e1;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;

          &:hover { background: #e2e8f0; }

          &.active {
            background: #2563eb;
            color: #ffffff;
            border-color: #2563eb;
            font-weight: 600;
          }

          &.contacted.active { background: #d97706; border-color: #d97706; }
          &.qualified.active { background: #7c3aed; border-color: #7c3aed; }
          &.demo.active { background: #0284c7; border-color: #0284c7; }
          &.converted.active { background: #10b981; border-color: #10b981; }
          &.lost.active { background: #ef4444; border-color: #ef4444; }
          &.closed.active { background: #64748b; border-color: #64748b; }
        }
      }
    }

    .grid-layout {
      display: grid;
      grid-template-columns: 1fr 1.2fr;
      gap: 24px;

      @media (max-width: 960px) {
        grid-template-columns: 1fr;
      }
    }

    .card {
      background: #ffffff;
      border-radius: 12px;
      padding: 22px;
      border: 1px solid #e2e8f0;
      margin-bottom: 20px;

      h2 { margin: 0; font-size: 20px; color: #0f172a; }
      h3 { margin: 0 0 14px 0; font-size: 16px; color: #0f172a; }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 18px;
      padding-bottom: 12px;
      border-bottom: 1px solid #f1f5f9;

      .sub-created { font-size: 12px; color: #94a3b8; display: block; margin-top: 4px; }
    }

    .priority-badge {
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 700;

      &.high { background: #fee2e2; color: #991b1b; }
      &.medium { background: #fef3c7; color: #92400e; }
      &.low { background: #f1f5f9; color: #475569; }
    }

    .info-list {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .info-item {
        display: flex;
        justify-content: space-between;
        font-size: 14px;

        .label { color: #64748b; font-weight: 500; }
        .value { color: #0f172a; font-weight: 600; text-align: right; }
        .contact-link { color: #2563eb; text-decoration: none; &:hover { text-decoration: underline; } }
        .muted { color: #94a3b8; font-weight: normal; }
        .urgent-call { color: #dc2626; font-weight: 700; }
      }

      &.small {
        font-size: 12px;
        .ua-text { max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      }
    }

    .badge-purpose { background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 8px; font-weight: 500; }

    /* Scoring Section */
    .score-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      h3 { margin: 0; }
      .score-meter-box {
        .score-num { font-size: 26px; font-weight: 800; color: #0f172a; }
        .score-max { font-size: 14px; color: #94a3b8; font-weight: 600; }
      }
    }

    .score-progress-bar {
      height: 10px;
      background: #e2e8f0;
      border-radius: 5px;
      overflow: hidden;
      margin-bottom: 18px;

      .score-fill {
        height: 100%;
        border-radius: 5px;
        transition: width 0.4s ease;

        &.high-score { background: #10b981; }
        &.med-score { background: #f59e0b; }
        &.low-score { background: #94a3b8; }
      }
    }

    .breakdown-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;

      .breakdown-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        padding: 6px 10px;
        border-radius: 6px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        color: #94a3b8;

        .chk { font-weight: 700; width: 14px; }
        .b-label { flex: 1; }
        .b-pts { font-weight: 600; font-size: 11px; }

        &.achieved {
          background: #f0fdf4;
          border-color: #bbf7d0;
          color: #166534;
          .chk { color: #16a34a; }
          .b-pts { color: #15803d; }
        }
      }
    }

    .req-text { font-size: 14px; color: #334155; line-height: 1.6; }
    .extra-details { margin-top: 14px; h4 { margin: 0 0 6px 0; font-size: 13px; color: #64748b; } p { margin: 0; font-size: 13px; color: #334155; } }

    .details-section {
      margin-top: 18px;
      padding-top: 14px;
      border-top: 1px solid #f1f5f9;

      h4 { margin: 0 0 10px 0; font-size: 13px; color: #475569; }

      .detail-tags-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .detail-tag-item {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 8px;
          padding: 4px 10px;
          font-size: 12px;

          .dt-name { color: #1e40af; font-weight: 600; margin-right: 4px; }
          .dt-val { color: #1e293b; }
        }
      }
    }

    .transcript-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;

      h3 { margin: 0; }
      .chat-count-pill {
        background: #f1f5f9;
        color: #475569;
        font-size: 12px;
        padding: 3px 8px;
        border-radius: 10px;
        font-weight: 600;
      }
    }

    .messages-container {
      max-height: 550px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .transcript-bubble {
      padding: 12px 16px;
      border-radius: 10px;
      font-size: 13px;
      line-height: 1.5;

      &.bot {
        background: #f8fafc;
        border-left: 4px solid #2563eb;
      }

      &.visitor {
        background: #eff6ff;
        border-left: 4px solid #10b981;
      }

      .msg-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 6px;
        font-size: 12px;
        color: #475569;
      }

      .msg-body { white-space: pre-wrap; color: #1e293b; }

      .qr-list {
        margin-top: 8px;
        display: flex;
        flex-wrap: wrap;
        gap: 6px;

        .qr-item {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #2563eb;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 11px;
        }
      }
    }

    .loading-state, .empty-text {
      text-align: center;
      padding: 40px;
      color: #94a3b8;
    }
  `]
})
export class LeadDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  leadId = 0;
  readonly lead = signal<Lead | null>(null);
  readonly conversation = signal<ChatSession | null>(null);
  readonly loading = signal<boolean>(true);

  ngOnInit(): void {
    this.leadId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.leadId) {
      this.loadLead();
    }
  }

  loadLead(): void {
    this.api.getLeadById(this.leadId).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success && res.data) {
          this.lead.set(res.data);
          if (res.data.chatSessionId) {
            this.loadTranscript(res.data.chatSessionId);
          }
        }
      },
      error: () => this.loading.set(false)
    });
  }

  updateStatus(newStatus: string): void {
    if (!this.leadId) return;
    this.api.updateLeadStatus(this.leadId, newStatus).subscribe({
      next: (res) => {
        if (res.success) {
          this.lead.update(curr => curr ? { ...curr, leadStatus: newStatus as any } : null);
        }
      }
    });
  }

  logout(): void {
    this.auth.logout();
  }

  private loadTranscript(sessionId: number): void {
    this.api.getSession(sessionId.toString()).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.conversation.set(res.data);
        }
      }
    });
  }
}

