import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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

  

  getAllUsers(): Observable<GetAllUsersResponse> {
    return this.http.get<GetAllUsersResponse>(this.apiUrl);
  }

  searchUser(username: string): Observable<SearchUsersResponse> {
    const params = new HttpParams().set('username', username);
    return this.http.get<SearchUsersResponse>(`${this.apiUrl}/search`, { params });
  }

  createUser(payload: UserDTO): Observable<ActionResponse> {
    return this.http.post<ActionResponse>(this.apiUrl, payload);
  }

  updateUser(userId: number, payload: UserDTO): Observable<ActionResponse> {
    const params = new HttpParams().set('userID', userId.toString());
    return this.http.put<ActionResponse>(this.apiUrl, payload, { params });
  }
}