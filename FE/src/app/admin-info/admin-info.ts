import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface InternProfile {
  id: string;
  fullName: string;
  gender: string;
  dob: string;
  phone: string;
  personalEmail: string;
  schoolEmail: string;
  currentAddress: string;
  facebookUrl: string;
  
  university: string;
  studentId: string;
  major: string;
  internPosition: string; 
  gpa: string;
  englishSkill: string;

  startDate: string; 
  duration: string; 
  internStatus: string;

  idCardNumber: string;
  idIssueDate: string;
  idIssuePlace: string;

  bio: string;
  cvLink: string;
}

@Component({
  selector: 'app-admin-intern-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-info.html',
  styleUrls: ['./admin-info.css']
})
export class AdminInternProfileComponent {
  // Trạng thái cho phép Admin chỉnh sửa
  isEditMode = signal<boolean>(false);

  // Dữ liệu mẫu (Thực tế sẽ gọi API get profile by ID)
  profile = signal<InternProfile>({
    id: '#1',
    fullName: 'Nguyễn Văn A',
    gender: 'Nam',
    dob: '2000-01-01',
    phone: '0901234567',
    personalEmail: 'nguyenvana@gmail.com',
    schoolEmail: '2012345@student.hcmut.edu.vn',
    currentAddress: '123 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP.HCM',
    facebookUrl: 'https://facebook.com/nguyenvana',
    
    university: 'Đại học Bách Khoa TP.HCM',
    studentId: '2012345',
    major: 'Khoa học Máy tính',
    internPosition: 'Frontend Developer Intern',
    gpa: '3.5',
    englishSkill: 'IELTS 6.5',

    startDate: '2023-10-15',
    duration: '3 tháng',
    internStatus: 'Đang diễn ra',

    idCardNumber: '079000123456',
    idIssueDate: '2021-05-20',
    idIssuePlace: 'Cục Cảnh sát QLHC về TTXH',

    bio: 'Sinh viên năm cuối ngành Khoa học Máy tính, đam mê phát triển web frontend.',
    cvLink: 'https://portfolio.nguyenvana.dev'
  });

  toggleEditMode() {
    if (this.isEditMode()) {
      // Logic gọi API update thông tin user
      console.log('Admin lưu thông tin:', this.profile());
      alert('Đã lưu các thay đổi thành công!');
    }
    this.isEditMode.set(!this.isEditMode());
  }

  goBack() {
    // Logic quay lại trang danh sách (Ví dụ: this.router.navigate(['/app-user']))
    window.history.back();
  }
}