import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from "../../environments/environment";

export interface RegScheduleDTO {
  userID: number;
  thu_trong_tuan: string;
  ca_lam: string; // "morning" hoặc "afternoon"
  ngay_dang_ki: string; // Định dạng YYYY-MM-DD
  status: string; // "reg" hoặc "cancel"
}

@Injectable({
  providedIn: 'root'
})
export class ScheduleApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/schedule';

  // Hàm dùng chung để tạo Header chứa API Key
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      // LƯU Ý: Thay chuỗi này bằng đúng Secret Key mà bạn đã tìm được ở Backend nhé!
      'X-API-KEY': '123456' 
    });
  }

  // API Đăng ký lịch mới
  regSchedule(payload: RegScheduleDTO[]): Observable<any> {
    return this.http.post(this.apiUrl, payload, {
      headers: this.getHeaders(),
      withCredentials: true // Bắt buộc để gửi kèm Cookie đăng nhập
    });
  }

  // API Lấy lịch cá nhân
  getScheduleList(userId: number): Observable<any> {
    const params = new HttpParams().set('userID', userId.toString());
    
    return this.http.get(this.apiUrl, { 
      headers: this.getHeaders(),
      params: params,
      withCredentials: true // Bắt buộc để gửi kèm Cookie đăng nhập
    });
  }
  // Thêm vào ScheduleApiService
updateSchedule(ids: number[]): Observable<any> {
  return this.http.put(this.apiUrl, ids, {
    headers: this.getHeaders(),
    withCredentials: true
  });
}
}