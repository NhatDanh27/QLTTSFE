import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceApiService, CheckInOutDTO } from '../services/attendance-api';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance.html',
  styleUrls: ['./attendance.css']
})
export class AttendanceComponent implements OnInit {
  private attendanceService = inject(AttendanceApiService);

  // Giả lập ID user đang đăng nhập
  currentUserId = 1;

  // Dữ liệu form
  regInternId: number | null = null;
  note: string = '';

  // Dữ liệu GPS
  latitude = signal<number | null>(null);
  longitude = signal<number | null>(null);
  locationError = signal<string>('');

  // Trạng thái UI
  isProcessing = signal<boolean>(false);
  successMessage = signal<string>('');
  errorMessage = signal<string>('');

  ngOnInit(): void {
    this.getLocation();
  }

  // Hàm lấy tọa độ GPS từ trình duyệt
  getLocation(): void {
    this.locationError.set('');
    this.successMessage.set('');
    this.errorMessage.set('');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.latitude.set(position.coords.latitude);
          this.longitude.set(position.coords.longitude);
        },
        (error) => {
          this.locationError.set('Không thể lấy vị trí GPS. Vui lòng cấp quyền truy cập vị trí cho trình duyệt.');
          console.error('Lỗi GPS:', error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      this.locationError.set('Trình duyệt của bạn không hỗ trợ Geolocation.');
    }
  }

  // Xử lý Check-in
  onCheckIn(): void {
    this.submitAttendance('checkin');
  }

  // Xử lý Check-out
  onCheckOut(): void {
    this.submitAttendance('checkout');
  }

  private submitAttendance(type: 'checkin' | 'checkout'): void {
    this.successMessage.set('');
    this.errorMessage.set('');

    if (!this.regInternId) {
      this.errorMessage.set('Vui lòng nhập Mã ca làm việc (Reg Intern ID) của hôm nay.');
      return;
    }

    if (this.latitude() === null || this.longitude() === null) {
      this.errorMessage.set('Chưa lấy được tọa độ GPS. Vui lòng bấm "Làm mới vị trí".');
      return;
    }

    this.isProcessing.set(true);

    const payload: CheckInOutDTO = {
      User_ID: this.currentUserId,
      reg_intern_ID: this.regInternId,
      vi_do: this.latitude()!,
      kinh_do: this.longitude()!,
      note: this.note
    };

    const request$ = type === 'checkin' 
      ? this.attendanceService.checkIn(payload) 
      : this.attendanceService.checkOut(payload);

    request$.subscribe({
      next: (res) => {
        this.successMessage.set(res.message);
        this.isProcessing.set(false);
        this.note = ''; // Reset ghi chú
      },
      error: (err) => {
        // Bắt lỗi từ BadRequest của C#
        const errObj = err.error;
        if (errObj && errObj.message) {
          this.errorMessage.set(errObj.message);
        } else {
          this.errorMessage.set(typeof err.error === 'string' ? err.error : `Lỗi hệ thống khi ${type}.`);
        }
        this.isProcessing.set(false);
      }
    });
  }
}