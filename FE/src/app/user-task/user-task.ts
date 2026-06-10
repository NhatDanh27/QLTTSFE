import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface InternTask {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: 'todo' | 'in-progress' | 'done' | 'paused';
  assignDate: string;
  deadline: string;
  submissionNote?: string;
}

@Component({
  selector: 'app-user-task',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-task.html',
  styleUrls: ['./user-task.css']
})
export class InternTaskComponent {
  // Dữ liệu mẫu (Task được giao cho TTS đang đăng nhập)
  myTasks = signal<InternTask[]>([
    { id: '#1042', title: 'Phân tích dữ liệu người dùng Q3', description: 'Viết script Python để xử lý log data từ hệ thống, xuất ra báo cáo Excel.', progress: 65, status: 'in-progress', assignDate: '12/10/2023', deadline: '20/10/2023', submissionNote: 'Đã hoàn thành phần xử lý log, đang viết script xuất Excel.' },
    { id: '#1055', title: 'Hỗ trợ test giao diện Đăng nhập', description: 'Viết testcase và thực hiện test manual giao diện Đăng nhập mới.', progress: 0, status: 'todo', assignDate: '14/10/2023', deadline: '18/10/2023', submissionNote: '' }
  ]);

  // State Modal
  isModalOpen = signal<boolean>(false);
  currentTask: any = {};

  // Mở form Cập nhật tiến độ
  openUpdateModal(task: InternTask) {
    this.currentTask = { ...task }; // Clone dữ liệu để thao tác an toàn
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  onSubmit() {
    // Logic gọi API update tiến độ lên server
    console.log('Cập nhật tiến độ Task:', this.currentTask);
    
    // Demo update state local
    const updatedTasks = this.myTasks().map(t => 
      t.id === this.currentTask.id ? this.currentTask : t
    );
    this.myTasks.set(updatedTasks);

    alert('Cập nhật tiến độ thành công!');
    this.closeModal();
  }
}