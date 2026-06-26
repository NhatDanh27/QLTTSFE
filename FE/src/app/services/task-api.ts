import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TaskRegDTO {
  User_ID: number;
  title: string;
  content: string;
  progress: number;
  statusTask: string;
  ngay_dang_ki: string; 
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = environment.apiUrl + '/task';

  constructor(private http: HttpClient) {}

  // 1. Hàm dùng chung để tạo Header chứa API Key
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'X-API-KEY': '123456' 
    });
  }

  // ================= ADMIN APIs =================

  // POST: Tạo task mới
  createTask(task: TaskRegDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}`, task, { 
      headers: this.getHeaders(),
      withCredentials: true 
    });
  }

  // PUT: Admin update task
  adminUpdateTask(taskId: number, task: TaskRegDTO): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin-update?taskId=${taskId}`, task, { 
      headers: this.getHeaders(),
      withCredentials: true 
    });
  }

  // GET: Tìm task của TTS 
  searchTasksByIntern(username: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin-search?username=${username}`, { 
      headers: this.getHeaders(),
      withCredentials: true 
    });
  }
  
  // GET: Lấy toàn bộ task done
  getTasksDone(): Observable<any> {
    return this.http.get(`${this.apiUrl}/list-all`, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  // ================= TTS (USER) APIs =================

  // GET: TTS xem danh sách task của mình
  getUserTask(): Observable<any> {
    // Backend (.NET) lấy UserID từ claims token, truyền 0 để khớp với API parameter
    return this.http.get(`${this.apiUrl}?userID=0`, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  // PUT: TTS cập nhật tiến độ task
  updateTask(taskId: number, updateDTO: any): Observable<any> {
    return this.http.put(`${this.apiUrl}?taskId=${taskId}`, updateDTO, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }
}