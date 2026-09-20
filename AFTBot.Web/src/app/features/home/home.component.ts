import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ChatService } from '../../core/services/chat.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="site-container">
      <!-- Top Navigation -->
      <header class="navbar">
        <div class="nav-content">
          <div class="brand">
            <span class="brand-logo">🦅</span>
            <div class="brand-text">
              <span class="brand-name">Apex Falcon</span>
              <span class="brand-tagline">Technologies</span>
            </div>
          </div>
          <nav class="nav-links">
            <a href="#solutions">Solutions</a>
            <a href="#products">Products</a>
            <a href="#training">Training</a>
            <a href="#internships">Internships</a>
            <a routerLink="/dashboard" class="admin-link">📊 Lead Dashboard</a>
            <button class="btn-talk" (click)="openChat()">Chat with Us</button>
          </nav>
        </div>
      </header>

      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <div class="hero-badge">
            <span class="pulse-dot"></span> Next-Gen AI & Enterprise Engineering
          </div>
          <h1 class="hero-title">
            Transforming Visions into <span class="gradient-text">Intelligent Technology</span>
          </h1>
          <p class="hero-desc">
            Apex Falcon Technologies specializes in enterprise software development, educational ERP solutions,
            cutting-edge AI/IoT systems, professional tech training, and immersive internship programs.
          </p>
          <div class="hero-actions">
            <button class="btn-primary" (click)="openChat()">
              <span>Enquire Now with AFTBot</span>
              <span class="arrow">→</span>
            </button>
            <a routerLink="/dashboard" class="btn-secondary">
              View Admin Dashboard
            </a>
          </div>
        </div>
      </section>

      <!-- Solutions Grid -->
      <section id="solutions" class="features-section">
        <div class="section-header">
          <h2>Our Core Capabilities</h2>
          <p>End-to-end technology solutions tailored for business scale and academic excellence.</p>
        </div>

        <div class="features-grid">
          <div class="feature-card" (click)="openChatWithPurpose('Software / Product Enquiry')">
            <div class="card-icon">💻</div>
            <h3>Software & Products</h3>
            <p>Custom software systems, SaaS architectures, enterprise CRM, and high-throughput web applications.</p>
            <span class="card-action">Ask AFTBot →</span>
          </div>

          <div class="feature-card" (click)="openChatWithPurpose('Training')">
            <div class="card-icon">🎓</div>
            <h3>Professional Training</h3>
            <p>Industry-aligned training programs in Full-Stack .NET, Angular, Cloud Architecture, AI & DevOps.</p>
            <span class="card-action">Explore Courses →</span>
          </div>

          <div class="feature-card" (click)="openChatWithPurpose('Internship')">
            <div class="card-icon">🚀</div>
            <h3>Tech Internships</h3>
            <p>Real-world hands-on internship programs for students and graduates to gain live project experience.</p>
            <span class="card-action">Apply via Bot →</span>
          </div>

          <div class="feature-card" (click)="openChatWithPurpose('AI / IoT Solutions')">
            <div class="card-icon">🤖</div>
            <h3>AI & IoT Solutions</h3>
            <p>Predictive analytics, automated computer vision, sensor telemetry, and smart edge IoT integration.</p>
            <span class="card-action">Consult AI Team →</span>
          </div>

          <div class="feature-card" (click)="openChatWithPurpose('School / College Solutions')">
            <div class="card-icon">🏫</div>
            <h3>Campus & School ERP</h3>
            <p>Comprehensive institutional management: student lifecycle, fee tracking, parent apps, and bus IoT.</p>
            <span class="card-action">Book Demo →</span>
          </div>

          <div class="feature-card" (click)="openChatWithPurpose('Software Development')">
            <div class="card-icon">⚡</div>
            <h3>Custom Engineering</h3>
            <p>Dedicated engineering teams delivering tailored web, mobile, and cloud software on predictable schedules.</p>
            <span class="card-action">Get Estimate →</span>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="site-footer">
        <div class="footer-content">
          <div class="footer-brand">
            <span class="footer-logo">🦅 Apex Falcon Technologies</span>
            <p>Empowering organizations and students through intelligent software & education.</p>
          </div>
          <div class="footer-copy">
            &copy; 2026 Apex Falcon Technologies. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .site-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: #f8fafc;
      color: #0f172a;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }

    .navbar {
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      position: sticky;
      top: 0;
      z-index: 100;

      .nav-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 16px 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 12px;

        .brand-logo {
          font-size: 28px;
        }

        .brand-text {
          display: flex;
          flex-direction: column;

          .brand-name {
            font-size: 18px;
            font-weight: 800;
            color: #0f172a;
            line-height: 1.1;
          }

          .brand-tagline {
            font-size: 12px;
            font-weight: 500;
            color: #2563eb;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
        }
      }

      .nav-links {
        display: flex;
        align-items: center;
        gap: 20px;

        a {
          text-decoration: none;
          color: #475569;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.2s;

          &:hover {
            color: #2563eb;
          }

          &.admin-link {
            color: #7c3aed;
            font-weight: 600;
            padding: 6px 12px;
            background: #f5f3ff;
            border-radius: 8px;

            &:hover {
              background: #ede9fe;
            }
          }
        }

        .btn-talk {
          background: #2563eb;
          color: #ffffff;
          border: none;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            background: #1d4ed8;
            transform: translateY(-1px);
          }
        }
      }
    }

    .hero-section {
      padding: 80px 24px 60px 24px;
      text-align: center;
      background: linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%);

      .hero-content {
        max-width: 800px;
        margin: 0 auto;
      }

      .hero-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: #e0f2fe;
        color: #0369a1;
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 24px;

        .pulse-dot {
          width: 8px;
          height: 8px;
          background: #0284c7;
          border-radius: 50%;
        }
      }

      .hero-title {
        font-size: 48px;
        font-weight: 800;
        line-height: 1.15;
        margin: 0 0 20px 0;
        color: #0f172a;

        .gradient-text {
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        @media (max-width: 768px) {
          font-size: 32px;
        }
      }

      .hero-desc {
        font-size: 18px;
        color: #64748b;
        line-height: 1.6;
        margin: 0 0 36px 0;
      }

      .hero-actions {
        display: flex;
        justify-content: center;
        gap: 16px;
        flex-wrap: wrap;

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #2563eb;
          color: #ffffff;
          border: none;
          padding: 14px 28px;
          border-radius: 30px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);

          &:hover {
            background: #1d4ed8;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
          }
        }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          text-decoration: none;
          background: #ffffff;
          color: #334155;
          border: 1px solid #cbd5e1;
          padding: 14px 24px;
          border-radius: 30px;
          font-size: 16px;
          font-weight: 600;
          transition: all 0.2s;

          &:hover {
            background: #f8fafc;
            border-color: #94a3b8;
          }
        }
      }
    }

    .features-section {
      max-width: 1200px;
      margin: 0 auto;
      padding: 60px 24px 80px 24px;
      flex: 1;

      .section-header {
        text-align: center;
        margin-bottom: 48px;

        h2 {
          font-size: 32px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 10px;
        }

        p {
          font-size: 16px;
          color: #64748b;
        }
      }

      .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 24px;

        .feature-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 28px;
          border: 1px solid #e2e8f0;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          flex-direction: column;

          &:hover {
            transform: translateY(-4px);
            border-color: #93c5fd;
            box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);

            .card-action {
              color: #1d4ed8;
              transform: translateX(4px);
            }
          }

          .card-icon {
            font-size: 36px;
            margin-bottom: 16px;
          }

          h3 {
            font-size: 20px;
            font-weight: 700;
            color: #0f172a;
            margin: 0 0 10px 0;
          }

          p {
            font-size: 14px;
            color: #64748b;
            line-height: 1.6;
            margin: 0 0 20px 0;
            flex: 1;
          }

          .card-action {
            font-size: 14px;
            font-weight: 600;
            color: #2563eb;
            display: inline-block;
            transition: transform 0.2s;
          }
        }
      }
    }

    .site-footer {
      background: #0f172a;
      color: #94a3b8;
      padding: 40px 24px;
      border-top: 1px solid #1e293b;

      .footer-content {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 20px;

        .footer-logo {
          font-size: 18px;
          font-weight: 700;
          color: #ffffff;
          display: block;
          margin-bottom: 6px;
        }

        p {
          margin: 0;
          font-size: 14px;
        }

        .footer-copy {
          font-size: 13px;
        }
      }
    }
  `]
})
export class HomeComponent {
  private readonly chatService = inject(ChatService);

  openChat(): void {
    this.chatService.openChat();
  }

  openChatWithPurpose(purpose: string): void {
    this.chatService.openChat();
    // After opening, if visitor clicks a card, we can auto-send or set context
  }
}
