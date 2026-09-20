import { Component, OnInit, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../../../core/services/chat.service';
import { ChatWidgetComponent } from '../chat-widget/chat-widget.component';

@Component({
  selector: 'app-widget-page',
  standalone: true,
  imports: [CommonModule, ChatWidgetComponent],
  template: `
    <div class="widget-host-container">
      <app-chat-widget></app-chat-widget>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      background: transparent;
    }
    .widget-host-container {
      position: fixed;
      bottom: 0;
      right: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;

      ::ng-deep .chat-widget-wrapper {
        pointer-events: auto;
      }
    }
  `]
})
export class WidgetPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly chatService = inject(ChatService);

  constructor() {
    effect(() => {
      const open = this.chatService.isOpen();
      if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'AFTBOT_STATE_CHANGED', isOpen: open }, '*');
      }
    });
  }

  ngOnInit(): void {
    // Check if query param ?open=true was passed
    const shouldOpen = this.route.snapshot.queryParamMap.get('open');
    if (shouldOpen === 'true') {
      this.chatService.openChat();
    }
  }
}

