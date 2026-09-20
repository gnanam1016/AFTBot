import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { SessionService } from './session.service';
import { ChatMessage, ChatSession } from '../models/chat.models';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly api = inject(ApiService);
  private readonly sessionService = inject(SessionService);

  // Signals for reactive state management
  readonly isOpen = signal<boolean>(false);
  readonly isTyping = signal<boolean>(false);
  readonly messages = signal<ChatMessage[]>([]);
  readonly suggestedReplies = signal<string[]>([]);
  readonly currentSession = signal<ChatSession | null>(null);
  readonly errorMessage = signal<string | null>(null);

  private isInitialized = false;

  toggleChat(): void {
    const nextState = !this.isOpen();
    this.isOpen.set(nextState);

    if (nextState && !this.isInitialized) {
      this.initializeChat();
    }
  }

  openChat(): void {
    this.isOpen.set(true);
    if (!this.isInitialized) {
      this.initializeChat();
    }
  }

  closeChat(): void {
    this.isOpen.set(false);
  }

  initializeChat(): void {
    const sessionId = this.sessionService.getSessionId();
    this.isTyping.set(true);
    this.errorMessage.set(null);

    this.api.initializeSession({
      sessionId,
      userAgent: navigator.userAgent
    }).subscribe({
      next: (res) => {
        this.isTyping.set(false);
        if (res.success && res.data) {
          this.currentSession.set(res.data);
          this.messages.set(res.data.messages || []);
          this.suggestedReplies.set(res.data.suggestedReplies || []);
          this.isInitialized = true;
        }
      },
      error: (err) => {
        this.isTyping.set(false);
        this.errorMessage.set('Could not connect to AFTBot assistant. Please try again.');
        console.error('Failed to initialize chat session:', err);
      }
    });
  }

  sendMessage(text: string): void {
    const trimmed = text.trim();
    if (!trimmed) return;

    const sessionId = this.sessionService.getSessionId();

    // Optimistically push visitor message
    const tempUserMsg: ChatMessage = {
      chatMessageId: Date.now(),
      chatSessionId: this.currentSession()?.chatSessionId ?? 0,
      senderType: 'Visitor',
      message: trimmed,
      messageType: 'Text',
      createdDate: new Date().toISOString()
    };

    this.messages.update(prev => [...prev, tempUserMsg]);
    this.suggestedReplies.set([]); // Clear quick replies while waiting
    this.isTyping.set(true);
    this.errorMessage.set(null);

    this.api.sendMessage({
      sessionId,
      message: trimmed
    }).subscribe({
      next: (res) => {
        this.isTyping.set(false);
        if (res.success && res.data) {
          this.messages.update(prev => [...prev, res.data!]);
          this.suggestedReplies.set(res.data.quickReplies || []);
        }
      },
      error: (err) => {
        this.isTyping.set(false);
        this.errorMessage.set('Failed to send message. Please check connection.');
        console.error('Error sending message:', err);
      }
    });
  }

  selectQuickReply(reply: string): void {
    this.sendMessage(reply);
  }

  startNewConversation(): void {
    this.sessionService.resetSession();
    this.messages.set([]);
    this.suggestedReplies.set([]);
    this.currentSession.set(null);
    this.isInitialized = false;
    this.initializeChat();
  }
}
