import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from '../services/api';

interface SessionResponse {
  loggedIn: boolean;
  user?: any;
}

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private api: ApiService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const publicPages = ['/login', '/register', '/home'];
    const isPublicPage = publicPages.some((p) => state.url.startsWith(p));

    // ✅ Public routes allowed freely
    if (isPublicPage) {
      const localUser = localStorage.getItem('user');

      // redirect logged-in users away from login/register
      if (localUser && (state.url.startsWith('/login') || state.url.startsWith('/register'))) {
        this.router.navigate(['/dashboard']);
        return of(false);
      }

      return of(true);
    }

    // ✅ Protected routes -> first check localStorage
    const localUser = localStorage.getItem('user');
    if (localUser) {
      return of(true); // allow immediate navigation
    }
console.log('AuthGuard check for:', state.url, 'user:', localStorage.getItem('user'));

    // Otherwise, check server session
    return this.api.checkSession().pipe(
      map((res: SessionResponse) => {
        if (res?.loggedIn) {
          return true;
        }

        this.router.navigate(['/login']);
        return false;
      }),
      catchError((err) => {
        console.error('AuthGuard error:', err);
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}
