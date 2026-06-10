import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [CommonModule, RouterModule], 
  templateUrl: './user-layout.html',
  styleUrls: ['./user-layout.css']
})
export class UserLayoutComponent {
  // Nơi chứa logic lấy thông tin User đang đăng nhập
}