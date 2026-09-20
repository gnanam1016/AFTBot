import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="login-header">
          <span class="logo">🦅</span>
          <h1>AFTBot Admin Portal</h1>
          <p>Apex Falcon Technologies Lead Intelligence</p>
        </div>

        @if (errorMessage()) {
          <div class="error-alert">
            <span>⚠️ {{ errorMessage() }}</span>
          </div>
        }

        <form (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label for="username">Username or Email</label>
            <input 
              id="username"
              type="text" 
              [(ngModel)]="username" 
              name="username" 
              required 
              placeholder="admin@apexfalcon.com" 
              [disabled]="loading()" />
          </div>

          <div class="form-group">
            <div class="label-row">
              <label for="password">Password</label>
              <button type="button" class="btn-toggle-pw" (click)="showPassword.set(!showPassword())">
                {{ showPassword() ? 'Hide' : 'Show' }}
              </button>
            </div>
            <input 
              id="password"
              [type]="showPassword() ? 'text' : 'password'" 
              [(ngModel)]="password" 
              name="password" 
              required 
              placeholder="••••••••••••" 
              [disabled]="loading()" />
          </div>

          <button type="submit" class="btn-submit" [disabled]="loading() || !username || !password">
            {{ loading() ? 'Authenticating...' : 'Sign In to Portal →' }}
          </button>
        </form>

        <!-- Quick Demo Autofill for Easy Verification -->
        <div class="demo-box">
          <div class="demo-title">Default Admin Credentials:</div>
          <div class="demo-creds">
            <div>User: <code>admin@apexfalcon.com</code></div>
            <div>Pass: <code>ApexFalcon&#64;2026!</code></div>
          </div>
          <button type="button" class="btn-autofill" (click)="autofill()">
            Click to Autofill Demo Credentials
          </button>
        </div>

        <div class="login-footer">
          <a routerLink="/" class="back-link">← Return to Public Website</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      padding: 24px;
    }

    .login-card {
      background: #ffffff;
      border-radius: 16px;
      width: 100%;
      max-width: 420px;
      padding: 36px 32px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
    }

    .login-header {
      text-align: center;
      margin-bottom: 28px;

      .logo { font-size: 40px; display: block; margin-bottom: 8px; }
      h1 { margin: 0; font-size: 22px; font-weight: 700; color: #0f172a; }
      p { margin: 6px 0 0 0; font-size: 13px; color: #64748b; }
    }

    .error-alert {
      background: #fee2e2;
      border: 1px solid #fca5a5;
      color: #991b1b;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 13px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 18px;

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;

        label {
          font-size: 13px;
          font-weight: 600;
          color: #334155;
        }

        .label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .btn-toggle-pw {
            background: none;
            border: none;
            color: #2563eb;
            font-size: 12px;
            cursor: pointer;
            padding: 0;
            font-weight: 500;

            &:hover { text-decoration: underline; }
          }
        }

        input {
          padding: 10px 14px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s, box-shadow 0.2s;

          &:focus {
            outline: none;
            border-color: #2563eb;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
          }

          &:disabled {
            background: #f1f5f9;
            cursor: not-allowed;
          }
        }
      }

      .btn-submit {
        margin-top: 8px;
        background: #2563eb;
        color: #ffffff;
        border: none;
        padding: 12px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;

        &:hover:not(:disabled) {
          background: #1d4ed8;
        }

        &:disabled {
          background: #94a3b8;
          cursor: not-allowed;
        }
      }
    }

    .demo-box {
      margin-top: 24px;
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: 10px;
      padding: 14px;
      font-size: 12px;

      .demo-title {
        font-weight: 600;
        color: #475569;
        margin-bottom: 6px;
      }

      .demo-creds {
        color: #334155;
        margin-bottom: 10px;

        code {
          background: #e2e8f0;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
          color: #0f172a;
        }
      }

      .btn-autofill {
        width: 100%;
        background: #e0f2fe;
        color: #0369a1;
        border: 1px solid #bae6fd;
        padding: 6px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;

        &:hover {
          background: #bae6fd;
        }
      }
    }

    .login-footer {
      margin-top: 24px;
      text-align: center;

      .back-link {
        color: #64748b;
        text-decoration: none;
        font-size: 13px;

        &:hover {
          color: #0f172a;
          text-decoration: underline;
        }
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  username = '';
  password = '';
  readonly showPassword = signal<boolean>(false);
  readonly loading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  private returnUrl = '/dashboard';

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';
  }

  autofill(): void {
    this.username = 'admin@apexfalcon.com';
    this.password = 'ApexFalcon@2026!';
    this.errorMessage.set(null);
  }

  onSubmit(): void {
    if (!this.username || !this.password) return;

    this.loading.set(true);
    this.errorMessage.set(null);

    this.auth.login({
      username: this.username,
      password: this.password
    }).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          this.router.navigateByUrl(this.returnUrl);
        } else {
          this.errorMessage.set(res.message || 'Invalid username or password.');
        }
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 401) {
          this.errorMessage.set('Invalid username or password.');
        } else {
          this.errorMessage.set('Could not connect to authentication server. Please verify API is running.');
        }
      }
    });
  }
}
