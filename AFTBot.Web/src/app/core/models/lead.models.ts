export interface Lead {
  leadId: number;
  visitorId: number;
  chatSessionId: number;
  name: string;
  mobile?: string;
  email?: string;
  purpose: string;
  interestedProduct?: string;
  organizationType?: string;
  requirement?: string;
  additionalDetails?: string;
  leadScore: number;
  leadPriority: 'Low' | 'Medium' | 'High';
  contactRequested: boolean;
  leadStatus: 'New' | 'Contacted' | 'Qualified' | 'DemoScheduled' | 'Converted' | 'Lost' | 'Closed';
  createdDate: string;
  updatedDate: string;
  ipAddress?: string;
  userAgent?: string;
  sessionStartedDate?: string;
  sessionStatus?: string;
  details?: LeadDetail[];
}

export interface LeadDetail {
  leadDetailId: number;
  leadId: number;
  fieldName: string;
  fieldValue: string;
  createdDate: string;
}

export interface LeadFilter {
  purpose?: string;
  status?: string;
  priority?: string;
  product?: string;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  pageNumber: number;
  pageSize: number;
}

export interface PagedResult<T> {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  items: T[];
}

export interface DashboardSummary {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  todayLeads: number;
  highPriorityLeads: number;
  contactRequestedCount: number;
  purposeBreakdown: { purpose: string; count: number }[];
}
