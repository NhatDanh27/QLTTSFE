import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserItem {
  id: number;
  tendangnhap: string;
  role: string; 
  ngaytao: string;
  status?: string; 
}

export interface UserDTO {
  username: string;
  password?: string;
  role: string;
  status?: string;
  create_at?: string;
}

// INTERFACE CHO USER INFO (Khớp 100% với Backend)
export interface UserInfoDTO {
  fullname?: string;
  study?: string;
  postion?: string; // Lưu ý: Backend viết là "postion" thay vì "position"
  studentID?: string;
  school?: string;
  start_intern?: string;
  duration_intern?: string;
  email_school?: string;
  email_personal?: string;
  gioi_tinh?: string;
  gpa?: string;
  english_level?: string;
  description?: string;
  location?: string;
  fb_url?: string;
  sdt?: string;
  cccd?: string;
  cccd_create?: string;
  cccd_location?: string;
  cv?: string;
}

export interface GetAllUsersResponse {
  message: string;
  user: UserItem[]; 
}

export interface SearchUsersResponse {
  message: string;
  users: UserItem[]; 
}

export interface ActionResponse {
  message: string;
  tendangnhap?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserApi {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/user'; 

  // Hàm dùng chung để tạo Header chứa API Key
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      // LƯU Ý: Thay chuỗi này bằng đúng Secret Key mà bạn đã tìm được ở Backend nhé!
      'X-API-KEY': '123456' 
    });
  }

  // --- API USER CORE ---
  getAllUsers(): Observable<GetAllUsersResponse> {
    return this.http.get<GetAllUsersResponse>(this.apiUrl, { 
      headers: this.getHeaders(),
      withCredentials: true 
    });
  }

  searchUser(username: string): Observable<SearchUsersResponse> {
    const params = new HttpParams().set('username', username);
    return this.http.get<SearchUsersResponse>(`${this.apiUrl}/search`, { 
      headers: this.getHeaders(),
      params, 
      withCredentials: true 
    });
  }

  createUser(payload: UserDTO): Observable<ActionResponse> {
    return this.http.post<ActionResponse>(this.apiUrl, payload, { 
      headers: this.getHeaders(),
      withCredentials: true 
    });
  }

  updateUser(userId: number, payload: UserDTO): Observable<ActionResponse> {
    const params = new HttpParams().set('userID', userId.toString());
    return this.http.put<ActionResponse>(this.apiUrl, payload, { 
      headers: this.getHeaders(),
      params, 
      withCredentials: true 
    });
  }

  // --- API USER INFO (HỒ SƠ CÁ NHÂN) ---
  getUserInfo(userId: number): Observable<any> {
    const params = new HttpParams().set('UserID', userId.toString());
    return this.http.get<any>(`${this.apiUrl}/info`, { 
      headers: this.getHeaders(),
      params, 
      withCredentials: true 
    });
  }

  createUserInfo(payload: UserInfoDTO): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/info`, payload, { 
      headers: this.getHeaders(),
      withCredentials: true 
    });
  }
// Thêm hàm này vào class UserApi
  getAllInfoUsers(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/info/list-all`, { 
      headers: this.getHeaders(),
      withCredentials: true 
    });
  }
  updateUserInfo(userId: number, payload: UserInfoDTO): Observable<any> {
    const params = new HttpParams().set('userID', userId.toString());
    return this.http.put<any>(`${this.apiUrl}/info`, payload, { 
      headers: this.getHeaders(),
      params, 
      withCredentials: true 
    });
  }
}