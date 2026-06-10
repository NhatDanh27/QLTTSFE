import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "../../environments/environment";
export interface CheckInOutDTO {
  User_ID: number;
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

  // Gọi API Check-in
  checkIn(payload: CheckInOutDTO): Observable<any> {
    return this.http.post(this.checkinUrl, payload);
  }

  // Gọi API Check-out
  checkOut(payload: CheckInOutDTO): Observable<any> {
    return this.http.post(this.checkoutUrl, payload);
  }

  // Lấy lịch sử Check-in cá nhân
  getCheckInHistory(userId: number): Observable<any> {
    const params = new HttpParams().set('userID', userId.toString());
    return this.http.get(this.checkinUrl, { params });
  }

  // Lấy lịch sử Check-out cá nhân
  getCheckOutHistory(userId: number): Observable<any> {
    const params = new HttpParams().set('userID', userId.toString());
    return this.http.get(this.checkoutUrl, { params });
  }
}