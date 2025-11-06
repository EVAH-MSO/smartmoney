import { Component, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  email = '';
  password = '';
  message = '';
  loading = false;

  constructor(private api: ApiService, private router: Router, private ngZone: NgZone) {}

  login() {
    if (!this.email || !this.password) {
      this.message = 'Please enter both email and password';
      return;
    }

    this.loading = true;
    this.message = '';

    this.api.login({ email: this.email, password: this.password }).subscribe({
      next: (res: any) => {
        this.loading = false;
        console.log('Login response:', res);

        if (res.success) {
          // Save user info from API response
          const user = res.user || { email: res.email, name: res.name };
          localStorage.setItem('user', JSON.stringify(user));
          console.log('User saved to localStorage:', localStorage.getItem('user'));

          // Navigate to dashboard
          this.ngZone.run(() => this.router.navigateByUrl('/dashboard'));
        } else {
          this.message = res.message || 'Invalid credentials';
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Login error:', err);
        this.message = 'Server error during login. Please try again later.';
      },
    });
  }
}
