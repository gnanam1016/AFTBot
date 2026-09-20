import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { AdminUserDetail, CreateAdminUserRequest } from '../../core/models/auth.models';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="users-page">
      <!-- Admin Header -->
      <header class="dash-header">
        <div class="header-container">
          <div class="brand">
            <span class="logo">🦅</span>
            <div>
              <h1>Admin User Management</h1>
              <p>Apex Falcon Technologies Portal Access & Security</p>
            </div>
          </div>
          <div class="nav-actions">
            <a routerLink="/dashboard" class="btn-outline">📊 Dashboard</a>
            <a routerLink="/leads" class="btn-outline">👥 Leads</a>
            <a routerLink="/conversations" class="btn-outline">💬 Conversations</a>
            <a routerLink="/users" class="btn-outline active">👤 Users</a>
            <a routerLink="/" class="btn-outline">Website</a>
            <button class="btn-logout" (click)="logout()" title="Sign out of Admin Portal">🚪 Logout</button>
          </div>
        </div>
      </header>

      <main class="users-content">
        <!-- Notification Banners -->
        @if (successMessage()) {
          <div class="alert alert-success">
            <span>{{ successMessage() }}</span>
            <button class="btn-close" (click)="successMessage.set(null)">✕</button>
          </div>
        }

        @if (errorMessage()) {
          <div class="alert alert-error">
            <span>{{ errorMessage() }}</span>
            <button class="btn-close" (click)="errorMessage.set(null)">✕</button>
          </div>
        }

        <!-- Stats Overview Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-info">
              <span class="stat-label">Total Users</span>
              <span class="stat-value">{{ users().length }}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon active-icon">🟢</div>
            <div class="stat-info">
              <span class="stat-label">Active Accounts</span>
              <span class="stat-value">{{ activeCount() }}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon role-icon">🛡️</div>
            <div class="stat-info">
              <span class="stat-label">Administrators</span>
              <span class="stat-value">{{ adminCount() }}</span>
            </div>
          </div>
        </div>

        <!-- Action Toolbar -->
        <div class="toolbar">
          <div class="search-filter-group">
            <div class="search-box">
              <span class="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Search by name, username, or email..." 
                [(ngModel)]="searchQuery" 
              />
            </div>

            <div class="filter-dropdown">
              <select [(ngModel)]="selectedRole">
                <option value="">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>
          </div>

          <button class="btn-primary" (click)="openCreateModal()">
            <span class="btn-icon">➕</span> Add New User
          </button>
        </div>

        <!-- Users Table -->
        <div class="table-container">
          @if (loading()) {
            <div class="loading-state">
              <div class="spinner"></div>
              <p>Loading admin users...</p>
            </div>
          } @else if (filteredUsers().length === 0) {
            <div class="empty-state">
              <span class="empty-icon">👤</span>
              <h3>No users found</h3>
              <p>Try adjusting your search query or filter options.</p>
            </div>
          } @else {
            <table class="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Created Date</th>
                </tr>
              </thead>
              <tbody>
                @for (user of filteredUsers(); track user.adminUserId) {
                  <tr>
                    <td>
                      <div class="user-profile-cell">
                        <div class="avatar-circle">
                          {{ getInitials(user.displayName || user.username) }}
                        </div>
                        <div class="user-names">
                          <span class="display-name">{{ user.displayName }}</span>
                          <span class="username">&#64;{{ user.username }}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <a [href]="'mailto:' + user.email" class="email-link">{{ user.email }}</a>
                    </td>
                    <td>
                      <span class="role-badge" [class]="'role-' + user.role.toLowerCase()">
                        {{ user.role }}
                      </span>
                    </td>
                    <td>
                      <span class="status-badge" [class.status-active]="user.isActive" [class.status-inactive]="!user.isActive">
                        <span class="status-dot"></span>
                        {{ user.isActive ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                    <td>
                      <span class="date-text">{{ formatLoginDate(user.lastLoginDate) }}</span>
                    </td>
                    <td>
                      <span class="date-text">{{ formatDate(user.createdDate) }}</span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      </main>

      <!-- Create User Modal -->
      @if (showModal()) {
        <div class="modal-backdrop" (click)="closeModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>➕ Create New Admin User</h2>
              <button class="btn-close-modal" (click)="closeModal()">✕</button>
            </div>

            <form (ngSubmit)="submitCreateUser()" #userForm="ngForm">
              <div class="modal-body">
                @if (modalError()) {
                  <div class="modal-alert-error">
                    {{ modalError() }}
                  </div>
                }

                <div class="form-group">
                  <label for="displayName">Display Name *</label>
                  <input 
                    id="displayName" 
                    type="text" 
                    [(ngModel)]="newUser.displayName" 
                    name="displayName" 
                    required 
                    placeholder="e.g. Sarah Jenkins"
                  />
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="username">Username *</label>
                    <input 
                      id="username" 
                      type="text" 
                      [(ngModel)]="newUser.username" 
                      name="username" 
                      required 
                      minlength="3" 
                      placeholder="e.g. sarah"
                    />
                  </div>

                  <div class="form-group">
                    <label for="role">Role *</label>
                    <select id="role" [(ngModel)]="newUser.role" name="role">
                      <option value="Admin">Admin</option>
                      <option value="Manager">Manager</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                  </div>
                </div>

                <div class="form-group">
                  <label for="email">Email Address *</label>
                  <input 
                    id="email" 
                    type="email" 
                    [(ngModel)]="newUser.email" 
                    name="email" 
                    required 
                    placeholder="e.g. sarah@apexfalcon.com"
                  />
                </div>

                <div class="form-group">
                  <label for="password">Password * (Min 8 characters)</label>
                  <div class="password-input-wrap">
                    <input 
                      id="password" 
                      [type]="showPassword ? 'text' : 'password'" 
                      [(ngModel)]="newUser.password" 
                      name="password" 
                      required 
                      minlength="8" 
                      placeholder="Create a strong password..."
                    />
                    <button type="button" class="btn-toggle-pwd" (click)="showPassword = !showPassword">
                      {{ showPassword ? '🙈' : '👁️' }}
                    </button>
                  </div>
                </div>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn-secondary" (click)="closeModal()" [disabled]="isSubmitting()">
                  Cancel
                </button>
                <button type="submit" class="btn-primary" [disabled]="isSubmitting() || !userForm.form.valid">
                  @if (isSubmitting()) {
                    <span class="mini-spinner"></span> Creating...
                  } @else {
                    Create User
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .users-page {
      min-height: 100vh;
      background: #0f172a;
      color: #e2e8f0;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    }

    .dash-header {
      background: #1e293b;
      border-bottom: 1px solid #334155;
      padding: 1.25rem 2rem;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .header-container {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 1rem;

      .logo {
        font-size: 2.25rem;
      }

      h1 {
        font-size: 1.35rem;
        font-weight: 700;
        color: #f8fafc;
        margin: 0;
      }

      p {
        font-size: 0.85rem;
        color: #94a3b8;
        margin: 0.15rem 0 0;
      }
    }

    .nav-actions {
      display: flex;
      gap: 0.6rem;
      align-items: center;
    }

    .btn-outline {
      padding: 0.5rem 0.9rem;
      border-radius: 6px;
      border: 1px solid #475569;
      background: transparent;
      color: #cbd5e1;
      font-size: 0.85rem;
      text-decoration: none;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;

      &:hover {
        background: #334155;
        color: #f8fafc;
      }

      &.active {
        background: #0284c7;
        border-color: #0284c7;
        color: #ffffff;
        font-weight: 600;
      }
    }

    .btn-logout {
      padding: 0.5rem 0.9rem;
      border-radius: 6px;
      border: 1px solid #dc2626;
      background: rgba(220, 38, 38, 0.1);
      color: #fca5a5;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: #dc2626;
        color: #ffffff;
      }
    }

    .users-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    /* Alerts */
    .alert {
      padding: 0.9rem 1.25rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.9rem;
    }

    .alert-success {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
    }

    .alert-error {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #f87171;
    }

    .btn-close {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      font-size: 1.1rem;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 10px;
      padding: 1.25rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .stat-icon {
      font-size: 2rem;
      width: 52px;
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0f172a;
      border-radius: 10px;
      border: 1px solid #334155;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-label {
      font-size: 0.8rem;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
    }

    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: #f8fafc;
    }

    /* Toolbar */
    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .search-filter-group {
      display: flex;
      gap: 0.75rem;
      flex: 1;
      max-width: 600px;
    }

    .search-box {
      position: relative;
      flex: 1;

      .search-icon {
        position: absolute;
        left: 0.9rem;
        top: 50%;
        transform: translateY(-50%);
        font-size: 0.85rem;
        color: #64748b;
      }

      input {
        width: 100%;
        box-sizing: border-box;
        padding: 0.65rem 1rem 0.65rem 2.4rem;
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 8px;
        color: #f8fafc;
        font-size: 0.85rem;

        &:focus {
          outline: none;
          border-color: #0284c7;
          box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.2);
        }
      }
    }

    .filter-dropdown select {
      padding: 0.65rem 1rem;
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 8px;
      color: #f8fafc;
      font-size: 0.85rem;
      cursor: pointer;

      &:focus {
        outline: none;
        border-color: #0284c7;
      }
    }

    .btn-primary {
      padding: 0.65rem 1.25rem;
      background: #0284c7;
      border: 1px solid #0284c7;
      border-radius: 8px;
      color: #ffffff;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s ease;

      &:hover:not(:disabled) {
        background: #0369a1;
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    /* Table */
    .table-container {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 10px;
      overflow: hidden;
    }

    .users-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.875rem;

      th {
        background: #0f172a;
        padding: 1rem 1.25rem;
        color: #94a3b8;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border-bottom: 1px solid #334155;
      }

      td {
        padding: 1rem 1.25rem;
        border-bottom: 1px solid #334155;
        vertical-align: middle;
      }

      tbody tr:hover {
        background: rgba(51, 65, 85, 0.4);
      }
    }

    .user-profile-cell {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .avatar-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0284c7, #6366f1);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.9rem;
      letter-spacing: 0.05em;
    }

    .user-names {
      display: flex;
      flex-direction: column;

      .display-name {
        font-weight: 600;
        color: #f8fafc;
      }

      .username {
        font-size: 0.75rem;
        color: #94a3b8;
      }
    }

    .email-link {
      color: #38bdf8;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }

    .role-badge {
      display: inline-block;
      padding: 0.25rem 0.65rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;

      &.role-admin {
        background: rgba(147, 51, 234, 0.2);
        color: #c084fc;
        border: 1px solid rgba(147, 51, 234, 0.4);
      }

      &.role-manager {
        background: rgba(2, 132, 199, 0.2);
        color: #38bdf8;
        border: 1px solid rgba(2, 132, 199, 0.4);
      }

      &.role-viewer {
        background: rgba(100, 116, 139, 0.2);
        color: #cbd5e1;
        border: 1px solid rgba(100, 116, 139, 0.4);
      }
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.8rem;
      font-weight: 500;

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }

      &.status-active {
        color: #34d399;
        .status-dot { background: #10b981; }
      }

      &.status-inactive {
        color: #94a3b8;
        .status-dot { background: #64748b; }
      }
    }

    .date-text {
      color: #94a3b8;
      font-size: 0.8rem;
    }

    .loading-state, .empty-state {
      padding: 4rem 2rem;
      text-align: center;
      color: #94a3b8;
    }

    .empty-icon {
      font-size: 3rem;
      display: block;
      margin-bottom: 0.75rem;
    }

    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid #334155;
      border-top-color: #0284c7;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 1rem;
    }

    .mini-spinner {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 2px solid #ffffff;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Modal */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      padding: 1.5rem;
    }

    .modal-content {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      width: 100%;
      max-width: 520px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }

    .modal-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #334155;
      display: flex;
      justify-content: space-between;
      align-items: center;

      h2 {
        font-size: 1.15rem;
        font-weight: 700;
        color: #f8fafc;
        margin: 0;
      }
    }

    .btn-close-modal {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 1.25rem;
      cursor: pointer;

      &:hover { color: #f8fafc; }
    }

    .modal-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .modal-alert-error {
      padding: 0.75rem 1rem;
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 6px;
      color: #f87171;
      font-size: 0.85rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;

      label {
        font-size: 0.8rem;
        font-weight: 600;
        color: #cbd5e1;
      }

      input, select {
        padding: 0.65rem 0.85rem;
        background: #0f172a;
        border: 1px solid #334155;
        border-radius: 6px;
        color: #f8fafc;
        font-size: 0.85rem;

        &:focus {
          outline: none;
          border-color: #0284c7;
        }
      }
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .password-input-wrap {
      position: relative;

      input {
        width: 100%;
        box-sizing: border-box;
        padding-right: 2.5rem;
      }

      .btn-toggle-pwd {
        position: absolute;
        right: 0.6rem;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1rem;
        padding: 0.2rem;
      }
    }

    .modal-footer {
      padding: 1.25rem 1.5rem;
      border-top: 1px solid #334155;
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }

    .btn-secondary {
      padding: 0.65rem 1.25rem;
      background: transparent;
      border: 1px solid #475569;
      border-radius: 8px;
      color: #cbd5e1;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;

      &:hover:not(:disabled) {
        background: #334155;
      }
    }
  `]
})
export class UsersComponent implements OnInit {
  private readonly authService = inject(AuthService);

  readonly users = signal<AdminUserDetail[]>([]);
  readonly loading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  searchQuery = '';
  selectedRole = '';

  showModal = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  modalError = signal<string | null>(null);
  showPassword = false;

  newUser: CreateAdminUserRequest = {
    username: '',
    email: '',
    password: '',
    displayName: '',
    role: 'Admin'
  };

  readonly activeCount = computed(() => this.users().filter(u => u.isActive).length);
  readonly adminCount = computed(() => this.users().filter(u => u.role.toLowerCase() === 'admin').length);

  readonly filteredUsers = computed(() => {
    const q = this.searchQuery.trim().toLowerCase();
    const role = this.selectedRole.trim().toLowerCase();

    return this.users().filter(u => {
      const matchesSearch = !q ||
        u.username.toLowerCase().includes(q) ||
        u.displayName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);

      const matchesRole = !role || u.role.toLowerCase() === role;

      return matchesSearch && matchesRole;
    });
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.getUsers().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.users.set(res.data);
        } else {
          this.errorMessage.set(res.message || 'Failed to load admin users.');
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Error connecting to API server.');
        this.loading.set(false);
      }
    });
  }

  openCreateModal(): void {
    this.newUser = {
      username: '',
      email: '',
      password: '',
      displayName: '',
      role: 'Admin'
    };
    this.modalError.set(null);
    this.showPassword = false;
    this.showModal.set(true);
  }

  closeModal(): void {
    if (this.isSubmitting()) return;
    this.showModal.set(false);
    this.modalError.set(null);
  }

  submitCreateUser(): void {
    this.modalError.set(null);

    if (!this.newUser.username || !this.newUser.email || !this.newUser.password || !this.newUser.displayName) {
      this.modalError.set('Please complete all required fields.');
      return;
    }

    if (this.newUser.password.length < 8) {
      this.modalError.set('Password must be at least 8 characters long.');
      return;
    }

    this.isSubmitting.set(true);

    this.authService.createUser(this.newUser).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.success && res.data) {
          this.showModal.set(false);
          this.successMessage.set(`User '${res.data.displayName}' created successfully!`);
          this.loadUsers();
        } else {
          this.modalError.set(res.message || 'Failed to create user.');
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.modalError.set(err.error?.message || 'Failed to create user. Please try again.');
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  formatLoginDate(dateStr?: string): string {
    if (!dateStr) return 'Never logged in';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return dateStr;
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  }
}
