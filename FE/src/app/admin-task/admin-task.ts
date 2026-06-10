import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeName: string;
  assigneeInitials: string;
  assigneeColor: string;
  progress: number;
  status: 'todo' | 'in-progress' | 'done' | 'paused';
  date: string;
}

@Component({
  selector: 'app-admin-task',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-task.html',
  styleUrls: ['./admin-task.css']
})
export class AdminTask {
  // Dữ liệu mẫu (Thay thế bằng data gọi từ API)
  taskList = signal<Task[]>([
    { id: '#1042', title: 'Phân tích dữ liệu người dùng Q3', description: 'Viết script Python để xử lý log data từ hệ thốn...', assigneeName: 'Nguyễn Văn A', assigneeInitials: 'NA', assigneeColor: 'bg-indigo', progress: 65, status: 'in-progress', date: '12/10/2023' },
    { id: '#1041', title: 'Thiết kế UI Mockup cho Landing Page', description: 'Dựa trên figma wireframe, hoàn thiện hi-fi des...', assigneeName: 'Trần Thị B', assigneeInitials: 'TB', assigneeColor: 'bg-green', progress: 100, status: 'done', date: '08/10/2023' },
    { id: '#1038', title: 'Cập nhật tài liệu API v2', description: 'Viết Swagger doc cho các endpoint mới thêm ...', assigneeName: 'Lê Hoàng C', assigneeInitials: 'LC', assigneeColor: 'bg-slate', progress: 30, status: 'paused', date: '05/10/2023' }
  ]);

  // State quản lý Form Modal
  isModalOpen = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  
  // Model lưu dữ liệu form
  currentTask: any = {};

  // Mở form Tạo mới
  openCreateModal() {
    this.isEditMode.set(false);
    this.currentTask = { status: 'todo' }; // Reset form
    this.isModalOpen.set(true);
  }

  // Mở form Chỉnh sửa
  openEditModal(task: Task) {
    this.isEditMode.set(true);
    this.currentTask = { ...task }; // Clone data để không ảnh hưởng trực tiếp bảng khi chưa lưu
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  onSubmit() {
    if (this.isEditMode()) {
      // Logic gọi API update task ở đây
      console.log('Cập nhật task:', this.currentTask);
    } else {
      // Logic gọi API create task ở đây
      console.log('Tạo task mới:', this.currentTask);
    }
    this.closeModal();
  }
}