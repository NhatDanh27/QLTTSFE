import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScheduleApiService, RegScheduleDTO } from '../services/schedule-api';


export interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isSunday: boolean;
  isSaturday: boolean;
  morningSelected: boolean;
  afternoonSelected: boolean;
  
}

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schedule.html',
  styleUrls: ['./schedule.css']
})
export class ScheduleComponent implements OnInit {
  private scheduleService = inject(ScheduleApiService);

  // State quản lý thời gian hiện tại của Lịch
  currentDate = signal<Date>(new Date());
  calendarDays = signal<CalendarDay[]>([]);
  isSubmitting = signal<boolean>(false);

  // Giả lập ID của Thực tập sinh đang đăng nhập (Bạn cần thay bằng ID thực tế lấy từ Token/Auth Service)
  currentUserId = 1;

  // Tính toán Tên tháng hiển thị (vd: "Tháng 6, 2026")
  currentMonthText = computed(() => {
    const date = this.currentDate();
    return `Tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
  });

  // Tính toán tổng số ca đã chọn
  selectedStats = computed(() => {
    let morning = 0;
    let afternoon = 0;
    this.calendarDays().forEach(day => {
      if (day.morningSelected) morning++;
      if (day.afternoonSelected) afternoon++;
    });
    return { morning, afternoon };
  });

  ngOnInit(): void {
    this.generateCalendar();
  } 

  // --- LOGIC VẼ LỊCH ---
  generateCalendar(): void {
    const year = this.currentDate().getFullYear();
    const month = this.currentDate().getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Tính toán xem ngày mùng 1 là thứ mấy (0 = Chủ Nhật, 1 = Thứ 2...)
    let startingDayOfWeek = firstDayOfMonth.getDay(); 
    // Chuyển đổi để Thứ 2 là cột đầu tiên (0) thay vì Chủ nhật
    let emptyDaysBefore = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

    const days: CalendarDay[] = [];

    // 1. Điền các ngày của tháng trước (làm mờ)
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = emptyDaysBefore - 1; i >= 0; i--) {
      days.push(this.createEmptyDay(new Date(year, month - 1, prevMonthLastDay - i)));
    }
    

    // 2. Điền các ngày của tháng hiện tại
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const date = new Date(year, month, i);
      const dayOfWeek = date.getDay();
      days.push({
        date: date,
        dayNumber: i,
        isCurrentMonth: true,
        isSunday: dayOfWeek === 0,
        isSaturday: dayOfWeek === 6,
        morningSelected: false,
        afternoonSelected: false
      });
    }

    // 3. Điền các ngày của tháng sau cho đủ khung (bội số của 7)
    const totalCells = Math.ceil(days.length / 7) * 7;
    let nextMonthDay = 1;
    while (days.length < totalCells) {
      days.push(this.createEmptyDay(new Date(year, month + 1, nextMonthDay++)));
    }

    this.calendarDays.set(days);
  }

  private createEmptyDay(date: Date): CalendarDay {
    return {
      date: date,
      dayNumber: date.getDate(),
      isCurrentMonth: false,
      isSunday: false, isSaturday: false, morningSelected: false, afternoonSelected: false
    };
  }

  // --- ĐIỀU HƯỚNG ---
  prevMonth(): void {
    const newDate = new Date(this.currentDate().setMonth(this.currentDate().getMonth() - 1));
    this.currentDate.set(newDate);
    this.generateCalendar();
  }

  nextMonth(): void {
    const newDate = new Date(this.currentDate().setMonth(this.currentDate().getMonth() + 1));
    this.currentDate.set(newDate);
    this.generateCalendar();
  }
  // --- Thêm hàm này vào dưới các hàm điều hướng (prevMonth, nextMonth...) ---
  onSelectionChange(): void {
    // Ép mảng calendarDays cập nhật reference mới để trigger hàm computed
    this.calendarDays.set([...this.calendarDays()]);
  }
  clearSelections(): void {
    const resetDays = this.calendarDays().map(day => ({
      ...day,
      morningSelected: false,
      afternoonSelected: false
    }));
    this.calendarDays.set(resetDays);
  }

  // --- SUBMIT DỮ LIỆU ---
  onSubmit(): void {
    const { morning, afternoon } = this.selectedStats();
    if (morning === 0 && afternoon === 0) {
      alert('Vui lòng chọn ít nhất một ca làm việc!');
      return;
    }

    this.isSubmitting.set(true);
    const payload: RegScheduleDTO[] = [];

    // Duyệt qua lịch và gom các ngày được chọn thành Array DTO
    this.calendarDays().forEach(day => {
      if (!day.isCurrentMonth) return;

      const dateString = this.formatDate(day.date);
      const thuString = this.getDayNameString(day.date.getDay());

      if (day.morningSelected) {
        payload.push({
          userID: this.currentUserId,
          thu_trong_tuan: thuString,
          ca_lam: 'morning',
          ngay_dang_ki: dateString,
          status: 'reg'
        });
      }
      
      // Thứ 7 không được chọn chiều, nên isSaturday luôn block afternoonSelected ở HTML, nhưng ta cứ check lại cho chắc
      if (day.afternoonSelected && !day.isSaturday) {
        payload.push({
          userID: this.currentUserId,
          thu_trong_tuan: thuString,
          ca_lam: 'afternoon',
          ngay_dang_ki: dateString,
          status: 'reg'
        });
      }
    });

    this.scheduleService.regSchedule(payload).subscribe({
      next: (res) => {
        alert(res.message || 'Đăng ký lịch thành công!');
        this.clearSelections();
        this.isSubmitting.set(false);
      },
      error: (err) => {
        alert(typeof err.error === 'string' ? err.error : 'Có lỗi xảy ra khi lưu lịch.');
        this.isSubmitting.set(false);
      }
    });
  }

  // --- UTILS ---
  // Format Date thành YYYY-MM-DD cho C#
  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private getDayNameString(dayIndex: number): string {
    const days = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    return days[dayIndex];
  }
}