import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './user-layout.html',
  styleUrls: ['./user-layout.css']
})
export class UserLayoutComponent implements OnInit {
  // Đổi thành public để HTML đọc được
  public router = inject(Router);
  
  userName: string = 'Thực Tập Sinh';

  ngOnInit() {
    const storedName = sessionStorage.getItem('userName');
    if (storedName) {
      this.userName = storedName;
    }
  }

  // --- HÀM KIỂM TRA TRƯỚC KHI CHUYỂN TRANG ---
  navigateTo(path: string) {
    const isProfileUpdated = sessionStorage.getItem('isProfileUpdated'); 

    if (isProfileUpdated !== 'true') {
      alert('Vui lòng cập nhật thông tin cá nhân trước khi thực hiện tác vụ này');
      this.router.navigate(['/app-user-info']); // Trả về trang thông tin cá nhân
    } else {
      this.router.navigate([path]);
    }
  }

  logout() {
    sessionStorage.clear(); 
    this.router.navigate(['/login']); 
  }
}