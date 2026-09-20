import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private readonly SESSION_KEY = 'aftbot_session_id';

  getSessionId(): string {
    let sessionId = localStorage.getItem(this.SESSION_KEY);
    if (!sessionId) {
      sessionId = this.generateSessionId();
      localStorage.setItem(this.SESSION_KEY, sessionId);
    }
    return sessionId;
  }

  resetSession(): string {
    const newSessionId = this.generateSessionId();
    localStorage.setItem(this.SESSION_KEY, newSessionId);
    return newSessionId;
  }

  private generateSessionId(): string {
    // Generate UUID v4 format
    return 'aft-' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
