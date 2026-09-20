# AFTBot Database Documentation

Database: `AFTBotDb`  
RDBMS: Microsoft SQL Server  
Data Access: Dapper (C#) & Raw Parameterized SQL / Stored Procedures (NO Entity Framework Core)

---

## 1. Tables & Schema

### `Visitors`
Tracks individual website visitors.
| Column | Type | Nullable | Description |
|---|---|---|---|
| `VisitorId` | `BIGINT IDENTITY(1,1)` | No | Primary Key |
| `SessionId` | `VARCHAR(100)` | No | Unique anonymous session GUID |
| `Name` | `NVARCHAR(150)` | Yes | Visitor's full name |
| `Mobile` | `VARCHAR(30)` | Yes | Visitor's contact phone number |
| `Email` | `NVARCHAR(200)` | Yes | Visitor's email address |
| `IPAddress` | `VARCHAR(50)` | Yes | Client IP address |
| `UserAgent` | `NVARCHAR(500)` | Yes | Browser user agent |
| `CreatedDate` | `DATETIME2(7)` | No | Default UTC timestamp |
| `LastActivityDate` | `DATETIME2(7)` | No | Last activity timestamp |

### `ChatSessions`
Tracks chat engagement sessions.
| Column | Type | Nullable | Description |
|---|---|---|---|
| `ChatSessionId` | `BIGINT IDENTITY(1,1)` | No | Primary Key |
| `SessionId` | `VARCHAR(100)` | No | Visitor session identifier |
| `VisitorId` | `BIGINT` | No | FK to `Visitors(VisitorId)` |
| `Status` | `VARCHAR(50)` | No | Default `'Active'` (`Active`, `Completed`, `Abandoned`) |
| `Purpose` | `NVARCHAR(100)` | Yes | Purpose of visit |
| `LeadId` | `BIGINT` | Yes | FK to `Leads(LeadId)` |
| `StartedDate` | `DATETIME2(7)` | No | Session start UTC timestamp |
| `EndedDate` | `DATETIME2(7)` | Yes | Session end UTC timestamp |

### `ChatMessages`
Chronological conversation history.
| Column | Type | Nullable | Description |
|---|---|---|---|
| `ChatMessageId` | `BIGINT IDENTITY(1,1)` | No | Primary Key |
| `ChatSessionId` | `BIGINT` | No | FK to `ChatSessions(ChatSessionId)` (ON DELETE CASCADE) |
| `SenderType` | `VARCHAR(20)` | No | `'Visitor'`, `'Bot'`, or `'System'` |
| `Message` | `NVARCHAR(MAX)` | No | Message text content |
| `MessageType` | `VARCHAR(50)` | No | `'Text'`, `'QuickReply'`, or `'Structured'` |
| `Metadata` | `NVARCHAR(MAX)` | Yes | JSON payload for quick-reply options |
| `CreatedDate` | `DATETIME2(7)` | No | Message UTC timestamp |

### `Leads`
Qualified business leads generated from chat engagements.
| Column | Type | Nullable | Description |
|---|---|---|---|
| `LeadId` | `BIGINT IDENTITY(1,1)` | No | Primary Key |
| `VisitorId` | `BIGINT` | No | FK to `Visitors(VisitorId)` |
| `ChatSessionId` | `BIGINT` | No | FK to `ChatSessions(ChatSessionId)` |
| `Name` | `NVARCHAR(150)` | No | Lead full name |
| `Mobile` | `VARCHAR(30)` | Yes | Contact number |
| `Email` | `NVARCHAR(200)` | Yes | Contact email |
| `Purpose` | `NVARCHAR(100)` | No | Purpose of visit |
| `InterestedProduct` | `NVARCHAR(200)` | Yes | Selected product/course |
| `OrganizationType` | `NVARCHAR(100)` | Yes | Company / School / College / Student |
| `Requirement` | `NVARCHAR(MAX)` | Yes | Detailed requirement statement |
| `AdditionalDetails` | `NVARCHAR(MAX)` | Yes | Timeline, budget, or other notes |
| `LeadScore` | `INT` | No | Calculated score (0–100) |
| `LeadPriority` | `VARCHAR(20)` | No | `'Low'`, `'Medium'`, or `'High'` |
| `ContactRequested` | `BIT` | No | 1 if visitor requested callback, else 0 |
| `LeadStatus` | `VARCHAR(50)` | No | Default `'New'` (`Contacted`, `Qualified`, `DemoScheduled`, `Converted`, `Lost`, `Closed`) |
| `CreatedDate` | `DATETIME2(7)` | No | Record creation timestamp |
| `UpdatedDate` | `DATETIME2(7)` | No | Last update timestamp |

### `LeadDetails`
Flexible key-value store for purpose-specific custom attributes.
| Column | Type | Nullable | Description |
|---|---|---|---|
| `LeadDetailId` | `BIGINT IDENTITY(1,1)` | No | Primary Key |
| `LeadId` | `BIGINT` | No | FK to `Leads(LeadId)` (ON DELETE CASCADE) |
| `FieldName` | `NVARCHAR(100)` | No | Field name (e.g., `Course`, `Duration`, `Domain`) |
| `FieldValue` | `NVARCHAR(MAX)` | No | Value |
| `CreatedDate` | `DATETIME2(7)` | No | Creation timestamp |

---

## 2. Stored Procedures

| Procedure | Parameters | Description |
|---|---|---|
| `sp_CreateVisitor` | `@SessionId, @Name, @Mobile, @Email, @IPAddress, @UserAgent` | Inserts or updates visitor |
| `sp_GetVisitorBySession` | `@SessionId` | Retrieves visitor by session GUID |
| `sp_CreateChatSession` | `@SessionId, @VisitorId, @Purpose` | Starts or resumes active chat session |
| `sp_AddChatMessage` | `@ChatSessionId, @SenderType, @Message, @MessageType, @Metadata` | Appends message to chat |
| `sp_GetChatMessages` | `@ChatSessionId` | Retrieves ordered conversation history |
| `sp_CreateLead` | `@VisitorId, @ChatSessionId, @Name, @Mobile, @Email, @Purpose, ...` | Inserts or updates lead record |
| `sp_UpdateLead` | `@LeadId, @Name, @Mobile, @Email, @Purpose, ...` | Modifies lead details |
| `sp_GetLeadById` | `@LeadId` | Retrieves lead with visitor metadata & details |
| `sp_GetLeads` | `@Purpose, @Status, @Priority, @Product, @SearchTerm, @StartDate, @EndDate, @PageNumber, @PageSize` | Paginated & filtered query |
| `sp_UpdateLeadStatus` | `@LeadId, @LeadStatus` | Updates status (e.g. Converted, Closed) |
| `sp_GetDashboardSummary` | None | Aggregates KPI counts & purpose breakdown |

---

## 3. Database Maintenance & Performance

1. **Filtered Indexes & Quoted Identifiers**:
   All stored procedures are scripted with:
   ```sql
   SET ANSI_NULLS ON
   SET QUOTED_IDENTIFIER ON
   ```
   This ensures compatibility with filtered indexes (e.g. `IX_Visitors_Mobile_Filtered`, `IX_Visitors_Email_Filtered`).
2. **Index Optimization**:
   - `IX_ChatMessages_ChatSessionId_CreatedDate`: Clustered/composite index on `(ChatSessionId, CreatedDate ASC)` guarantees sub-millisecond retrieval of conversation histories.
   - `IX_Leads_LeadStatus_LeadPriority`: Speeds up dashboard KPI counts and status queries.
3. **Backup Recommendation**:
   - Regular transaction log backups every 15 minutes in production.
   - Daily full database backup.
