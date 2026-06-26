import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// Import thêm UserInfoDTO để xài cho phần hồ sơ
import { UserApi, UserItem, UserDTO, UserInfoDTO } from '../services/user-api';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user.html',
  styleUrls: ['./user.css']
})
export class UserComponent implements OnInit {
  private userService = inject(UserApi);

  // =========================================
  // STATE 1: QUẢN LÝ TÀI KHOẢN (DANH SÁCH & MODAL)
  // =========================================
  usersList = signal<UserItem[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  searchQuery: string = '';

  isAddModalOpen = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  newUser: UserDTO = { username: '', password: '', role: 'tts', status: 'active' };

  isEditModalOpen = signal<boolean>(false);
  editingUserId: number | null = null;
  editUser: UserDTO = { username: '', password: '', role: 'tts', status: 'active' };

  // =========================================
  // STATE 2: QUẢN LÝ CHI TIẾT HỒ SƠ (PROFILE)
  // =========================================
  // Biến điều hướng: 0 = Hiển thị bảng tài khoản, > 0 = Hiển thị form hồ sơ
  selectedProfileId = signal<number>(0); 
  isProfileEditMode = signal<boolean>(false);
  hasInfoInDb = signal<boolean>(false);

  profile = signal<any>({
    fullName: '', gender: 'boy', dob: '', phone: '', personalEmail: '',
    schoolEmail: '', currentAddress: '', facebookUrl: '', university: '',
    studentId: '', major: '', internPosition: '', gpa: '', englishSkill: '',
    startDate: '', duration: '', internStatus: '', idCardNumber: '',
    idIssueDate: '', idIssuePlace: '', bio: '', cvLink: ''
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  // -----------------------------------------
  // CÁC HÀM XỬ LÝ TÀI KHOẢN (GIỮ NGUYÊN)
  // -----------------------------------------
  loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.userService.getAllUsers().subscribe({
      next: (res) => {
        const sortedUsers = (res.user || []).sort((a, b) => a.id - b.id);
        this.usersList.set(sortedUsers);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Lỗi khi tải danh sách người dùng.');
        this.isLoading.set(false);
      }
    });
  }

  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.loadUsers();
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.userService.searchUser(this.searchQuery).subscribe({
      next: (res) => {
        const sortedUsers = (res.users || []).sort((a, b) => a.id - b.id);
        this.usersList.set(sortedUsers);
        this.isLoading.set(false);
      },
      error: (err) => {
        if (err.status === 404) {
          this.usersList.set([]);
          this.errorMessage.set(`Không tìm thấy tài khoản nào chứa '${this.searchQuery}'`);
        }
        this.isLoading.set(false);
      }
    });
  }

  openAddModal(): void {
    this.newUser = { username: '', password: '', role: 'tts', status: 'active' };
    this.isAddModalOpen.set(true);
  }

  closeAddModal(): void {
    this.isAddModalOpen.set(false);
  }

  onSubmitCreate(): void {
    if (!this.newUser.username || !this.newUser.password) {
      alert('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!');
      return;
    }
    this.isSubmitting.set(true);
    this.userService.createUser(this.newUser).subscribe({
      next: (res) => {
        alert('Tạo tài khoản thành công!');
        this.isSubmitting.set(false);
        this.closeAddModal();
        this.loadUsers(); 
      },
      error: (err) => {
        let errorMsg = 'Có lỗi xảy ra khi tạo tài khoản';
        if (typeof err.error === 'string') errorMsg = err.error;
        else if (err.error && err.error.errors) errorMsg = Object.values(err.error.errors).flat().join('\n');
        alert(errorMsg); 
        this.isSubmitting.set(false);
      }
    });
  }

  openEditModal(user: UserItem): void {
    this.editingUserId = user.id;
    this.editUser = {
      username: user.tendangnhap,
      password: '', 
      role: user.role,
      status: user.status || 'active'
    };
    this.isEditModalOpen.set(true);
  }

  closeEditModal(): void {
    this.isEditModalOpen.set(false);
    this.editingUserId = null;
  }

    onSubmitEdit(): void {
    if (!this.editUser.username) {
      alert('Tên đăng nhập không được để trống!');
      return;
    }
    if (this.editingUserId === null) return;

    this.isSubmitting.set(true);

    // Tạo một bản sao của editUser để làm payload gửi lên API
    const payload: any = { ...this.editUser };

    // Bổ sung trường 'active' bằng giá trị của 'status' 
    // Điều này đảm bảo backend .NET nhận được đúng tên trường giống với cột dưới database
    payload.active = payload.status;

    // Nếu password rỗng (người dùng không muốn đổi), xóa trường này khỏi payload
    // để tránh bị C# bắt lỗi validate MinLength(6)
    if (!payload.password || payload.password.trim() === '') {
      delete payload.password;
    }

    this.userService.updateUser(this.editingUserId, payload).subscribe({
      next: (res) => {
        alert('Cập nhật tài khoản thành công!');
        this.isSubmitting.set(false);
        this.closeEditModal();
        this.loadUsers(); 
      },
      error: (err) => {
        let errorMsg = 'Có lỗi xảy ra khi cập nhật tài khoản';
        if (typeof err.error === 'string') errorMsg = err.error;
        else if (err.error && err.error.errors) errorMsg = Object.values(err.error.errors).flat().join('\n');
        alert(errorMsg);
        this.isSubmitting.set(false);
      }
    });
  }


  viewProfile(userId: number): void {
    this.selectedProfileId.set(userId);
    this.isProfileEditMode.set(false);
    
    // Gọi API list-all để lấy dữ liệu toàn bộ TTS
    this.userService.getAllInfoUsers().subscribe({
      next: (res: any) => {
        const allInfos = res.data || [];
        
        // SỬA Ở ĐÂY: Dự phòng mọi trường hợp viết hoa/viết thường của ID từ Backend
        const targetData = allInfos.find((info: any) => 
          info.User_ID == userId || info.user_ID == userId || info.userId == userId || info.user_id == userId
        );

        if (targetData) {
          this.hasInfoInDb.set(true);
          
          // SỬA Ở ĐÂY: Map chính xác 100% các biến tiếng Việt từ API list-all của bạn
          this.profile.set({
            ...this.profile(),
            fullName: targetData.hoten || targetData.fullname || '', 
            gender: targetData.gioi_tinh || 'boy',
            phone: targetData.sdt || targetData.phone || '',
            personalEmail: targetData.email_ca_nhan || targetData.email_personal || '', 
            schoolEmail: targetData.email_truong || targetData.email_school || '', 
            currentAddress: targetData.dia_chi || targetData.location || '', 
            facebookUrl: targetData.fb_url || '',
            university: targetData.truong || targetData.school || '', 
            studentId: targetData.mssv || targetData.studentID || '', 
            major: targetData.nganh_hoc || targetData.study || '', 
            internPosition: targetData.vi_tri || targetData.postion || '', 
            gpa: targetData.gpa || '',
            englishSkill: targetData.trinh_do_tieng_anh || targetData.english_level || '', 
            
            // Xử lý an toàn cho ngày tháng
            startDate: targetData.ngay_bat_dau ? targetData.ngay_bat_dau.split('T')[0] : (targetData.start_intern ? targetData.start_intern.split('T')[0] : ''),
            duration: targetData.thoi_gian_thuctap || targetData.duration_intern || '',
            
            idCardNumber: targetData.cccd || '',
            idIssueDate: targetData.ngay_cap_cccd ? targetData.ngay_cap_cccd.split('T')[0] : (targetData.cccd_create ? targetData.cccd_create.split('T')[0] : ''),
            idIssuePlace: targetData.noi_cap_cccd || targetData.cccd_location || '', 
            bio: targetData.gioi_thieu || targetData.description || '', 
            cvLink: targetData.cv || ''
          });
        } else {
          // Chỉ khi thực sự chưa có dữ liệu mới mở form trống
          this.handleEmptyProfile(userId);
        }
      },
      error: (err: any) => {
        console.error('Lỗi khi tải hồ sơ:', err);
        this.handleEmptyProfile(userId);
      }
    });
  }

  // Hàm phụ trợ xử lý khi hồ sơ trống
  private handleEmptyProfile(userId: number) {
    this.hasInfoInDb.set(false);
    this.resetProfileForm();
    
    // Mồi sẵn tên đăng nhập vào ô Họ tên để Admin dễ nhận diện
    const targetUser = this.usersList().find(u => u.id === userId);
    if (targetUser) {
      this.profile.update(p => ({ ...p, fullName: targetUser.tendangnhap }));
    }
  }

  // ... (giữ nguyên các hàm closeProfile, toggleProfileEditMode, saveProfileToDb...)

  closeProfile(): void {
    // Ẩn form hồ sơ, tự động quay lại bảng danh sách
    this.selectedProfileId.set(0);
  }

  toggleProfileEditMode(): void {
    if (this.isProfileEditMode()) {
      this.saveProfileToDb();
    } else {
      this.isProfileEditMode.set(true);
    }
  }

  saveProfileToDb(): void {
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
      this.userService.updateUserInfo(this.selectedProfileId(), payload).subscribe({
        next: (res: any) => {
          alert(res.message || 'Cập nhật thông tin thành công!');
          this.isProfileEditMode.set(false);
        },
        error: (err: any) => alert(this.extractProfileError(err))
      });
    } else {
      this.userService.createUserInfo(payload).subscribe({
        next: (res: any) => {
          alert(res.message || 'Tạo thông tin hồ sơ thành công!');
          this.hasInfoInDb.set(true);
          this.isProfileEditMode.set(false);
        },
        error: (err: any) => alert(this.extractProfileError(err))
      });
    }
  }

  private resetProfileForm(): void {
    this.profile.set({
      fullName: '', gender: 'boy', dob: '', phone: '', personalEmail: '',
      schoolEmail: '', currentAddress: '', facebookUrl: '', university: '',
      studentId: '', major: '', internPosition: '', gpa: '', englishSkill: '',
      startDate: '', duration: '', internStatus: 'Đang diễn ra', idCardNumber: '',
      idIssueDate: '', idIssuePlace: '', bio: '', cvLink: ''
    });
  }

  private extractProfileError(err: any): string {
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