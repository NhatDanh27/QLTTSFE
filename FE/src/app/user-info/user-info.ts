import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface InternProfile {
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
  internPosition: string; // Read-only
  gpa: string;
  englishSkill: string;

  startDate: string; // Read-only
  duration: string; // Read-only
  internStatus: string;

  idCardNumber: string;
  idIssueDate: string;
  idIssuePlace: string;

  bio: string;
  cvLink: string;
}

@Component({
  selector: 'app-intern-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-info.html',
  styleUrls: ['./user-info.css']
})
export class InternProfileComponent {
  // Trạng thái cho phép chỉnh sửa
  isEditMode = signal<boolean>(false);

  // Dữ liệu mẫu khởi tạo (Giống hệt trong ảnh)
  profile = signal<InternProfile>({
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

    startDate: '15/10/2023',
    duration: '3 tháng',
    internStatus: 'Đang diễn ra',

    idCardNumber: '079000123456',
    idIssueDate: '2021-05-20',
    idIssuePlace: 'Cục Cảnh sát QLHC về TTXH',

    bio: 'Sinh viên năm cuối ngành Khoa học Máy tính, đam mê phát triển web frontend. Mong muốn học hỏi và đóng góp vào các dự án thực tế trong môi trường doanh nghiệp.',
    cvLink: 'https://portfolio.nguyenvana.dev'
  });

  toggleEditMode() {
    if (this.isEditMode()) {
      // Logic lưu dữ liệu gọi API ở đây
      console.log('Lưu thông tin:', this.profile());
      alert('Cập nhật thông tin thành công!');
    }
    this.isEditMode.set(!this.isEditMode());
  }
}