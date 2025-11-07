import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class Profile implements OnInit {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  message = '';

  // ✅ Fallback default image
  profilePic: string = 'assets/default-profile.png';
  selectedFile: File | null = null;

  theme: string = 'light';
  apiUrl = 'http://localhost/smartmoney/smartmoneyAPI/api.php';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    const localUserRaw = localStorage.getItem('user');

    if (!localUserRaw) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      const userData = JSON.parse(localUserRaw);

      this.name = userData.name || '';
      this.email = userData.email || '';
      this.theme = userData.theme || 'light';

      // ✅ If user has no profile image, keep the default
      this.profilePic =
        userData.profilePic && userData.profilePic.trim() !== ''
          ? userData.profilePic
          : 'assets/default-profile.png';

      // ✅ Apply saved theme immediately
      document.body.classList.remove('light', 'dark');
      document.body.classList.add(this.theme);
    } catch (e) {
      console.error('Error parsing local user data:', e);
      this.router.navigate(['/login']);
    }
  }

  // ✅ Handles profile image preview before saving
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          this.profilePic = e.target.result as string;
        }
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  // ✅ Main update function
  updateProfile() {
    this.message = '';

    if (this.password && this.password !== this.confirmPassword) {
      this.message = '⚠️ Passwords do not match!';
      return;
    }

    const formData = new FormData();
    formData.append('name', this.name);
    formData.append('theme', this.theme);
    if (this.password) formData.append('password', this.password);
    if (this.selectedFile) formData.append('profilePic', this.selectedFile);

    this.http
      .post<any>(`${this.apiUrl}?action=updateProfile`, formData, {
        withCredentials: true,
      })
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.message = '✅ Profile updated successfully!';

            // ✅ Update local storage data
            const localUser = JSON.parse(localStorage.getItem('user') || '{}');
            localUser.name = this.name;
            localUser.theme = this.theme;
            localUser.profilePic = res.profilePic || this.profilePic;
            localStorage.setItem('user', JSON.stringify(localUser));

            // ✅ Apply the new theme immediately
            document.body.classList.remove('light', 'dark');
            document.body.classList.add(this.theme);

            // ✅ Update image preview
            this.profilePic = res.profilePic || this.profilePic;
          } else {
            this.message = res.message || '❌ Profile update failed.';
          }
        },
        error: (err) => {
          console.error('Update profile error:', err);
          this.message = '⚠️ Error updating profile.';
        },
      });
  }
}
