# AFTBot Database Setup & Execution Order

All database scripts are maintained strictly outside C# source code. No Entity Framework Core or EF migrations are used.

## Script Execution Order

Run the scripts in the following exact sequence:

1. **Database Creation**:
   - `00_CreateDatabase.sql`
2. **Tables** (in dependency order):
   - `Tables/01_Visitors.sql`
   - `Tables/02_ChatSessions.sql`
   - `Tables/03_ChatMessages.sql`
   - `Tables/04_Leads.sql`
   - `Tables/05_LeadDetails.sql`
3. **Indexes**:
   - `Indexes/01_Indexes.sql`
4. **Stored Procedures**:
   - `StoredProcedures/01_sp_CreateVisitor.sql`
   - `StoredProcedures/02_sp_GetVisitorBySession.sql`
   - `StoredProcedures/03_sp_CreateChatSession.sql`
   - `StoredProcedures/04_sp_AddChatMessage.sql`
   - `StoredProcedures/05_sp_GetChatMessages.sql`
   - `StoredProcedures/06_sp_CreateLead.sql`
   - `StoredProcedures/07_sp_UpdateLead.sql`
   - `StoredProcedures/08_sp_GetLeadById.sql`
   - `StoredProcedures/09_sp_GetLeads.sql`
   - `StoredProcedures/10_sp_UpdateLeadStatus.sql`
   - `StoredProcedures/11_sp_GetDashboardSummary.sql`
5. **Views**:
   - `Views/01_vw_LeadSummaries.sql`
6. **Seed Data** (Optional for development):
   - `Seed/01_SeedData.sql`

## Running via Command Line (PowerShell)

```powershell
# Execute all scripts against localhost MSSQLSERVER
$server = "localhost"
$db = "AFTBotDb"

sqlcmd -S $server -E -i "Database\00_CreateDatabase.sql"
sqlcmd -S $server -d $db -E -i "Database\Tables\01_Visitors.sql"
sqlcmd -S $server -d $db -E -i "Database\Tables\02_ChatSessions.sql"
sqlcmd -S $server -d $db -E -i "Database\Tables\03_ChatMessages.sql"
sqlcmd -S $server -d $db -E -i "Database\Tables\04_Leads.sql"
sqlcmd -S $server -d $db -E -i "Database\Tables\05_LeadDetails.sql"
sqlcmd -S $server -d $db -E -i "Database\Indexes\01_Indexes.sql"

Get-ChildItem "Database\StoredProcedures\*.sql" | ForEach-Object {
    sqlcmd -S $server -d $db -E -i $_.FullName
}

sqlcmd -S $server -d $db -E -i "Database\Views\01_vw_LeadSummaries.sql"
sqlcmd -S $server -d $db -E -i "Database\Seed\01_SeedData.sql"
```
