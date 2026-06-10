import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "../../environments/environment";
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
  private apiUrl = environment.apiUrl + '/schedule'; // Sửa lại port cho đúng với C#

  // API Đăng ký lịch mới
  regSchedule(payload: RegScheduleDTO[]): Observable<any> {
    return this.http.post(this.apiUrl, payload);
  }

  // API Lấy lịch cá nhân
  getScheduleList(userId: number): Observable<any> {
    const params = new HttpParams().set('userID', userId.toString());
    return this.http.get(this.apiUrl, { params });
  }
}