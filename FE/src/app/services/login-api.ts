import { Injectable, inject } from '@angular/core';
import { HttpClient,HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/authen'; 

  login(credentials: any): Observable<any> {
    const headers = new HttpHeaders({
      'X-API-KEY': '123456' // Thay chuỗi này bằng đúng SecretKey trong backend của bạn
    });

    return this.http.post(this.apiUrl, credentials, {
      headers: headers,
      // BẮT BUỘC CÓ DÒNG NÀY ĐỂ TRÌNH DUYỆT LƯU COOKIE TỪ BACKEND
      withCredentials: true 
    });
  }

  // Hàm lưu thông tin user (Bỏ lưu token vì Cookie đã tự động lo việc đó)
  saveSession(response: any) {
    if (response && response.user) {
      sessionStorage.setItem('userId', response.user.id.toString());
      sessionStorage.setItem('userName', response.user.tendangnhap);
      sessionStorage.setItem('role', response.user.role.toString());
    }
  }

  // Hàm xóa session khi đăng xuất
  clearSession() {
    sessionStorage.clear();
    // Lưu ý: Để đăng xuất hoàn toàn với Cookie, sau này bạn sẽ cần gọi thêm 1 API POST /logout tới C# để nó xóa Cookie trên trình duyệt.
  }
}