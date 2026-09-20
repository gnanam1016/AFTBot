# AFTBot API Documentation

Base URL: `http://localhost:5000/api` (Development) / `https://<YOUR_API_HOST>/api` (Production)

All API endpoints return responses using the standardized envelope:
```json
{
  "success": true,
  "message": null,
  "data": { ... },
  "errors": []
}
```

---

## 1. Security & Rate Limiting

### Security Headers
Every response includes:
- `X-Correlation-ID`: Unique GUID for request tracking across logs.
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy`: `frame-ancestors 'self' https://apexfalcontechnologies.com https://www.apexfalcontechnologies.com http://localhost:4200;`

### Rate Limits
| Endpoint | Limit | Window | Status on Exceeded |
|---|---|---|---|
| `POST /api/chat/message` | 60 requests / IP | 1 minute | HTTP 429 Too Many Requests |
| `POST /api/chat/session` | 20 requests / IP | 1 minute | HTTP 429 Too Many Requests |

---

## 2. Health & Diagnostic Endpoints

### `GET /health`
Basic health probe for load balancers and container orchestrators.
- **Response (`200 OK`)**: `Healthy`

### `GET /api/health`
Detailed JSON diagnostic status.
- **Response (`200 OK`)**:
```json
{
  "success": true,
  "message": null,
  "data": {
    "status": "Healthy",
    "service": "AFTBot.Api",
    "environment": "Production",
    "version": "1.0.0",
    "uptime": "02:15:30.1234567",
    "timestamp": "2026-09-20T05:35:22.859Z",
    "database": {
      "status": "Healthy",
      "details": "SQL Server connection successful.",
      "responseTimeMs": 7
    }
  },
  "errors": []
}
```

---

## 3. Chat Endpoints

### `POST /api/chat/session`
Initializes or resumes a chat session for a visitor.

- **Rate Limit**: 20 requests / minute
- **Request Body**:
```json
{
  "sessionId": "aft-9a8b7c6d-1234-4567-89ab-cdef01234567",
  "name": "David Miller",
  "mobile": "+1-555-0922",
  "email": "david@example.com",
  "userAgent": "Mozilla/5.0..."
}
```

- **Response (`200 OK`)**:
```json
{
  "success": true,
  "message": null,
  "data": {
    "chatSessionId": 3,
    "sessionId": "aft-9a8b7c6d-1234-4567-89ab-cdef01234567",
    "visitorId": 3,
    "status": "Active",
    "purpose": null,
    "leadId": null,
    "startedDate": "2026-09-20T04:37:29.768Z",
    "messages": [
      {
        "chatMessageId": 11,
        "chatSessionId": 3,
        "senderType": "Bot",
        "message": "Hi! Welcome to Apex Falcon Technologies 👋\n\nI'm AFTBot, your virtual assistant...",
        "messageType": "Text",
        "createdDate": "2026-09-20T04:37:29.801Z",
        "quickReplies": null
      }
    ],
    "suggestedReplies": []
  },
  "errors": []
}
```

---

### `POST /api/chat/message`
Sends a visitor message, processes conversational lead qualification, and returns the bot's reply.

- **Rate Limit**: 60 requests / minute
- **Request Body**:
```json
{
  "sessionId": "aft-9a8b7c6d-1234-4567-89ab-cdef01234567",
  "message": "Software Development"
}
```

- **Response (`200 OK`)**:
```json
{
  "success": true,
  "message": null,
  "data": {
    "chatMessageId": 15,
    "chatSessionId": 3,
    "senderType": "Bot",
    "message": "Excellent! Tell us a bit about your project requirement, technology preferences, and expected timeline.",
    "messageType": "QuickReply",
    "createdDate": "2026-09-20T04:38:10.123Z",
    "quickReplies": [
      "Web Application",
      "Mobile App",
      "Enterprise Software",
      "Cloud Migration"
    ]
  },
  "errors": []
}
```

---

### `GET /api/chat/session/{sessionId}`
Retrieves session details and full conversation history by either string GUID (`aft-...`) or numeric `ChatSessionId`.

- **Response (`200 OK`)**:
Returns `ChatSessionResponseDto` containing all chronological messages in the session.

---

### `GET /api/chat/sessions`
Retrieves a list of recent chat sessions with summary details for the conversation explorer.

- **Query Parameters**:
  - `limit`: Number of sessions to return (default: `50`)

- **Response (`200 OK`)**:
```json
{
  "success": true,
  "message": null,
  "data": [
    {
      "chatSessionId": 9,
      "sessionId": "test-phase3-ai-iot-001",
      "visitorId": 9,
      "visitorName": "Michael Chang",
      "visitorMobile": "+1-555-0321",
      "visitorEmail": "michael.chang@innovate.io",
      "status": "Active",
      "purpose": "AI / IoT Solutions",
      "leadId": 8,
      "messageCount": 13,
      "startedDate": "2026-09-20T05:11:37.163Z",
      "lastActivityDate": "2026-09-20T05:11:37.554Z"
    }
  ],
  "errors": []
}
```

---

## 4. Visitor Endpoints

### `POST /api/visitors`
Registers or updates visitor metadata.

### `GET /api/visitors/{sessionId}`
Retrieves visitor details by session identifier.

---

## 5. Lead Endpoints

### `POST /api/leads`
Creates or updates a lead.

- **Request Body**:
```json
{
  "visitorId": 3,
  "chatSessionId": 3,
  "name": "David Miller",
  "mobile": "+1-555-0922",
  "email": "david@example.com",
  "purpose": "Software Development",
  "interestedProduct": "Custom Cloud App",
  "organizationType": "Enterprise",
  "requirement": "Cloud logistics platform within 4 months",
  "additionalDetails": "Budget: $50k",
  "contactRequested": true,
  "purposeSpecificDetails": {
    "ProjectScope": "Cloud Migration",
    "Timeline": "4 months"
  }
}
```

### `GET /api/leads`
Retrieves paginated and filtered leads.

- **Query Parameters**:
  - `purpose`: Filter by purpose (e.g. `Training`, `Internship`, `Software Development`, `AI / IoT Solutions`)
  - `status`: Filter by lead status (`New`, `Contacted`, `Qualified`, `DemoScheduled`, `Converted`, `Lost`, `Closed`)
  - `priority`: Filter by priority (`High`, `Medium`, `Low`)
  - `product`: Filter by product name
  - `startDate`: Filter by creation start date (`YYYY-MM-DD`)
  - `endDate`: Filter by creation end date (`YYYY-MM-DD`)
  - `searchTerm`: Free-text search across name, mobile, email, and requirement
  - `pageNumber`: Default `1`
  - `pageSize`: Default `25`

### `GET /api/leads/{id}`
Retrieves a single lead by ID, including custom questionnaire details (`details` array) and visitor metadata.

### `PUT /api/leads/{id}`
Updates full lead information.

### `PUT /api/leads/{id}/status`
Updates the status of a lead.
```json
{
  "leadStatus": "Qualified"
}
```

---

## 6. Dashboard Endpoints

### `GET /api/dashboard/summary`
Returns aggregate statistics for the admin dashboard:
- `totalLeads`
- `newLeads`
- `contactedLeads`
- `qualifiedLeads`
- `convertedLeads`
- `todayLeads`
- `highPriorityLeads`
- `contactRequestedCount`
- `purposeBreakdown` (count grouped by purpose)
