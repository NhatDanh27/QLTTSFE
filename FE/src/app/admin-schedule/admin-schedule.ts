import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface RegistrationRecord {
  id: string;
  internName: string;
  dayOfWeek: string;
  date: string;
  shift: string;
  status: 'registered' | 'cancelled';
}

export interface AttendanceRecord {
  id: string;
  internName: string;
  date: string;
  shift: string;
  checkIn: string;
  checkOut: string;
  status: 'attended' | 'absent';
}

@Component({
  selector: 'app-admin-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-schedule.html',
  styleUrls: ['./admin-schedule.css']
})
export class AdminScheduleComponent {
  // Quản lý Tab hiện tại ('registration' hoặc 'attendance')
  activeTab = signal<'registration' | 'attendance'>('registration');

  // Dữ liệu mẫu Tab: Lịch đăng ký
  registrationData = signal<RegistrationRecord[]>([
    { id: '#1', internName: 'nguyenvan_a', dayOfWeek: 'Thứ Hai', date: '16/10/2023', shift: 'Cả ngày', status: 'registered' },
    { id: '#3', internName: 'le_hoang_c', dayOfWeek: 'Thứ Tư', date: '18/10/2023', shift: 'Chiều', status: 'registered' },
    { id: '#4', internName: 'pham_van_d', dayOfWeek: 'Thứ Năm', date: '19/10/2023', shift: 'Sáng', status: 'cancelled' },
  ]);

  // Dữ liệu mẫu Tab: Điểm danh
  attendanceData = signal<AttendanceRecord[]>([
    { id: '#1', internName: 'nguyenvan_a', date: '16/10/2023', shift: 'Cả ngày', checkIn: '08:05', checkOut: '17:15', status: 'attended' },
    { id: '#2', internName: 'tran_thi_b', date: '17/10/2023', shift: 'Sáng', checkIn: '--:--', checkOut: '--:--', status: 'absent' },
  ]);

  // Bộ lọc
  searchName = signal<string>('');
  dateRange = signal<string>('');
  shiftFilter = signal<string>('Tất cả');

  switchTab(tab: 'registration' | 'attendance') {
    this.activeTab.set(tab);
  }

  clearFilters() {
    this.searchName.set('');
    this.dateRange.set('');
    this.shiftFilter.set('Tất cả');
  }
}