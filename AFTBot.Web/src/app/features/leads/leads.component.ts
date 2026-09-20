import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Lead, LeadFilter } from '../../core/models/lead.models';

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="leads-page">
      <header class="dash-header">
        <div class="header-container">
          <div class="brand">
            <span class="logo">🦅</span>
            <div>
              <h1>Lead Management</h1>
              <p>Qualified Visitor Enquiries & Conversions</p>
            </div>
          </div>
          <div class="nav-actions">
            <a routerLink="/dashboard" class="btn-outline">📊 Dashboard</a>
            <a routerLink="/leads" class="btn-outline active">👥 Leads</a>
            <a routerLink="/conversations" class="btn-outline">💬 Conversations</a>
            <a routerLink="/users" class="btn-outline">👤 Users</a>
            <a routerLink="/" class="btn-outline">Website</a>
            <button class="btn-logout" (click)="logout()" title="Sign out of Admin Portal">🚪 Logout</button>
          </div>
        </div>
      </header>

      <main class="leads-content">
        <!-- Filters Toolbar -->
        <div class="filter-bar">
          <div class="search-box">
            <input 
              type="text" 
              placeholder="Search by name, mobile, email, requirement..." 
              [(ngModel)]="filter.searchTerm"
              (keyup.enter)="applyFilter()" />
          </div>

          <div class="select-filters">
            <select [(ngModel)]="filter.status" (change)="applyFilter()">
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="DemoScheduled">Demo Scheduled</option>
              <option value="Converted">Converted</option>
              <option value="Lost">Lost</option>
              <option value="Closed">Closed</option>
            </select>

            <select [(ngModel)]="filter.priority" (change)="applyFilter()">
              <option value="">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select [(ngModel)]="filter.purpose" (change)="applyFilter()">
              <option value="">All Purposes</option>
              <option value="Software / Product Enquiry">Software / Product</option>
              <option value="Training">Training</option>
              <option value="Internship">Internship</option>
              <option value="Software Development">Software Development</option>
              <option value="AI / IoT Solutions">AI / IoT Solutions</option>
              <option value="School / College Solutions">School / College Solutions</option>
              <option value="Other">Other</option>
            </select>

            <select [(ngModel)]="filter.product" (change)="applyFilter()">
              <option value="">All Products</option>
              <option value="Apex ERP">Apex ERP</option>
              <option value="Falcon CRM">Falcon CRM</option>
              <option value="AI Chatbots & Agents">AI Chatbots & Agents</option>
              <option value="Cloud Migration">Cloud Migration</option>
              <option value="Web & Mobile Applications">Web & Mobile Apps</option>
              <option value="Custom Software">Custom Software</option>
              <option value="Other">Other</option>
            </select>

            <div class="date-group">
              <label>From:</label>
              <input type="date" [(ngModel)]="filter.startDate" (change)="applyFilter()" />
            </div>

            <div class="date-group">
              <label>To:</label>
              <input type="date" [(ngModel)]="filter.endDate" (change)="applyFilter()" />
            </div>

            <button class="btn-filter" (click)="applyFilter()">Filter</button>
            <button class="btn-reset" (click)="resetFilter()">Reset</button>
            <button class="btn-export" (click)="exportCsv()" title="Download CSV report">📥 Export CSV</button>
          </div>
        </div>

        <!-- Leads Table -->
        <div class="table-container">
          <table class="leads-table">
            <thead>
              <tr>
                <th>Lead ID</th>
                <th>Name</th>
                <th>Contact</th>
                <th>Purpose & Requirement</th>
                <th>Score</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              @if (loading()) {
                <tr>
                  <td colspan="9" class="empty-cell">Loading leads...</td>
                </tr>
              } @else if (leads().length === 0) {
                <tr>
                  <td colspan="9" class="empty-cell">No leads found matching your criteria.</td>
                </tr>
              } @else {
                @for (lead of leads(); track lead.leadId) {
                  <tr>
                    <td class="id-col">#{{ lead.leadId }}</td>
                    <td class="name-col">
                      <strong>{{ lead.name }}</strong>
                      @if (lead.contactRequested) {
                        <span class="contact-pill" title="Visitor explicitly requested callback">📞 Callback</span>
                      }
                    </td>
                    <td class="contact-col">
                      <div>{{ lead.mobile || '—' }}</div>
                      <small class="email-text">{{ lead.email || '—' }}</small>
                    </td>
                    <td class="purpose-col">
                      <span class="purpose-badge">{{ lead.purpose }}</span>
                      <p class="req-preview">{{ lead.requirement || 'No additional details' }}</p>
                    </td>
                    <td>
                      <div class="score-display">{{ lead.leadScore }}/100</div>
                    </td>
                    <td>
                      <span class="priority-badge" [ngClass]="lead.leadPriority.toLowerCase()">
                        {{ lead.leadPriority }}
                      </span>
                    </td>
                    <td>
                      <select 
                        [ngModel]="lead.leadStatus" 
                        (ngModelChange)="onStatusChange(lead.leadId, $event)"
                        class="status-select">
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualified">Qualified</option>
                        <option value="DemoScheduled">Demo Scheduled</option>
                        <option value="Converted">Converted</option>
                        <option value="Lost">Lost</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                    <td class="date-col">
                      {{ lead.createdDate | date:'mediumDate' }}
                    </td>
                    <td>
                      <a [routerLink]="['/leads', lead.leadId]" class="btn-view">View</a>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div class="pagination-bar">
          <div class="page-info">
            Showing {{ (filter.pageNumber - 1) * filter.pageSize + (leads().length > 0 ? 1 : 0) }} - 
            {{ (filter.pageNumber - 1) * filter.pageSize + leads().length }} of {{ totalRecords() }} leads
          </div>
          <div class="page-controls">
            <button class="btn-page" [disabled]="filter.pageNumber <= 1" (click)="changePage(filter.pageNumber - 1)">‹ Prev</button>
            <span class="page-current">Page {{ filter.pageNumber }} of {{ totalPages() || 1 }}</span>
            <button class="btn-page" [disabled]="filter.pageNumber >= totalPages()" (click)="changePage(filter.pageNumber + 1)">Next ›</button>
            
            <select [ngModel]="filter.pageSize" (ngModelChange)="changePageSize($event)" class="size-select">
              <option [value]="10">10 / page</option>
              <option [value]="25">25 / page</option>
              <option [value]="50">50 / page</option>
              <option [value]="100">100 / page</option>
            </select>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .leads-page {
      min-height: 100vh;
      background: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .dash-header {
      background: #0f172a;
      color: #ffffff;
      padding: 20px 24px;

      .header-container {
        max-width: 1300px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
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

    .leads-content {
      max-width: 1300px;
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
        min-width: 260px;

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
        align-items: center;

        select {
          padding: 8px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 14px;
          background: #ffffff;
        }

        .date-group {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #475569;

          input[type="date"] {
            padding: 7px 10px;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            font-size: 13px;
            background: #ffffff;
          }
        }

        .btn-filter {
          background: #2563eb;
          color: #ffffff;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;

          &:hover { background: #1d4ed8; }
        }

        .btn-reset {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #cbd5e1;
          padding: 8px 14px;
          border-radius: 8px;
          cursor: pointer;

          &:hover { background: #e2e8f0; }
        }

        .btn-export {
          background: #10b981;
          color: #ffffff;
          border: none;
          padding: 8px 14px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;

          &:hover { background: #059669; }
        }
      }
    }

    .table-container {
      background: #ffffff;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      overflow-x: auto;
    }

    .leads-table {
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

      .id-col { color: #64748b; font-weight: 600; }
      .contact-pill {
        display: inline-block;
        background: #dcfce7;
        color: #166534;
        font-size: 11px;
        padding: 2px 6px;
        border-radius: 10px;
        margin-left: 6px;
      }
      .email-text { color: #64748b; font-size: 12px; display: block; }
      .purpose-badge {
        display: inline-block;
        background: #e0f2fe;
        color: #0369a1;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
      }
      .req-preview {
        margin: 4px 0 0 0;
        font-size: 13px;
        color: #64748b;
        max-width: 320px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .score-display { font-weight: 700; color: #0f172a; }

      .priority-badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;

        &.high { background: #fee2e2; color: #991b1b; }
        &.medium { background: #fef3c7; color: #92400e; }
        &.low { background: #f1f5f9; color: #475569; }
      }

      .status-select {
        padding: 4px 8px;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        font-size: 13px;
      }

      .btn-view {
        background: #f1f5f9;
        color: #2563eb;
        text-decoration: none;
        padding: 4px 10px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 12px;

        &:hover { background: #dbeafe; }
      }

      .empty-cell {
        text-align: center;
        padding: 40px;
        color: #94a3b8;
      }
    }

    .pagination-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 8px;
      margin-top: 12px;
      flex-wrap: wrap;
      gap: 12px;

      .page-info {
        font-size: 13px;
        color: #64748b;
      }

      .page-controls {
        display: flex;
        align-items: center;
        gap: 10px;

        .btn-page {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          &:not(:disabled):hover {
            background: #f1f5f9;
          }
        }

        .page-current {
          font-size: 13px;
          font-weight: 600;
          color: #334155;
        }

        .size-select {
          padding: 5px 8px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 13px;
          background: #ffffff;
        }
      }
    }
  `]
})
export class LeadsComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  readonly leads = signal<Lead[]>([]);
  readonly loading = signal<boolean>(true);
  readonly totalRecords = signal<number>(0);
  readonly totalPages = signal<number>(1);

  filter: LeadFilter = {
    pageNumber: 1,
    pageSize: 25,
    searchTerm: '',
    status: '',
    priority: '',
    purpose: '',
    product: '',
    startDate: '',
    endDate: ''
  };

  ngOnInit(): void {
    this.loadLeads();
  }

  loadLeads(): void {
    this.loading.set(true);
    this.api.getLeads(this.filter).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success && res.data) {
          this.leads.set(res.data.items || []);
          this.totalRecords.set(res.data.totalCount || 0);
          this.totalPages.set(res.data.totalPages || 1);
        }
      },
      error: () => this.loading.set(false)
    });
  }

  applyFilter(): void {
    this.filter.pageNumber = 1;
    this.loadLeads();
  }

  resetFilter(): void {
    this.filter = {
      pageNumber: 1,
      pageSize: 25,
      searchTerm: '',
      status: '',
      priority: '',
      purpose: '',
      product: '',
      startDate: '',
      endDate: ''
    };
    this.loadLeads();
  }

  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages()) {
      this.filter.pageNumber = newPage;
      this.loadLeads();
    }
  }

  changePageSize(newSize: number): void {
    this.filter.pageSize = Number(newSize);
    this.filter.pageNumber = 1;
    this.loadLeads();
  }

  onStatusChange(leadId: number, newStatus: string): void {
    this.api.updateLeadStatus(leadId, newStatus).subscribe({
      next: (res) => {
        if (res.success) {
          this.leads.update(items =>
            items.map(l => l.leadId === leadId ? { ...l, leadStatus: newStatus as any } : l)
          );
        }
      }
    });
  }

  exportCsv(): void {
    // Fetch all leads with current filters (large page size)
    const exportFilter: LeadFilter = {
      ...this.filter,
      pageNumber: 1,
      pageSize: 10000
    };

    this.api.getLeads(exportFilter).subscribe({
      next: (res) => {
        const items = res.data?.items || this.leads();
        if (!items || items.length === 0) {
          alert('No leads available to export.');
          return;
        }

        const headers = [
          'Lead ID',
          'Name',
          'Mobile',
          'Email',
          'Purpose',
          'Interested Product',
          'Requirement',
          'Score',
          'Priority',
          'Status',
          'Callback Requested',
          'Created Date'
        ];

        const rows = items.map(l => [
          l.leadId,
          `"${(l.name || '').replace(/"/g, '""')}"`,
          `"${(l.mobile || '').replace(/"/g, '""')}"`,
          `"${(l.email || '').replace(/"/g, '""')}"`,
          `"${(l.purpose || '').replace(/"/g, '""')}"`,
          `"${(l.interestedProduct || '').replace(/"/g, '""')}"`,
          `"${(l.requirement || '').replace(/"/g, '""')}"`,
          l.leadScore,
          l.leadPriority,
          l.leadStatus,
          l.contactRequested ? 'Yes' : 'No',
          `"${new Date(l.createdDate).toISOString()}"`
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const now = new Date().toISOString().slice(0, 10);
        link.setAttribute('href', url);
        link.setAttribute('download', `aftbot_leads_${now}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  }

  logout(): void {
    this.auth.logout();
  }
}

