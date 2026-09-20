import { Component, ElementRef, ViewChild, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChatService } from '../../../core/services/chat.service';
import { ChatMessageComponent } from '../chat-message/chat-message.component';
import { ChatQuickRepliesComponent } from '../chat-quick-replies/chat-quick-replies.component';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ChatMessageComponent,
    ChatQuickRepliesComponent
  ],
  template: `
    <!-- Floating Chat Trigger Button -->
    <div class="chat-widget-wrapper">
      @if (!chatService.isOpen()) {
        <button 
          class="chat-trigger-btn"
          (click)="chatService.toggleChat()"
          aria-label="Open Apex Falcon Chat">
          <div class="trigger-icon-container">
            <span class="falcon-badge">🦅</span>
            <span class="chat-icon">💬</span>
          </div>
          <span class="trigger-label">Chat with AFTBot</span>
          <span class="online-indicator"></span>
        </button>
      }

      <!-- Floating Chat Window -->
      @if (chatService.isOpen()) {
        <div class="chat-window shadow-xl">
          <!-- Chat Header -->
          <div class="chat-header">
            <div class="header-left">
              <div class="header-avatar">
                <span>🦅</span>
                <span class="status-dot"></span>
              </div>
              <div class="header-info">
                <h3 class="header-title">AFTBot</h3>
                <p class="header-subtitle">Apex Falcon Technologies</p>
              </div>
            </div>
            <div class="header-actions">
              <button 
                class="header-btn" 
                (click)="chatService.startNewConversation()" 
                title="Restart conversation"
                aria-label="Restart conversation">
                🔄
              </button>
              <button 
                class="header-btn close-btn" 
                (click)="chatService.closeChat()" 
                title="Close chat"
                aria-label="Close chat">
                ✕
              </button>
            </div>
          </div>

          <!-- Chat Body (Messages) -->
          <div class="chat-body" #scrollContainer>
            @if (chatService.errorMessage()) {
              <div class="error-banner">
                <span>⚠️ {{ chatService.errorMessage() }}</span>
              </div>
            }

            @for (msg of chatService.messages(); track msg.chatMessageId) {
              <app-chat-message [message]="msg"></app-chat-message>
            }

            <!-- Typing Indicator -->
            @if (chatService.isTyping()) {
              <div class="typing-indicator-row">
                <div class="avatar bot-avatar">
                  <span>🦅</span>
                </div>
                <div class="typing-bubble">
                  <span class="dot"></span>
                  <span class="dot"></span>
                  <span class="dot"></span>
                </div>
              </div>
            }

            <!-- Quick Replies -->
            @if (!chatService.isTyping() && chatService.suggestedReplies().length > 0) {
              <app-chat-quick-replies 
                [replies]="chatService.suggestedReplies()"
                (replySelected)="onQuickReplySelected($event)">
              </app-chat-quick-replies>
            }
          </div>

          <!-- Chat Footer (Input) -->
          <div class="chat-footer">
            <form (ngSubmit)="onSubmit()" class="input-form">
              <input 
                #messageInput
                type="text" 
                [formControl]="messageControl" 
                placeholder="Type your message..." 
                class="chat-input"
                (keydown.enter)="onEnterPress($event)"
                [disabled]="chatService.isTyping()" />
              
              <button 
                type="submit" 
                class="send-btn" 
                [disabled]="!messageControl.value?.trim() || chatService.isTyping()"
                aria-label="Send message">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </form>
            <div class="powered-by">
              Powered by <strong>Apex Falcon Technologies</strong>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .chat-widget-wrapper {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }

    .chat-trigger-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      background: linear-gradient(135deg, #0f172a, #1e3a8a);
      color: #ffffff;
      border: none;
      border-radius: 30px;
      padding: 12px 20px;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.35);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;

      &:hover {
        transform: translateY(-3px) scale(1.02);
        box-shadow: 0 12px 28px rgba(30, 58, 138, 0.45);
      }

      .trigger-icon-container {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 20px;
      }

      .trigger-label {
        font-size: 15px;
        font-weight: 600;
        letter-spacing: 0.2px;
      }

      .online-indicator {
        width: 10px;
        height: 10px;
        background: #22c55e;
        border-radius: 50%;
        border: 2px solid #ffffff;
        position: absolute;
        top: 6px;
        right: 8px;
        animation: pulse 2s infinite;
      }
    }

    .chat-window {
      width: 380px;
      height: 580px;
      max-height: calc(100vh - 48px);
      background: #ffffff;
      border-radius: 20px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 16px 40px rgba(15, 23, 42, 0.22);
      border: 1px solid rgba(226, 232, 240, 0.8);
      animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);

      @media (max-width: 480px) {
        width: 100vw;
        height: 100vh;
        max-height: 100vh;
        border-radius: 0;
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
      }
    }

    .chat-header {
      background: linear-gradient(135deg, #0f172a, #1e3a8a);
      color: #ffffff;
      padding: 16px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .header-left {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .header-avatar {
        width: 40px;
        height: 40px;
        background: rgba(255,255,255,0.15);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        position: relative;

        .status-dot {
          width: 10px;
          height: 10px;
          background: #22c55e;
          border-radius: 50%;
          border: 2px solid #0f172a;
          position: absolute;
          bottom: 0;
          right: 0;
        }
      }

      .header-info {
        .header-title {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
        }

        .header-subtitle {
          margin: 0;
          font-size: 12px;
          color: #93c5fd;
        }
      }

      .header-actions {
        display: flex;
        gap: 6px;

        .header-btn {
          background: rgba(255, 255, 255, 0.12);
          border: none;
          color: #ffffff;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s;

          &:hover {
            background: rgba(255, 255, 255, 0.25);
          }
        }
      }
    }

    .chat-body {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      background: #f8fafc;
      display: flex;
      flex-direction: column;
    }

    .error-banner {
      background: #fee2e2;
      color: #991b1b;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
      margin-bottom: 12px;
    }

    .typing-indicator-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;

      .avatar {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: #0f172a;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
      }

      .typing-bubble {
        background: #e2e8f0;
        padding: 10px 14px;
        border-radius: 16px;
        display: flex;
        gap: 4px;
        align-items: center;

        .dot {
          width: 6px;
          height: 6px;
          background: #64748b;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out both;

          &:nth-child(1) { animation-delay: -0.32s; }
          &:nth-child(2) { animation-delay: -0.16s; }
        }
      }
    }

    .chat-footer {
      padding: 12px 16px 8px 16px;
      background: #ffffff;
      border-top: 1px solid #e2e8f0;

      .input-form {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .chat-input {
        flex: 1;
        padding: 10px 14px;
        border: 1px solid #cbd5e1;
        border-radius: 24px;
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;

        &:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }

        &:disabled {
          background: #f1f5f9;
        }
      }

      .send-btn {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #2563eb;
        color: #ffffff;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;

        &:hover:not(:disabled) {
          background: #1d4ed8;
          transform: scale(1.05);
        }

        &:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
        }
      }

      .powered-by {
        text-align: center;
        font-size: 11px;
        color: #94a3b8;
        margin-top: 6px;
      }
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    @keyframes pulse {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
    }

    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }
  `]
})
export class ChatWidgetComponent {
  readonly chatService = inject(ChatService);
  readonly messageControl = new FormControl('', [Validators.required]);

  @ViewChild('scrollContainer') private scrollContainer?: ElementRef;
  @ViewChild('messageInput') private messageInput?: ElementRef;

  constructor() {
    // Auto-scroll to bottom whenever messages or typing state changes
    effect(() => {
      this.chatService.messages();
      this.chatService.isTyping();
      this.scrollToBottom();
    });
  }

  onSubmit(): void {
    const text = this.messageControl.value;
    if (text?.trim()) {
      this.chatService.sendMessage(text);
      this.messageControl.reset();
      this.scrollToBottom();
    }
  }

  onEnterPress(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (!keyboardEvent.shiftKey) {
      keyboardEvent.preventDefault();
      this.onSubmit();
    }
  }

  onQuickReplySelected(reply: string): void {
    this.chatService.selectQuickReply(reply);
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.scrollContainer) {
        const el = this.scrollContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    }, 50);
  }
}
