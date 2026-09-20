import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ChatWidgetComponent } from './features/chat/chat-widget/chat-widget.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ChatWidgetComponent],
  template: `
    <router-outlet></router-outlet>
    <app-chat-widget></app-chat-widget>
  `,
  styleUrl: './app.scss'
})
export class App {}
