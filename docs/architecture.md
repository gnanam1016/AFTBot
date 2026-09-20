# AFTBot Architecture Documentation

## 1. System Overview

**AFTBot** is an AI-powered website visitor engagement, lead collection, and lead qualification system designed for **Apex Falcon Technologies**. Rather than serving as an open-ended conversational bot, AFTBot is intentionally engineered to:
- Welcome visitors to the Apex Falcon Technologies website (`https://apexfalcontechnologies.com`).
- Progressively and conversationally collect visitor contact details (Name, Mobile, Email).
- Detect and validate the visitor's purpose of visit (Software / Product Enquiry, Training, Internship, Software Development, AI / IoT Solutions, School / College Solutions, Other).
- Ask purpose-tailored qualification questions (technologies, timelines, organization type, budget, student/professional).
- Prompt for contact consent ("Yes, contact me" vs "I'll contact you later").
- Calculate a configurable lead score (0–100) and assign priority (Low, Medium, High).
- Persist visitors, chat sessions, message transcripts, and qualified leads into Microsoft SQL Server.
- Present a real-time Admin Lead Management & Analytics Dashboard, Lead Dossier, and Conversation Transcript Explorer.

---

## 2. High-Level Architecture Diagram

```
                 Visitor (Browser)
                        │
                        ▼
      ┌────────────────────────────────────┐
      │  Existing Apex Falcon Website      │
      │  https://apexfalcontechnologies.com│
      │   (Embeds AFTBot via iframe/script)│
      └─────────────────┬──────────────────┘
                        │
                        ▼
      ┌────────────────────────────────────┐
      │      AFTBot.Web (UI Host)          │
      │  - Angular 21 (Standalone SPA)     │
      │  - Embedded Widget (/widget)       │
      │  - Admin Dashboard (/dashboard)    │
      │  - Lead Management (/leads)        │
      │  - Conversations (/conversations)  │
      └─────────────────┬──────────────────┘
                        │ HTTP / REST (JSON with CORS & CSP)
                        ▼
      ┌────────────────────────────────────┐
      │      AFTBot.Api (API Host)         │
      │  - ASP.NET Core 10 Web API         │
      │  - Security Headers & CSP          │
      │  - Rate Limiting (Fixed Window)    │
      │  - Request Logging & Diagnostics   │
      │  - Health Checks (/health)         │
      │  - Azure OpenAI 2.1.0 JSON Mode    │
      │  - Dynamic Qualification Engine    │
      │  - Lead Scoring Service            │
      │  - Dapper Data Access Layer        │
      └─────────────────┬──────────────────┘
                        │ Dapper (Parameterized Stored Procedures)
                        ▼
      ┌────────────────────────────────────┐
      │     Microsoft SQL Server           │
      │  - Database: AFTBotDb              │
      │  - Tables: Visitors, ChatSessions, │
      │    ChatMessages, Leads, LeadDetails│
      │  - 11 Stored Procedures & Views    │
      └────────────────────────────────────┘
```

---

## 3. Technology Stack & Design Decisions

### Frontend (`AFTBot.Web`)
- **Framework**: Angular 21 with Standalone Components (no legacy NgModules).
- **State Management**: Angular Signals (`signal`, `computed`, `effect`) for reactive chat state, message streams, and typing indicators.
- **Routing**: Angular Router with lazy loading for `/dashboard`, `/leads`, `/leads/:id`, and `/conversations`.
- **Embedding & Dynamic Resizing**:
  - `/widget` route renders exclusively the chat widget against a transparent background.
  - `aftbot-embed.js` provides drop-in embedding on `https://apexfalcontechnologies.com`.
  - Communicates open/closed state via `window.parent.postMessage({ type: 'AFTBOT_STATE_CHANGED', isOpen })` so the parent container dynamically resizes between `100px x 100px` (collapsed button) and `440px x 660px` (expanded window), preventing obstruction of the parent website.
- **Session Persistence**: Anonymous visitor `sessionId` generated in `localStorage` ensuring conversational continuity across page reloads without requiring user authentication.
- **Styling**: SCSS with custom modern Apex Falcon branding (Deep Navy `#0f172a`, Royal Blue `#2563eb`, Emerald `#10b981`).

### Backend (`AFTBot.Api`)
- **Framework**: ASP.NET Core Web API on .NET 10.
- **Data Access**: **Dapper** with `Microsoft.Data.SqlClient`. No Entity Framework Core or EF migrations are used.
- **Architecture Pattern**: Clean Layered Architecture:
  `Controller -> Service -> Repository -> Connection Factory -> Stored Procedure`.
- **Global Error Handling**: Custom `GlobalExceptionMiddleware` returning uniform `ApiResponse<T>`.
- **CORS**: Dynamic origin whitelist configured for `https://apexfalcontechnologies.com`, `https://www.apexfalcontechnologies.com`, and development origins.
- **OpenAPI**: Swagger/OpenAPI documentation enabled for development.

### Database (`AFTBotDb`)
- **Engine**: Microsoft SQL Server.
- **Scripts Separation**: All DDL, DML, Indexes, Stored Procedures, and Seed data are maintained in the `Database/` directory completely separated from C# source code.
- **Execution Safety**: All procedures use `SET ANSI_NULLS ON` and `SET QUOTED_IDENTIFIER ON` for compatibility with filtered indexes.
- **Data Integrity**: Foreign key constraints with cascading deletes where appropriate (`ChatMessages` to `ChatSessions`).

---

## 4. Security Architecture & Hardening

### 1. HTTP Security Headers
Every HTTP response from `AFTBot.Api` includes strict security headers attached by `SecurityHeadersMiddleware`:
- `X-Content-Type-Options: nosniff` – Prevents MIME-sniffing.
- `X-XSS-Protection: 1; mode=block` – Activates legacy browser XSS filters.
- `Referrer-Policy: strict-origin-when-cross-origin` – Protects referrer leaks.
- `Content-Security-Policy`:
  `frame-ancestors 'self' https://apexfalcontechnologies.com https://www.apexfalcontechnologies.com http://localhost:4200;`
  Enforces that the chat widget can **only** be embedded within the verified Apex Falcon Technologies website or local development hosts, preventing clickjacking attacks.

### 2. Rate Limiting (Anti-Abuse Protection)
Using ASP.NET Core's built-in `System.Threading.RateLimiting`:
- **Chat Endpoint (`/api/chat/message`)**: 60 requests per minute per IP.
- **Session Endpoint (`/api/chat/session`)**: 20 requests per minute per IP (prevents session creation floods).
- Rejection returns HTTP 429 with standard envelope:
  ```json
  {
    "success": false,
    "message": "Too many requests. Please slow down and try again later.",
    "data": null,
    "errors": []
  }
  ```

### 3. Input Sanitization & Anti-XSS
- Visitor inputs are stripped of HTML/script tags before storage or processing (`AiResponseValidator`).
- Parameterized SQL / Dapper ensures immunity to SQL injection.

### 4. AI Resilience & Offline Fallback
- If Azure OpenAI is unconfigured or experiences latency, `AiChatService` automatically falls back to `QualificationFlowService` (domain state-machine) without interrupting the visitor's conversation.

---

## 5. Monitoring, Diagnostics & Health Checks

### 1. Health Checks
- **Probe Endpoint**: `GET /health` – Used by Docker, Kubernetes, or load balancers. Returns `Healthy` (HTTP 200) when SQL Server connectivity is active.
- **Detailed REST Diagnostics**: `GET /api/health` – Returns service uptime, environment, timestamp, and database response time in milliseconds.

### 2. Request Logging & Correlation
- `RequestLoggingMiddleware` assigns a unique `X-Correlation-ID` to every HTTP request/response.
- Logs incoming requests with method, path, remote IP, and logs completion status and elapsed milliseconds.

---

## 6. Lead Scoring Mechanism

Lead scores are calculated using a configurable scoring model defined in `appsettings.json`:

| Criterion | Points | Description |
|---|---|---|
| **Mobile Provided** | +20 | Valid phone number provided (>= 7 digits) |
| **Email Provided** | +10 | Valid email format containing `@` |
| **Clear Requirement** | +20 | Detailed project or enquiry requirement provided (> 10 characters) |
| **Specific Product Selected** | +15 | Product or course identified |
| **Timeline Provided** | +15 | Specific timeline, duration, or start date indicated |
| **Contact Requested** | +20 | Visitor explicitly selected "Yes, contact me" |
| **Maximum Total** | **100** | Capped at 100 points |

### Priority Tiers
- **Low**: 0 – 39 points
- **Medium**: 40 – 69 points
- **High**: 70 – 100 points
