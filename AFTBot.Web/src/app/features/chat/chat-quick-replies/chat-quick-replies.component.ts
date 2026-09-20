import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-quick-replies',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (replies && replies.length > 0) {
      <div class="quick-replies-container">
        <div class="quick-replies-scroll">
          @for (reply of replies; track reply) {
            <button 
              type="button" 
              class="quick-reply-btn"
              (click)="selectReply(reply)">
              {{ reply }}
            </button>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .quick-replies-container {
      margin: 8px 0 12px 0;
      padding: 0 8px;
    }

    .quick-replies-scroll {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .quick-reply-btn {
      background: #ffffff;
      color: #2563eb;
      border: 1px solid #bfdbfe;
      border-radius: 18px;
      padding: 6px 12px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
      box-shadow: 0 1px 2px rgba(0,0,0,0.04);

      &:hover {
        background: #2563eb;
        color: #ffffff;
        border-color: #2563eb;
        transform: translateY(-1px);
        box-shadow: 0 3px 6px rgba(37, 99, 235, 0.2);
      }

      &:active {
        transform: translateY(0);
      }
    }
  `]
})
export class ChatQuickRepliesComponent {
  @Input() replies: string[] = [];
  @Output() replySelected = new EventEmitter<string>();

  selectReply(reply: string): void {
    this.replySelected.emit(reply);
  }
}
