import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Public Routes (Accessible by everyone)
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'widget',
    loadComponent: () => import('./features/chat/widget-page/widget-page.component').then(m => m.WidgetPageComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },

  // Protected Admin Routes (Require Login)
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'leads',
    canActivate: [authGuard],
    loadComponent: () => import('./features/leads/leads.component').then(m => m.LeadsComponent)
  },
  {
    path: 'leads/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/leads/lead-detail.component').then(m => m.LeadDetailComponent)
  },
  {
    path: 'conversations',
    canActivate: [authGuard],
    loadComponent: () => import('./features/chat/conversations/conversations.component').then(m => m.ConversationsComponent)
  },
  {
    path: 'users',
    canActivate: [authGuard],
    loadComponent: () => import('./features/users/users.component').then(m => m.UsersComponent)
  },

  // Wildcard fallback
  {
    path: '**',
    redirectTo: ''
  }
];
