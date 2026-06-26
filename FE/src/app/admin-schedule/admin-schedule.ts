import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { forkJoin, catchError, of } from 'rxjs';

export interface RegistrationRecord {
  id: string;          // reg_intern_ID gốc từ DB
  internName: string;
  dayOfWeek: string;
  date: string;        // Ngày hiển thị (DD/MM/YYYY)
  rawDate: string;     // Ngày gốc để lọc (YYYY-MM-DD)
  shift: string;
  status: 'registered' | 'cancelled';
}

export interface AttendanceRecord {
  id: string;          // Vẫn dùng reg_intern_ID để dễ track
  internName: string;
  date: string;        // Ngày hiển thị (DD/MM/YYYY)
  rawDate: string;     // Để phục vụ bộ lọc
  shift: string;
  checkIn: string;     // Giờ phút giây Check-in
  checkOut: string;    // Giờ phút giây Check-out
  status: 'attended' | 'absent';
}

@Component({
  selector: 'app-admin-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-schedule.html',
  styleUrls: ['./admin-schedule.css']
})
export class AdminScheduleComponent implements OnInit {
  private http = inject(HttpClient);
  
  // Các URLs
  private scheduleUrl = environment.apiUrl + '/schedule/list-all'; 
  private checkInUrl = environment.apiUrl + '/checkin/list';
  private checkOutUrl = environment.apiUrl + '/checkout/list';

  activeTab = signal<'registration' | 'attendance'>('registration');

  // Kho chứa dữ liệu gốc
  private allRegistrationData: RegistrationRecord[] = [];
  private allAttendanceData: AttendanceRecord[] = [];

  // Dữ liệu hiển thị lên bảng
  registrationData = signal<RegistrationRecord[]>([]);
  attendanceData = signal<AttendanceRecord[]>([]);

  // Các biến của bộ lọc
  searchName = signal<string>('');
  startDate = signal<string>(''); 
  endDate = signal<string>('');
  shiftFilter = signal<string>('Tất cả');

  // NÂNG CẤP: Cơ chế tự động tìm và đính kèm Token đăng nhập
  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({ 'X-API-KEY': '123456' });
    
    // Tìm Token (Dự phòng các tên biến thường dùng nhất)
    const token = localStorage.getItem('token') || 
                  localStorage.getItem('jwt') || 
                  sessionStorage.getItem('token') || 
                  sessionStorage.getItem('jwt');
                  
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }

  ngOnInit(): void {
    // Vừa vào trang là lấy luôn lịch đăng ký
    this.loadAllRegistrations();
  }

  // --- TẢI LỊCH ĐĂNG KÝ (TAB 1) ---
  loadAllRegistrations() {
    this.http.get<any>(this.scheduleUrl, {
      headers: this.getHeaders(),
      withCredentials: true 
    }).subscribe({
      next: (res) => {
        let records: any[] = [];
        if (Array.isArray(res)) records = res;
        else if (res && Array.isArray(res.lichlam)) records = res.lichlam;
        else if (res && Array.isArray(res.data)) records = res.data;

        if (records.length > 0) {
          const mappedData: RegistrationRecord[] = records.map((item: any) => {
            let shiftText = item.ca_lam || '';
            const shiftLower = String(shiftText).toLowerCase().trim();
            if (shiftLower === 'morning' || shiftLower === '0' || shiftLower === 'sáng') shiftText = 'Sáng';
            else if (shiftLower === 'afternoon' || shiftLower === '1' || shiftLower === 'chiều') shiftText = 'Chiều';
            
            let statusText = item.status || 'reg';
            let mappedStatus: 'registered' | 'cancelled' = 'registered';
            if (String(statusText).toLowerCase().includes('cancel') || String(statusText) === '0') mappedStatus = 'cancelled';

            const rawDateStr = item.ngay_dang_ki || '';
            const normalizedDate = String(rawDateStr).includes('T') ? String(rawDateStr).split('T')[0] : String(rawDateStr).split(' ')[0];

            return {
              id: item.id || item.reg_intern_ID || '', 
              internName: item.username || item.hoten || 'Không xác định',
              dayOfWeek: item.thu_trong_tuan || '---',
              date: this.formatDateToShow(normalizedDate),
              rawDate: normalizedDate, 
              shift: shiftText, 
              status: mappedStatus 
            };
          });

          this.allRegistrationData = mappedData;
          this.applyFilters();
        }
      },
      error: (err) => console.error('Lỗi API lịch đăng ký:', err)
    });
  }

  // --- CHUYỂN TAB & TẢI ĐIỂM DANH (TAB 2) ---
  switchTab(tab: 'registration' | 'attendance') {
    this.activeTab.set(tab);
    
    // Nếu nhảy sang tab điểm danh và chưa từng lấy dữ liệu thì tiến hành tải
    if (tab === 'attendance' && this.allAttendanceData.length === 0) {
      this.loadAllAttendanceData();
    } else {
      this.applyFilters();
    }
  }

  loadAllAttendanceData() {
    const options = { headers: this.getHeaders(), withCredentials: true };

    const reqSchedule = this.http.get<any>(this.scheduleUrl, options).pipe(catchError(err => { console.error('Lỗi API Lịch gốc:', err); return of([]); }));
    const reqCheckIn = this.http.get<any>(this.checkInUrl, options).pipe(catchError(err => { console.error('Lỗi API CheckIn:', err); return of([]); }));
    const reqCheckOut = this.http.get<any>(this.checkOutUrl, options).pipe(catchError(err => { console.error('Lỗi API CheckOut:', err); return of([]); }));

    forkJoin({
      schedules: reqSchedule,
      checkIns: reqCheckIn,
      checkOuts: reqCheckOut
    }).subscribe({
      next: (responses) => {
        const baseSchedules = this.extractArray(responses.schedules);
        const checkInList = this.extractArray(responses.checkIns);
        const checkOutList = this.extractArray(responses.checkOuts);

        const mappedAttendance: AttendanceRecord[] = [];

        baseSchedules.forEach((scheduleItem: any) => {
          const statusText = String(scheduleItem.status || '').toLowerCase();
          if (statusText.includes('cancel') || statusText === '0') return;

          // 1. CHUẨN BỊ MỐC ĐỐI CHIẾU
          const scheduleUsername = (scheduleItem.username || scheduleItem.hoten || '').toLowerCase().trim();
          const rawDateStr = scheduleItem.ngay_dang_ki || '';
          const normalizedDate = String(rawDateStr).includes('T') ? String(rawDateStr).split('T')[0] : String(rawDateStr).split(' ')[0];

          let shiftText = scheduleItem.ca_lam || '';
          if (String(shiftText).toLowerCase().includes('morning') || shiftText == '0') shiftText = 'Sáng';
          if (String(shiftText).toLowerCase().includes('afternoon') || shiftText == '1') shiftText = 'Chiều';

          // 2. TÌM CHECK-IN (Ghép bằng Username + Ngày + Phân biệt Sáng/Chiều qua Ghi chú)
          const matchedCheckIn = checkInList.find((ci: any) => {
            const ciUsername = (ci.username || '').toLowerCase().trim();
            const ciDate = String(ci.checkin || '').split('T')[0];
            
            const isSameUser = ciUsername === scheduleUsername;
            const isSameDate = ciDate === normalizedDate;
            
            // C# ghi chú là "Ca Sáng..." hoặc "Ca Chiều..." nên ta dùng nó để phân biệt ca
            const ciGhiChu = (ci.ghi_chu || '').toLowerCase();
            let isSameShift = true;
            if (shiftText === 'Sáng' && ciGhiChu.includes('ca chiều')) isSameShift = false;
            if (shiftText === 'Chiều' && ciGhiChu.includes('ca sáng')) isSameShift = false;

            return isSameUser && isSameDate && isSameShift;
          });

          // 3. TÌM CHECK-OUT (Ghép bằng Username + Ngày)
          const matchedCheckOut = checkOutList.find((co: any) => {
            const coUsername = (co.username || '').toLowerCase().trim();
            const coDate = String(co.checkout || '').split('T')[0];
            
            return coUsername === scheduleUsername && coDate === normalizedDate;
          });

          const regId = scheduleItem.id || scheduleItem.reg_intern_ID || 'N/A';

          // 4. ĐẨY DỮ LIỆU VÀO BẢNG HIỂN THỊ
          mappedAttendance.push({
            id: `#${regId}`,
            internName: scheduleItem.username || scheduleItem.hoten || 'Không xác định',
            date: this.formatDateToShow(normalizedDate),
            rawDate: normalizedDate,
            shift: shiftText,
            // Sửa tên biến thành ci.checkin / co.checkout cho khớp hoàn toàn với Backend
            checkIn: matchedCheckIn ? this.extractTime(matchedCheckIn.checkin) : '--:--',
            checkOut: matchedCheckOut ? this.extractTime(matchedCheckOut.checkout) : '--:--',
            status: matchedCheckIn ? 'attended' : 'absent' 
          });
        });

        mappedAttendance.sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime());
        this.allAttendanceData = mappedAttendance;
        this.applyFilters();
      },
      error: (err) => console.error('Lỗi Fatal khi ghép dữ liệu:', err)
    });
  }

  private extractArray(res: any): any[] {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    
    // Đón đầu các tên biến mà C# trả về
    if (res.checkIns && Array.isArray(res.checkIns)) return res.checkIns;
    if (res.checkOuts && Array.isArray(res.checkOuts)) return res.checkOuts;
    if (res.data && Array.isArray(res.data)) return res.data;
    if (res.lichlam && Array.isArray(res.lichlam)) return res.lichlam;
    
    // Nếu vẫn không khớp, tự động quét tìm mảng trong object
    const values = Object.values(res);
    for (const val of values) {
      if (Array.isArray(val)) return val;
    }
    return [];
  }

  private extractTime(dateTimeStr: string): string {
    if (!dateTimeStr) return '--:--';
    const parts = String(dateTimeStr).split(' '); 
    if (parts.length > 1) {
      return parts[1]; 
    }
    const tParts = String(dateTimeStr).split('T');
    if (tParts.length > 1) {
      return tParts[1].substring(0, 8); 
    }
    return '--:--';
  }

  applyFilters() {
    const keyword = this.searchName().trim().toLowerCase();
    const shift = this.shiftFilter();
    const start = this.startDate();
    const end = this.endDate();

    if (this.activeTab() === 'registration') {
      let filteredReg = this.allRegistrationData;
      if (keyword) filteredReg = filteredReg.filter(item => item.internName.toLowerCase().includes(keyword));
      if (shift !== 'Tất cả') filteredReg = filteredReg.filter(item => item.shift === shift);
      if (start) filteredReg = filteredReg.filter(item => item.rawDate >= start);
      if (end) filteredReg = filteredReg.filter(item => item.rawDate <= end);
      this.registrationData.set(filteredReg);
    } 
    else if (this.activeTab() === 'attendance') {
      let filteredAtt = this.allAttendanceData;
      if (keyword) filteredAtt = filteredAtt.filter(item => item.internName.toLowerCase().includes(keyword));
      if (shift !== 'Tất cả') filteredAtt = filteredAtt.filter(item => item.shift === shift);
      if (start) filteredAtt = filteredAtt.filter(item => item.rawDate >= start);
      if (end) filteredAtt = filteredAtt.filter(item => item.rawDate <= end);
      this.attendanceData.set(filteredAtt);
    }
  }

  clearFilters() {
    this.searchName.set('');
    this.startDate.set('');
    this.endDate.set('');
    this.shiftFilter.set('Tất cả');
    this.applyFilters();
  }

  private formatDateToShow(dateString: string): string {
    if (!dateString || dateString === 'undefined') return '';
    try {
      const dateObj = new Date(dateString);
      if (isNaN(dateObj.getTime())) return dateString;
      const d = dateObj.getDate().toString().padStart(2, '0');
      const m = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const y = dateObj.getFullYear();
      return `${d}/${m}/${y}`;
    } catch {
      return dateString;
    }
  }
}