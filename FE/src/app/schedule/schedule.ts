import { Component, OnInit, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScheduleApiService, RegScheduleDTO } from '../services/schedule-api';
import { forkJoin } from 'rxjs';

export interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isSunday: boolean;
  isSaturday: boolean;
  morningSelected: boolean;
  afternoonSelected: boolean;
  morningRegistered: boolean;
  afternoonRegistered: boolean;
  morningId?: number;
  afternoonId?: number;
  isPast: boolean;
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
  private platformId = inject(PLATFORM_ID);

  currentDate = signal<Date>(new Date());
  calendarDays = signal<CalendarDay[]>([]);
  isSubmitting = signal<boolean>(false);
  notificationMessage = signal<string>('');
  isError = signal<boolean>(false);
  currentUserId = 0;

  currentMonthText = computed(() => `Tháng ${this.currentDate().getMonth() + 1}, ${this.currentDate().getFullYear()}`);
  
  selectedStats = computed(() => {
    let morning = 0, afternoon = 0;
    this.calendarDays().forEach(d => {
      if (d.morningSelected && !d.morningRegistered) morning++;
      if (d.afternoonSelected && !d.afternoonRegistered) afternoon++;
    });
    return { morning, afternoon };
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.currentUserId = parseInt(sessionStorage.getItem('userId') || '0', 10);
      this.generateCalendar();
    }
  }

  private showNotification(msg: string, isErr: boolean = false) {
    this.isError.set(isErr);
    this.notificationMessage.set(msg);
    setTimeout(() => { this.notificationMessage.set(''); }, 3000);
  }

  generateCalendar(): void {
    const year = this.currentDate().getFullYear();
    const month = this.currentDate().getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const today = new Date(); today.setHours(0,0,0,0);
    const days: CalendarDay[] = [];

    for (let i = 1; i <= lastDay; i++) {
      const date = new Date(year, month, i);
      days.push({
        date, dayNumber: i, isCurrentMonth: true, isSunday: date.getDay() === 0, 
        isSaturday: date.getDay() === 6, morningSelected: false, afternoonSelected: false, 
        morningRegistered: false, afternoonRegistered: false, isPast: date < today
      });
    }
    this.calendarDays.set(days);
    this.loadSavedSchedule();
  }

  loadSavedSchedule() {
    this.scheduleService.getScheduleList(this.currentUserId).subscribe(res => {
      const records = Array.isArray(res) ? res : (res.lichlam || res.data || []);
      
      this.calendarDays.update(days => days.map(day => {
        const dayStr = this.formatDate(day.date);
        
        const dayRecords = records.filter((r: any) => {
          const recordDate = r.ngay_dang_ki?.split('T')[0];
          return recordDate === dayStr && (String(r.status).toLowerCase() === 'reg' || String(r.status) === '1');
        });

        let morningReg = false, afternoonReg = false;
        let morningId = undefined, afternoonId = undefined;

        dayRecords.forEach((r: any) => {
          const session = String(r.ca_lam || r.session || '').toLowerCase();
          if (session === 'morning' || session === 'sáng' || session === '0') {
            morningReg = true;
            morningId = r.id;
          } else if (session === 'afternoon' || session === 'chiều' || session === '1') {
            afternoonReg = true;
            afternoonId = r.id;
          }
        });

        return { 
          ...day, 
          morningRegistered: morningReg, morningSelected: morningReg, morningId: morningId,
          afternoonRegistered: afternoonReg, afternoonSelected: afternoonReg, afternoonId: afternoonId
        };
      }));
    });
  }

  onSubmit(): void {
    this.isSubmitting.set(true);
    const idsToCancel: number[] = [];
    const payloadToReg: RegScheduleDTO[] = [];

    this.calendarDays().forEach(day => {
      if (day.morningRegistered && !day.morningSelected && day.morningId) idsToCancel.push(day.morningId);
      if (day.afternoonRegistered && !day.afternoonSelected && day.afternoonId) idsToCancel.push(day.afternoonId);
      
      if (day.morningSelected && !day.morningRegistered) 
        payloadToReg.push({ userID: this.currentUserId, ca_lam: 'morning', ngay_dang_ki: this.formatDate(day.date), status: 'reg', thu_trong_tuan: this.getDayName(day.date) });
      if (day.afternoonSelected && !day.afternoonRegistered) 
        payloadToReg.push({ userID: this.currentUserId, ca_lam: 'afternoon', ngay_dang_ki: this.formatDate(day.date), status: 'reg', thu_trong_tuan: this.getDayName(day.date) });
    });

    const tasks = [];
    if (idsToCancel.length > 0) tasks.push(this.scheduleService.updateSchedule(idsToCancel));
    if (payloadToReg.length > 0) tasks.push(this.scheduleService.regSchedule(payloadToReg));

    if (tasks.length === 0) {
      this.showNotification('Không có thay đổi nào để lưu!');
      this.isSubmitting.set(false);
      return;
    }

    forkJoin(tasks).subscribe({
      next: () => {
        this.showNotification('Cập nhật lịch thành công!');
        this.isSubmitting.set(false);
        this.loadSavedSchedule();
      },
      error: (err) => {
        this.showNotification(err.error?.message || 'Có lỗi xảy ra!', true);
        this.isSubmitting.set(false);
      }
    });
  }

  // SỬA HÀM NÀY ĐỂ TRÁNH LỖI MÚI GIỜ
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getDayName = (d: Date) => ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"][d.getDay()];
  prevMonth = () => { this.currentDate.update(d => new Date(d.setMonth(d.getMonth() - 1))); this.generateCalendar(); }
  nextMonth = () => { this.currentDate.update(d => new Date(d.setMonth(d.getMonth() + 1))); this.generateCalendar(); }
  onSelectionChange = () => this.calendarDays.set([...this.calendarDays()]);
  clearSelections = () => this.calendarDays.update(d => d.map(day => ({...day, morningSelected: day.morningRegistered, afternoonSelected: day.afternoonRegistered})));
}