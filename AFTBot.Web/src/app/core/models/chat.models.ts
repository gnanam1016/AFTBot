export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors: string[];
}

export interface ChatMessage {
  chatMessageId: number;
  chatSessionId: number;
  senderType: 'Visitor' | 'Bot' | 'System';
  message: string;
  messageType: 'Text' | 'QuickReply' | 'Structured';
  metadata?: string;
  createdDate: string;
  quickReplies?: string[];
}

export interface ChatSession {
  chatSessionId: number;
  sessionId: string;
  visitorId: number;
  status: string;
  purpose?: string;
  leadId?: number;
  startedDate: string;
  messages: ChatMessage[];
  suggestedReplies: string[];
}

export interface CreateSessionRequest {
  sessionId: string;
  name?: string;
  mobile?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface SendMessageRequest {
  sessionId: string;
  message: string;
  senderType?: string;
  messageType?: string;
  metadata?: string;
}

export interface ChatSessionSummary {
  chatSessionId: number;
  sessionId: string;
  visitorId: number;
  visitorName?: string;
  visitorMobile?: string;
  visitorEmail?: string;
  status: string;
  purpose?: string;
  leadId?: number;
  messageCount: number;
  startedDate: string;
  lastActivityDate?: string;
}
