import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/login-api';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = signal<string>('');
  password = signal<string>('');
  
  errorMessage = signal<string>('');
  isLoading = signal<boolean>(false);

  onSubmit() {
    if (!this.username() || !this.password()) {
      this.errorMessage.set('Vui lòng nhập tên đăng nhập và mật khẩu.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const payload = {
      username: this.username(),
      password: this.password()
    };

    this.authService.login(payload).subscribe({
      next: (res) => {
        // 1. Lưu thông tin User vào Session Storage (Không còn Token nữa)
        this.authService.saveSession(res);
        this.isLoading.set(false);

        // 2. Chuyển hướng theo Role
        if (res && res.user && res.user.role != null) {
          const userRole = res.user.role.toString().toLowerCase();
          
          if (userRole === 'admin' || userRole === 'leader' || userRole === '0' || userRole === '1') {
            this.router.navigate(['/app-user']); 
          } else {
            this.router.navigate(['/app-user-info']); 
          }
        } else {
          this.errorMessage.set('Lỗi dữ liệu trả về từ máy chủ.');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        // Xử lý thông báo lỗi từ Backend
        if (err.error && err.error.message) {
          this.errorMessage.set(err.error.message);
        } else {
          this.errorMessage.set('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
        }
      }
    });
  }
}