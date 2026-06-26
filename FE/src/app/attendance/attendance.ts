import { Component, OnInit, inject, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceApiService, CheckInOutDTO } from '../services/attendance-api';
import { ScheduleApiService } from '../services/schedule-api'; // Import service lấy lịch

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance.html', // File HTML của bạn
  styleUrls: ['./attendance.css']
})
export class AttendanceComponent implements OnInit {
  private attendanceService = inject(AttendanceApiService);
  private scheduleService = inject(ScheduleApiService);
  private platformId = inject(PLATFORM_ID);

  // States
  latitude = signal<number | null>(null);
  longitude = signal<number | null>(null);
  isProcessing = signal<boolean>(false);
  successMessage = signal<string>('');
  errorMessage = signal<string>('');
  locationError = signal<string>('');

  // Dữ liệu form
  currentUserId = 0;
  regInternId = signal<number | null>(null); // Hệ thống tự tìm
  note = '';

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const sessionUserId = sessionStorage.getItem('userId');
      if (sessionUserId) {
        this.currentUserId = parseInt(sessionUserId, 10);
      }
      this.getLocation();
      this.autoFetchTodayScheduleId(); // Tự động chạy tìm ID lịch hôm nay
    }
  }

  // Hàm tự động tìm ID lịch của ngày hôm nay
  autoFetchTodayScheduleId() {
    if (!this.currentUserId || this.currentUserId === 0) return;

    this.scheduleService.getScheduleList(this.currentUserId).subscribe({
      next: (res) => {
        let records: any[] = [];
        if (Array.isArray(res)) records = res;
        else if (res && Array.isArray(res.lichlam)) records = res.lichlam;
        else if (res && Array.isArray(res.lichLam)) records = res.lichLam;
        else if (res && Array.isArray(res.data)) records = res.data;

        // Lấy ngày hôm nay định dạng yyyy-MM-dd
        const todayStr = new Date().toISOString().split('T')[0];

        // Tìm record có ngày đăng ký là hôm nay và trạng thái đang là 'reg' (hoặc 1)
        const todayShift = records.find(record => {
           let statusVal = '';
           let dateVal = '';

           for (const key in record) {
             const k = key.toLowerCase().replace(/_/g, ''); 
             if (k === 'status' || k === 'trangthai') statusVal = record[key];
             if (k === 'ngaydangki' || k === 'ngaydangky' || k === 'createat') dateVal = record[key];
           }

           const recordDate = String(dateVal).includes('T') ? String(dateVal).split('T')[0] : String(dateVal).split(' ')[0];
           const isReg = String(statusVal).toLowerCase().trim() === 'reg' || String(statusVal).trim() === '1';

           return recordDate === todayStr && isReg;
        });

        if (todayShift) {
          this.regInternId.set(todayShift.id);
          this.successMessage.set('Đã nhận diện thành công ca làm việc hôm nay.');
        } else {
          this.errorMessage.set('Bạn không có ca làm việc nào được đăng ký cho hôm nay.');
        }
      },
      error: (err) => {
        this.errorMessage.set('Lỗi khi tải dữ liệu lịch làm việc.');
        console.error(err);
      }
    });
  }

  getLocation(): void {
    this.locationError.set('');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.latitude.set(position.coords.latitude);
          this.longitude.set(position.coords.longitude);
        },
        (error) => {
          this.locationError.set('Không thể lấy vị trí. Vui lòng bật GPS trên trình duyệt.');
        }
      );
    } else {
      this.locationError.set('Trình duyệt của bạn không hỗ trợ định vị GPS.');
    }
  }

  onCheckIn(): void {
    if (!this.validateBeforeSubmit()) return;

    this.isProcessing.set(true);
    const payload: CheckInOutDTO = {
      reg_intern_ID: this.regInternId()!,
      vi_do: this.latitude()!,
      kinh_do: this.longitude()!,
      note: this.note.trim()
    };

    this.attendanceService.checkIn(payload).subscribe({
      next: (res) => {
        this.successMessage.set(res.message);
        this.errorMessage.set('');
        this.isProcessing.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Check-in thất bại.');
        this.successMessage.set('');
        this.isProcessing.set(false);
      }
    });
  }

  onCheckOut(): void {
    if (!this.validateBeforeSubmit()) return;

    this.isProcessing.set(true);
    const payload: CheckInOutDTO = {
      reg_intern_ID: this.regInternId()!,
      vi_do: this.latitude()!,
      kinh_do: this.longitude()!,
      note: this.note.trim()
    };

    this.attendanceService.checkOut(payload).subscribe({
      next: (res) => {
        this.successMessage.set(res.message);
        this.errorMessage.set('');
        this.isProcessing.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Check-out thất bại.');
        this.successMessage.set('');
        this.isProcessing.set(false);
      }
    });
  }

  private validateBeforeSubmit(): boolean {
    this.successMessage.set('');
    this.errorMessage.set('');

    if (this.regInternId() === null) {
      this.errorMessage.set('Hệ thống chưa tìm thấy lịch làm việc của bạn hôm nay. Vui lòng kiểm tra lại lịch.');
      return false;
    }
    if (this.latitude() === null || this.longitude() === null) {
      this.errorMessage.set('Chưa có dữ liệu GPS. Vui lòng nhấn "Cập nhật lại vị trí".');
      return false;
    }
    return true;
  }
}