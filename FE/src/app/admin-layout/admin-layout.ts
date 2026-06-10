import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  // Cần import RouterModule để dùng routerLink và router-outlet
  imports: [CommonModule, RouterModule], 
  templateUrl: './admin-layout.html',
  styleUrls: ['./admin-layout.css']
})
export class AdminLayoutComponent {
  // Bạn có thể thêm logic lấy thông tin admin đang đăng nhập ở đây sau
}