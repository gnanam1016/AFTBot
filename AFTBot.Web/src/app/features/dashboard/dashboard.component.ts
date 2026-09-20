import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardSummary } from '../../core/models/lead.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-page">
      <header class="dash-header">
        <div class="header-container">
          <div class="brand">
            <span class="logo">🦅</span>
            <div>
              <h1>AFTBot Admin Dashboard</h1>
              <p>Apex Falcon Technologies Lead Intelligence & Analytics</p>
            </div>
          </div>
          <div class="nav-actions">
            <a routerLink="/dashboard" class="btn-outline active">📊 Dashboard</a>
            <a routerLink="/leads" class="btn-outline">👥 Leads</a>
            <a routerLink="/conversations" class="btn-outline">💬 Conversations</a>
            <a routerLink="/" class="btn-outline">Website</a>
            <button class="btn-logout" (click)="logout()" title="Sign out of Admin Portal">🚪 Logout</button>
          </div>
        </div>
      </header>

      <main class="dash-content">
        @if (loading()) {
          <div class="loading-state">
            <p>Loading dashboard metrics...</p>
          </div>
        } @else if (summary(); as data) {
          <!-- Metric KPI Cards -->
          <div class="kpi-grid">
            <div class="kpi-card total">
              <div class="kpi-label">Total Leads</div>
              <div class="kpi-value">{{ data.totalLeads }}</div>
              <div class="kpi-sub">Lifetime leads collected</div>
            </div>

            <div class="kpi-card new">
              <div class="kpi-label">New Leads</div>
              <div class="kpi-value">{{ data.newLeads }}</div>
              <div class="kpi-sub">Awaiting initial contact</div>
            </div>

            <div class="kpi-card contacted">
              <div class="kpi-label">Contacted</div>
              <div class="kpi-value">{{ data.contactedLeads }}</div>
              <div class="kpi-sub">Outreach completed</div>
            </div>

            <div class="kpi-card qualified">
              <div class="kpi-label">Qualified</div>
              <div class="kpi-value">{{ data.qualifiedLeads }}</div>
              <div class="kpi-sub">Requirements verified</div>
            </div>

            <div class="kpi-card converted">
              <div class="kpi-label">Converted</div>
              <div class="kpi-value">{{ data.convertedLeads }}</div>
              <div class="kpi-sub">Deals closed</div>
            </div>

            <div class="kpi-card today">
              <div class="kpi-label">Today's Leads</div>
              <div class="kpi-value">{{ data.todayLeads }}</div>
              <div class="kpi-sub">Captured in last 24h</div>
            </div>
          </div>

          <!-- Purpose Distribution & High Priority -->
          <div class="details-grid">
            <div class="card purpose-card">
              <h2>Lead Purpose Breakdown</h2>
              <div class="purpose-list">
                @for (item of data.purposeBreakdown; track item.purpose) {
                  <div class="purpose-item">
                    <div class="purpose-name">{{ item.purpose }}</div>
                    <div class="purpose-bar-wrapper">
                      <div class="purpose-bar" [style.width.%]="(item.count / (data.totalLeads || 1)) * 100"></div>
                    </div>
                    <div class="purpose-count">{{ item.count }}</div>
                  </div>
                }
              </div>
            </div>

            <div class="card action-card">
              <h2>Lead Generation Highlights</h2>
              <div class="highlight-item">
                <span class="hl-label">High Priority Leads:</span>
                <span class="hl-value badge-high">{{ data.highPriorityLeads }}</span>
              </div>
              <div class="highlight-item">
                <span class="hl-label">Direct Contact Requests:</span>
                <span class="hl-value badge-contact">{{ data.contactRequestedCount }}</span>
              </div>
              <div class="card-footer-action">
                <a routerLink="/leads" class="btn-full">Review & Qualify Leads</a>
              </div>
            </div>
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .dashboard-page {
      min-height: 100vh;
      background: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }

    .dash-header {
      background: #0f172a;
      color: #ffffff;
      padding: 20px 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);

      .header-container {
        max-width: 1200px;
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
        gap: 14px;

        .logo { font-size: 32px; }
        h1 { margin: 0; font-size: 20px; font-weight: 700; }
        p { margin: 2px 0 0 0; font-size: 13px; color: #94a3b8; }
      }

      .nav-actions {
        display: flex;
        gap: 12px;

        .btn-outline {
          color: #ffffff;
          border: 1px solid #475569;
          text-decoration: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;

          &:hover, &.active { background: #1e293b; border-color: #3b82f6; }
        }

        .btn-logout {
          background: #ef4444;
          color: #ffffff;
          border: none;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;

          &:hover { background: #dc2626; }
        }

        .btn-primary {
          background: #2563eb;
          color: #ffffff;
          text-decoration: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s;

          &:hover { background: #1d4ed8; }
        }
      }
    }

    .dash-content {
      max-width: 1200px;
      margin: 32px auto;
      padding: 0 24px;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 18px;
      margin-bottom: 32px;

      .kpi-card {
        background: #ffffff;
        border-radius: 12px;
        padding: 20px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 2px 4px rgba(0,0,0,0.03);

        .kpi-label { font-size: 13px; font-weight: 600; color: #64748b; text-transform: uppercase; }
        .kpi-value { font-size: 32px; font-weight: 800; color: #0f172a; margin: 8px 0 4px 0; }
        .kpi-sub { font-size: 12px; color: #94a3b8; }

        &.total { border-top: 4px solid #2563eb; }
        &.new { border-top: 4px solid #0284c7; }
        &.contacted { border-top: 4px solid #f59e0b; }
        &.qualified { border-top: 4px solid #8b5cf6; }
        &.converted { border-top: 4px solid #10b981; }
        &.today { border-top: 4px solid #ec4899; }
      }
    }

    .details-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }

      .card {
        background: #ffffff;
        border-radius: 12px;
        padding: 24px;
        border: 1px solid #e2e8f0;

        h2 { margin: 0 0 20px 0; font-size: 18px; font-weight: 700; color: #0f172a; }
      }

      .purpose-list {
        display: flex;
        flex-direction: column;
        gap: 14px;

        .purpose-item {
          display: flex;
          align-items: center;
          gap: 12px;

          .purpose-name { width: 190px; font-size: 14px; font-weight: 500; color: #334155; }
          .purpose-bar-wrapper {
            flex: 1;
            height: 10px;
            background: #f1f5f9;
            border-radius: 5px;
            overflow: hidden;

            .purpose-bar {
              height: 100%;
              background: linear-gradient(90deg, #2563eb, #3b82f6);
              border-radius: 5px;
            }
          }
          .purpose-count { font-size: 14px; font-weight: 700; color: #0f172a; width: 32px; text-align: right; }
        }
      }

      .highlight-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #f1f5f9;

        .hl-label { font-size: 14px; color: #475569; }
        .hl-value { font-size: 14px; font-weight: 700; padding: 4px 10px; border-radius: 12px; }

        .badge-high { background: #fee2e2; color: #991b1b; }
        .badge-contact { background: #dcfce7; color: #166534; }
      }

      .card-footer-action {
        margin-top: 24px;

        .btn-full {
          display: block;
          text-align: center;
          background: #0f172a;
          color: #ffffff;
          text-decoration: none;
          padding: 10px 18px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;

          &:hover { background: #1e293b; }
        }
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  readonly summary = signal<DashboardSummary | null>(null);
  readonly loading = signal<boolean>(true);

  ngOnInit(): void {
    this.api.getDashboardSummary().subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success && res.data) {
          this.summary.set(res.data);
        }
      },
      error: () => this.loading.set(false)
    });
  }

  logout(): void {
    this.auth.logout();
  }
}
