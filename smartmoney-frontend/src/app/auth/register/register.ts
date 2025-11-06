import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class Register {
  name = '';
  email = '';
  password = '';
  confirmPassword = ''; // ✅ add this property
  loading = false;

  constructor(private api: ApiService, private router: Router) {}

  register() {
    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      alert('Please fill in all fields');
      return;
    }

    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    this.loading = true;

    this.api.register({ name: this.name, email: this.email, password: this.password }).subscribe({
      next: (res: any) => {
        this.loading = false;

        if (res.status === 'success') {
          alert('Registration successful! Please login.');
          this.router.navigate(['/login']);
        } else {
          alert(res.message || 'Registration failed');
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Registration error:', err);
        alert('Server error during registration');
      },
    });
  }
}

