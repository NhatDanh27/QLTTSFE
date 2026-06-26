import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CheckInOutDTO {
  reg_intern_ID: number;
  vi_do: number;
  kinh_do: number;
  note: string;
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceApiService {
  private http = inject(HttpClient);
  private checkinUrl = `${environment.apiUrl}/checkin`;
  private checkoutUrl = `${environment.apiUrl}/checkout`;

  // 1. Thêm hàm tạo Header chứa API Key giống bên TaskService
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'X-API-KEY': '123456' // Đảm bảo key này khớp với config Backend của bạn
    });
  }

  // 2. Bổ sung headers và withCredentials vào API Check-in
  checkIn(payload: CheckInOutDTO): Observable<any> {
    return this.http.post(this.checkinUrl, payload, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  // 3. Bổ sung headers và withCredentials vào API Check-out
  checkOut(payload: CheckInOutDTO): Observable<any> {
    return this.http.post(this.checkoutUrl, payload, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  // Bổ sung headers cho các hàm lấy lịch sử (nếu bạn có gọi đến chúng)
  getCheckInHistory(userId: number): Observable<any> {
    const params = new HttpParams().set('userID', userId.toString());
    return this.http.get(this.checkinUrl, { 
      params,
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  getCheckOutHistory(userId: number): Observable<any> {
    const params = new HttpParams().set('userID', userId.toString());
    return this.http.get(this.checkoutUrl, { 
      params,
      headers: this.getHeaders(),
      withCredentials: true
    });
  }
}