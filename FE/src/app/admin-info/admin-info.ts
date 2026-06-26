import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserApi, UserInfoDTO } from '../services/user-api';

@Component({
  selector: 'app-admin-intern-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-info.html',
  styleUrls: ['./admin-info.css']
})
export class AdminInternProfileComponent implements OnInit {
  private userService = inject(UserApi);

  // --- STATE QUẢN LÝ DANH SÁCH ---
  internList = signal<any[]>([]);
  
  // --- STATE QUẢN LÝ CHI TIẾT ---
  // Biến quan trọng nhất: Quyết định đang ở màn hình nào (0 = List, >0 = Detail)
  selectedUserId = signal<number>(0); 
  
  isEditMode = signal<boolean>(false);
  hasInfoInDb = signal<boolean>(false); 

  profile = signal<any>({
    fullName: '', gender: 'boy', dob: '', phone: '', personalEmail: '',
    schoolEmail: '', currentAddress: '', facebookUrl: '', university: '',
    studentId: '', major: '', internPosition: '', gpa: '', englishSkill: '',
    startDate: '', duration: '', internStatus: '', idCardNumber: '',
    idIssueDate: '', idIssuePlace: 'CTCCSQLHCVTTXH', bio: '', cvLink: ''
  });

  ngOnInit(): void {
    // Vừa vào trang là tải ngay danh sách TTS
    this.loadInterns();
  }

  // =========================================
  // PHẦN 1: LOGIC CHO DANH SÁCH
  // =========================================
  // =========================================
  // PHẦN 1: LOGIC CHO DANH SÁCH
  // =========================================
  loadInterns() {
    // Thay vì gọi getAllUsers, ta gọi getAllInfoUsers để lấy sẵn cục data chi tiết hồ sơ
    this.userService.getAllInfoUsers().subscribe({
      next: (res: any) => {
        if (res && res.data && Array.isArray(res.data)) {
          this.internList.set(res.data);
        }
      },
      error: (err: any) => console.error('Lỗi tải danh sách hồ sơ TTS:', err)
    });
  }

  viewProfile(userId: number) {
    // Lưu lại ID của TTS đang được chọn
    this.selectedUserId.set(userId);
    this.isEditMode.set(false);

    // Tìm kiếm thông tin chi tiết trực tiếp trên mảng dữ liệu Frontend đã tải về
    const targetData = this.internList().find((u: any) => u.User_ID == userId);
    
    if (targetData) {
      this.hasInfoInDb.set(true); 
      
      this.profile.set({
        ...this.profile(), 
        fullName: targetData.hoten || '', 
        gender: targetData.gioi_tinh || 'boy',
        phone: targetData.sdt || '',
        personalEmail: targetData.email_ca_nhan || '', 
        schoolEmail: targetData.email_truong || '', 
        currentAddress: targetData.dia_chi || targetData.location || '', 
        facebookUrl: targetData.fb_url || '',
        university: targetData.truong || targetData.school || '', 
        studentId: targetData.mssv || targetData.studentID || '', 
        major: targetData.nganh_hoc || targetData.study || '', 
        internPosition: targetData.vi_tri || targetData.postion || '', 
        gpa: targetData.gpa || '',
        englishSkill: targetData.trinh_do_tieng_anh || targetData.english_level || '', 
        startDate: targetData.ngay_bat_dau ? targetData.ngay_bat_dau.split('T')[0] : '',
        duration: targetData.thoi_gian_thuctap || targetData.duration_intern || '',
        idCardNumber: targetData.cccd || '',
        idIssueDate: targetData.ngay_cap_cccd ? targetData.ngay_cap_cccd.split('T')[0] : '',
        idIssuePlace: targetData.noi_cap_cccd || '', 
        bio: targetData.gioi_thieu || targetData.description || '', 
        cvLink: targetData.cv || ''
      });
    } else {
      this.hasInfoInDb.set(false);
      this.resetProfileForm();
    }
  }

  // =========================================
  // PHẦN 2: LOGIC CHO CHI TIẾT HỒ SƠ
  // =========================================
  loadProfileData() {
    const currentId = this.selectedUserId();
    if (currentId === 0) return;

    this.userService.getUserInfo(currentId).subscribe({
      next: (res: any) => {
        // Hỗ trợ cả 2 trường hợp: API trả về { data: {...} } hoặc trả thẳng object {...}
        const dbData = res.data || res; 

        // In ra console để bạn dễ kiểm tra xem Backend thực sự trả về những key gì
        console.log('Dữ liệu API trả về:', dbData);

        if (dbData) {
          this.hasInfoInDb.set(true); 
          
          this.profile.set({
            ...this.profile(), 
            // Dùng || để dự phòng mọi trường hợp tên cột bị sai khác viết hoa/viết thường
            fullName: dbData.fullname || dbData.fullName || '', 
            gender: dbData.gioi_tinh || 'boy',
            phone: dbData.sdt || dbData.phone || '',
            personalEmail: dbData.email_personal || '', 
            schoolEmail: dbData.email_school || '', 
            currentAddress: dbData.location || dbData.dia_chi || '', 
            facebookUrl: dbData.fb_url || '',
            university: dbData.school || dbData.truong || '', 
            studentId: dbData.student_ID || dbData.studentID || dbData.mssv || '', 
            major: dbData.study || dbData.nganh_hoc || '', 
            internPosition: dbData.postion || dbData.position || '', 
            gpa: dbData.gpa || '',
            englishSkill: dbData.english_level || '', 
            
            // Xử lý ngày tháng an toàn
            startDate: dbData.start_intern ? dbData.start_intern.split('T')[0] : (dbData.start_time ? dbData.start_time.split('T')[0] : ''),
            duration: dbData.duration_intern || dbData.duration_time || '',
            
            idCardNumber: dbData.cccd || '',
            idIssueDate: dbData.cccd_create ? dbData.cccd_create.split('T')[0] : '',
            idIssuePlace: dbData.cccd_location || '', 
            bio: dbData.description || dbData.gioi_thieu || '', 
            cvLink: dbData.cv || ''
          });
        }
      },
      error: (err: any) => {
        console.log('Chưa có thông tin hồ sơ trên DB hoặc có lỗi:', err);
        this.hasInfoInDb.set(false);
        this.resetProfileForm(); 
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
      alert('Vui lòng nhập ít nhất 1 Email (Cá nhân hoặc Trường).');
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
      start_intern: p.startDate ? p.startDate : undefined,
      duration_intern: p.duration,
      cccd: p.idCardNumber,
      cccd_create: p.idIssueDate ? p.idIssueDate : undefined,
      cccd_location: p.idIssuePlace,
      description: p.bio,
      cv: p.cvLink
    };

    if (this.hasInfoInDb()) {
      this.userService.updateUserInfo(this.selectedUserId(), payload).subscribe({
        next: (res: any) => {
          alert(res.message || 'Cập nhật thông tin thành công!');
          this.isEditMode.set(false);
        },
        error: (err: any) => alert(this.extractError(err))
      });
    } else {
      this.userService.createUserInfo(payload).subscribe({
        next: (res: any) => {
          alert(res.message || 'Tạo thông tin hồ sơ thành công!');
          this.hasInfoInDb.set(true);
          this.isEditMode.set(false);
        },
        error: (err: any) => alert(this.extractError(err))
      });
    }
  }

  goBack() {
    // Đóng trang chi tiết và trở về danh sách bằng cách set ID về 0
    this.selectedUserId.set(0);
  }

  private resetProfileForm() {
    this.profile.set({
      fullName: '', gender: 'boy', dob: '', phone: '', personalEmail: '',
      schoolEmail: '', currentAddress: '', facebookUrl: '', university: '',
      studentId: '', major: '', internPosition: '', gpa: '', englishSkill: '',
      startDate: '', duration: '', internStatus: '', idCardNumber: '',
      idIssueDate: '', idIssuePlace: '', bio: '', cvLink: ''
    });
  }

  private extractError(err: any): string {
    if (typeof err.error === 'string') return err.error;
    if (err.error?.message) return err.error.message;
    if (err.error?.errors) {
      let errorMsg = 'Dữ liệu không hợp lệ:\n';
      for (const key in err.error.errors) {
        errorMsg += `- ${err.error.errors[key][0]}\n`;
      }
      return errorMsg;
    }
    return 'Có lỗi xảy ra trong quá trình lưu dữ liệu.';
  }
}