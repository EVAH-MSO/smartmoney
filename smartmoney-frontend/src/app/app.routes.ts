import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Dashboard } from './dashboard/dashboard';
import { Insights } from './insights/insights';
import { Chatbot } from './chatbot/chatbot';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { AuthGuard } from './auth/auth-guard';
import { Profile } from './profile/profile'; 

export const routes: Routes = [
  // Public routes
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'home', component: Home },

  // Protected routes
  { path: 'dashboard', component: Dashboard, canActivate: [AuthGuard] },
  { path: 'insights', component: Insights, canActivate: [AuthGuard] },
  { path: 'chatbot', component: Chatbot, canActivate: [AuthGuard] },
  { path: 'profile', component: Profile },

  // Wildcard - fallback
  { path: '**', redirectTo: 'home' },
];
