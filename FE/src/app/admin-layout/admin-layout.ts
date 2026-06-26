import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule], 
  templateUrl: './admin-layout.html',
  styleUrls: ['./admin-layout.css']
})
export class AdminLayoutComponent implements OnInit {
  private router = inject(Router);

  // Biến lưu tên và chữ cái đầu của Avatar
  userName: string = 'Admin';
  firstChar: string = 'A';

  ngOnInit() {
    // Lấy tên đăng nhập từ sessionStorage đã lưu lúc login
    const storedName = sessionStorage.getItem('userName');
    if (storedName) {
      this.userName = storedName;
      // Lấy chữ cái đầu tiên và viết hoa để làm Avatar
      this.firstChar = storedName.charAt(0).toUpperCase();
    }
  }

  // Hàm xử lý khi bấm nút Đăng xuất
  logout() {
    sessionStorage.clear(); // Xóa toàn bộ dữ liệu session
    this.router.navigate(['/login']); // Điều hướng về trang đăng nhập
  }
}