import { Component, OnInit, inject, signal } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { FormsModule } from '@angular/forms';
  import { UserApi, UserItem, UserDTO } from '../services/user-api';

  @Component({
    selector: 'app-user',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './user.html',
    styleUrls: ['./user.css']
  })
  export class UserComponent implements OnInit {
    private userService = inject(UserApi);

    usersList = signal<UserItem[]>([]);
    isLoading = signal<boolean>(false);
    errorMessage = signal<string>('');
    searchQuery: string = '';


    isAddModalOpen = signal<boolean>(false);
    isSubmitting = signal<boolean>(false);
    newUser: UserDTO = { username: '', password: '', role: 'tts', status: 'active' };


    isEditModalOpen = signal<boolean>(false);
    editingUserId: number | null = null;
    editUser: UserDTO = { username: '', password: '', role: 'tts', status: 'active' };

    ngOnInit(): void {
      this.loadUsers();
    }

    loadUsers(): void {
      this.isLoading.set(true);
      this.errorMessage.set('');

      this.userService.getAllUsers().subscribe({
        next: (res) => {
          const sortedUsers = (res.user || []).sort((a, b) => a.id - b.id);
          this.usersList.set(sortedUsers);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.errorMessage.set('Lỗi khi tải danh sách người dùng.');
          this.isLoading.set(false);
        }
      });
    }

    onSearch(): void {
      if (!this.searchQuery.trim()) {
        this.loadUsers();
        return;
      }
      this.isLoading.set(true);
      this.errorMessage.set('');

      this.userService.searchUser(this.searchQuery).subscribe({
        next: (res) => {
          const sortedUsers = (res.users || []).sort((a, b) => a.id - b.id);
          this.usersList.set(sortedUsers);
          this.isLoading.set(false);
        },
        error: (err) => {
          if (err.status === 404) {
            this.usersList.set([]);
            this.errorMessage.set(`Không tìm thấy tài khoản nào chứa '${this.searchQuery}'`);
          }
          this.isLoading.set(false);
        }
      });
    }


    openAddModal(): void {
      this.newUser = { username: '', password: '', role: 'tts', status: 'active' };
      this.isAddModalOpen.set(true);
    }

    closeAddModal(): void {
      this.isAddModalOpen.set(false);
    }

    onSubmitCreate(): void {
      if (!this.newUser.username || !this.newUser.password) {
        alert('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!');
        return;
      }

      this.isSubmitting.set(true);
      
      this.userService.createUser(this.newUser).subscribe({
        next: (res) => {
          alert('Tạo tài khoản thành công!');
          this.isSubmitting.set(false);
          this.closeAddModal();
          this.loadUsers(); 
        },
        error: (err) => {
       
          let errorMsg = 'Có lỗi xảy ra khi tạo tài khoản';
          if (typeof err.error === 'string') {
            errorMsg = err.error;
          } else if (err.error && err.error.errors) {
            errorMsg = Object.values(err.error.errors).flat().join('\n');
          }
          alert(errorMsg); 
          this.isSubmitting.set(false);
        }
      });
    }


    openEditModal(user: UserItem): void {
      this.editingUserId = user.id;
   
      this.editUser = {
        username: user.tendangnhap,
        password: '', 
        role: user.role,
        status: user.status || 'active'
      };
      this.isEditModalOpen.set(true);
    }

    closeEditModal(): void {
      this.isEditModalOpen.set(false);
      this.editingUserId = null;
    }

    onSubmitEdit(): void {
      if (!this.editUser.username) {
        alert('Tên đăng nhập không được để trống!');
        return;
      }
      if (this.editingUserId === null) return;

      this.isSubmitting.set(true);

      this.userService.updateUser(this.editingUserId, this.editUser).subscribe({
        next: (res) => {
          alert('Cập nhật tài khoản thành công!');
          this.isSubmitting.set(false);
          this.closeEditModal();
          this.loadUsers(); 
        },
        error: (err) => {
          let errorMsg = 'Có lỗi xảy ra khi cập nhật tài khoản';
          if (typeof err.error === 'string') {
            errorMsg = err.error;
          } else if (err.error && err.error.errors) {
            errorMsg = Object.values(err.error.errors).flat().join('\n');
          }
          alert(errorMsg);
          this.isSubmitting.set(false);
        }
      });
    }
  }