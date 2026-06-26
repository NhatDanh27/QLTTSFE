import { Component, OnInit, inject, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserApi, UserInfoDTO } from '../services/user-api';

@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-info.html',
  styleUrls: ['./user-info.css']
})
export class ProfileComponent implements OnInit {
  private userService = inject(UserApi);
  private platformId = inject(PLATFORM_ID);

  // States
  isEditMode = signal<boolean>(false);
  hasInfoInDb = signal<boolean>(false);
  
  // Thông báo
  successMessage = signal<string>('');
  isError = signal<boolean>(false);
  
  currentUserId = 0;

  profile = signal<any>({
    fullName: '', gender: 'boy', dob: '', phone: '', personalEmail: '',
    schoolEmail: '', currentAddress: '', facebookUrl: '', university: '',
    studentId: '', major: '', internPosition: '', gpa: '', englishSkill: '',
    startDate: '', duration: '', internStatus: '', idCardNumber: '',
    idIssueDate: '', idIssuePlace: 'CTCCSQLHCVTTXH', bio: '', cvLink: ''
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const sessionUserId = sessionStorage.getItem('userId');
      if (sessionUserId) {
        this.currentUserId = parseInt(sessionUserId, 10);
        this.loadProfileData();
      }
    }
  }

  // Hiển thị thông báo tinh tế (thay cho alert)
  private showNotification(msg: string, isErr: boolean = false) {
    this.isError.set(isErr);
    this.successMessage.set(msg);
    
    // Tự động ẩn sau 3 giây
    setTimeout(() => {
      this.successMessage.set('');
      this.isError.set(false);
    }, 3000);
  }

  loadProfileData() {
    if (this.currentUserId === 0) return;

    this.userService.getUserInfo(this.currentUserId).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.hasInfoInDb.set(true);
          const dbData = res.data;
          
          // --- CẬP NHẬT TRẠNG THÁI HỒ SƠ ---
          // Kiểm tra điều kiện: Nếu đã có CCCD và Số điện thoại thì đánh dấu là "đã cập nhật"
          if (dbData.cccd && dbData.sdt) {
             sessionStorage.setItem('isProfileUpdated', 'true');
          } else {
             sessionStorage.setItem('isProfileUpdated', 'false');
          }
          
          this.profile.set({
            ...this.profile(),
            fullName: dbData.hoten || '',
            gender: dbData.gioi_tinh || 'boy',
            phone: dbData.sdt || '',
            personalEmail: dbData.email_ca_nhan || '',
            schoolEmail: dbData.email_truong || '',
            currentAddress: dbData.dia_chi || '',
            facebookUrl: dbData.fb_url || '',
            university: dbData.truong || '',
            studentId: dbData.mssv || '',
            major: dbData.nganh_hoc || '',
            internPosition: dbData.vi_tri || '',
            gpa: dbData.gpa || '',
            englishSkill: dbData.trinh_do_tieng_anh || '',
            startDate: dbData.ngay_bat_dau ? dbData.ngay_bat_dau.split('T')[0] : '',
            duration: dbData.thoi_gian_thuctap || '',
            idCardNumber: dbData.cccd || '',
            idIssueDate: dbData.ngay_cap_cccd ? dbData.ngay_cap_cccd.split('T')[0] : '',
            idIssuePlace: dbData.noi_cap_cccd || '',
            bio: dbData.gioi_thieu || '',
            cvLink: dbData.cv || ''
          });
        }
      },
      error: (err) => {
        console.error('Không tìm thấy dữ liệu hồ sơ:', err);
        this.hasInfoInDb.set(false);
        // Chưa có dữ liệu trên DB -> chưa cập nhật
        sessionStorage.setItem('isProfileUpdated', 'false');
      }
    });
  }

  toggleEditMode() {
    if (this.isEditMode()) {
      this.saveProfileToDb();
    } else {
      this.isEditMode.set(true);
    }
  }

  saveProfileToDb() {
    const p = this.profile();
    
    if (!p.personalEmail && !p.schoolEmail) {
      this.showNotification('Vui lòng nhập ít nhất 1 Email.', true);
      return;
    }

    const payload: UserInfoDTO = {
      fullname: p.fullName,
      gioi_tinh: p.gender,
      sdt: p.phone,
      email_personal: p.personalEmail,
      email_school: p.schoolEmail,
      location: p.currentAddress,
      fb_url: p.facebookUrl,
      school: p.university,
      studentID: p.studentId,
      study: p.major,
      postion: p.internPosition,
      gpa: p.gpa,
      english_level: p.englishSkill,
      start_intern: p.startDate || undefined,
      duration_intern: p.duration,
      cccd: p.idCardNumber,
      cccd_create: p.idIssueDate || undefined,
      cccd_location: p.idIssuePlace,
      description: p.bio,
      cv: p.cvLink
    };

    const action$ = this.hasInfoInDb() 
      ? this.userService.updateUserInfo(this.currentUserId, payload)
      : this.userService.createUserInfo(payload);

    action$.subscribe({
      next: (res) => {
        this.showNotification(res.message || 'Lưu hồ sơ thành công!');
        this.hasInfoInDb.set(true);
        this.isEditMode.set(false);
        
        // --- CẬP NHẬT TRẠNG THÁI CHO PHÉP TRUY CẬP KHI LƯU THÀNH CÔNG ---
        sessionStorage.setItem('isProfileUpdated', 'true');
      },
      error: (err) => this.showNotification(this.extractError(err), true)
    });
  }

  private extractError(err: any): string {
    if (typeof err.error === 'string') return err.error;
    if (err.error?.message) return err.error.message;
    if (err.error?.errors) {
      return Object.values(err.error.errors).map((e: any) => e[0]).join('\n');
    }
    return 'Có lỗi xảy ra khi lưu hồ sơ.';
  }
}