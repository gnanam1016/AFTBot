SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- =============================================
-- Stored Procedure: sp_GetLeads
-- Description: Retrieves paginated and filtered leads for Admin Dashboard
-- =============================================

CREATE OR ALTER PROCEDURE [dbo].[sp_GetLeads]
    @Purpose        NVARCHAR(100) = NULL,
    @Status         VARCHAR(50) = NULL,
    @Priority       VARCHAR(20) = NULL,
    @Product        NVARCHAR(200) = NULL,
    @StartDate      DATETIME2(7) = NULL,
    @EndDate        DATETIME2(7) = NULL,
    @SearchTerm     NVARCHAR(100) = NULL,
    @PageNumber     INT = 1,
    @PageSize       INT = 20
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;

    -- Total count query
    SELECT COUNT(1) AS [TotalCount]
    FROM [dbo].[Leads] l
    WHERE (@Purpose IS NULL OR l.[Purpose] = @Purpose)
      AND (@Status IS NULL OR l.[LeadStatus] = @Status)
      AND (@Priority IS NULL OR l.[LeadPriority] = @Priority)
      AND (@Product IS NULL OR l.[InterestedProduct] LIKE '%' + @Product + '%')
      AND (@StartDate IS NULL OR l.[CreatedDate] >= @StartDate)
      AND (@EndDate IS NULL OR l.[CreatedDate] <= @EndDate)
      AND (@SearchTerm IS NULL OR (
            l.[Name] LIKE '%' + @SearchTerm + '%'
         OR l.[Mobile] LIKE '%' + @SearchTerm + '%'
         OR l.[Email] LIKE '%' + @SearchTerm + '%'
         OR l.[Requirement] LIKE '%' + @SearchTerm + '%'
      ));

    -- Paged data query
    SELECT 
        l.[LeadId],
        l.[VisitorId],
        l.[ChatSessionId],
        l.[Name],
        l.[Mobile],
        l.[Email],
        l.[Purpose],
        l.[InterestedProduct],
        l.[OrganizationType],
        l.[Requirement],
        l.[AdditionalDetails],
        l.[LeadScore],
        l.[LeadPriority],
        l.[ContactRequested],
        l.[LeadStatus],
        l.[CreatedDate],
        l.[UpdatedDate]
    FROM [dbo].[Leads] l
    WHERE (@Purpose IS NULL OR l.[Purpose] = @Purpose)
      AND (@Status IS NULL OR l.[LeadStatus] = @Status)
      AND (@Priority IS NULL OR l.[LeadPriority] = @Priority)
      AND (@Product IS NULL OR l.[InterestedProduct] LIKE '%' + @Product + '%')
      AND (@StartDate IS NULL OR l.[CreatedDate] >= @StartDate)
      AND (@EndDate IS NULL OR l.[CreatedDate] <= @EndDate)
      AND (@SearchTerm IS NULL OR (
            l.[Name] LIKE '%' + @SearchTerm + '%'
         OR l.[Mobile] LIKE '%' + @SearchTerm + '%'
         OR l.[Email] LIKE '%' + @SearchTerm + '%'
         OR l.[Requirement] LIKE '%' + @SearchTerm + '%'
      ))
    ORDER BY l.[CreatedDate] DESC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO

