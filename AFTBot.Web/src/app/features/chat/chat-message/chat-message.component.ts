import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatMessage } from '../../../core/models/chat.models';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="message-row" [ngClass]="message.senderType.toLowerCase()">
      @if (message.senderType === 'Bot') {
        <div class="avatar bot-avatar">
          <span class="bot-icon">🦅</span>
        </div>
      }

      <div class="bubble-container">
        <div class="message-bubble">
          <div class="message-text" [innerHTML]="formatMessage(message.message)"></div>
        </div>
        <div class="message-time">
          {{ message.createdDate | date:'shortTime' }}
        </div>
      </div>

      @if (message.senderType === 'Visitor') {
        <div class="avatar user-avatar">
          <span>👤</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .message-row {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      margin-bottom: 12px;
      animation: fadeIn 0.2s ease-in-out;

      &.visitor {
        justify-content: flex-end;

        .message-bubble {
          background: linear-gradient(135deg, #1e3a8a, #2563eb);
          color: #ffffff;
          border-radius: 16px 16px 4px 16px;
        }

        .message-time {
          text-align: right;
        }
      }

      &.bot {
        justify-content: flex-start;

        .message-bubble {
          background: #f1f5f9;
          color: #0f172a;
          border-radius: 16px 16px 16px 4px;
          border: 1px solid #e2e8f0;
        }

        .message-time {
          text-align: left;
        }
      }
    }

    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      flex-shrink: 0;

      &.bot-avatar {
        background: #0f172a;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }

      &.user-avatar {
        background: #e2e8f0;
      }
    }

    .bubble-container {
      max-width: 80%;
      display: flex;
      flex-direction: column;
    }

    .message-bubble {
      padding: 10px 14px;
      font-size: 14px;
      line-height: 1.45;
      word-break: break-word;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);

      .message-text {
        white-space: pre-wrap;
      }
    }

    .message-time {
      font-size: 11px;
      color: #94a3b8;
      margin-top: 3px;
      padding: 0 4px;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ChatMessageComponent {
  @Input({ required: true }) message!: ChatMessage;

  formatMessage(text: string): string {
    if (!text) return '';
    // Format simple linebreaks and emojis
    return text.replace(/\n/g, '<br/>');
  }
}
