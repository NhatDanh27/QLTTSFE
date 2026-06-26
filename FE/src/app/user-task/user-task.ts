import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../services/task-api'; 

export interface InternTask {
  id: number; 
  title: string;
  description: string;
  progress: number;
  status: string | number; 
  assignDate: string;
}

@Component({
  selector: 'app-user-task',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-task.html',
  styleUrls: ['./user-task.css']
})
export class InternTaskComponent implements OnInit {
  myTasks = signal<InternTask[]>([]);
  isModalOpen = signal<boolean>(false);
  currentTask: any = {};

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.loadMyTasks();
  }

  loadMyTasks() {
    this.taskService.getUserTask().subscribe({
      next: (res: any) => {
        if (res.listTasks && Array.isArray(res.listTasks)) {
          const mappedTasks = res.listTasks.map((t: any) => {
            // Logic tạo trạng thái ảo (Chờ duyệt)
            let uiProgress = t.progress;
            let uiStatus = t.statusTask;

            // Nếu tiến độ là 99 và chưa done -> Hiển thị là 100% và Chờ duyệt
            if (t.progress === 99 && (t.statusTask === 0 || t.statusTask === 'in_progress')) {
              uiProgress = 100;
              uiStatus = 'pending';
            }

            return {
              id: t.id,
              title: t.tieu_de,           
              description: t.noi_dung,    
              progress: uiProgress, // Sử dụng tiến độ ảo cho UI
              status: uiStatus,     // Sử dụng trạng thái ảo cho UI
              assignDate: t.ngay_dang_ki  
            };
          });
          this.myTasks.set(mappedTasks);
        }
      },
      error: (err: any) => {
        console.error('Lỗi khi tải danh sách Task TTS:', err);
      }
    });
  }

  onSubmit() {
    let submitProgress = Number(this.currentTask.progress);

    if (submitProgress < 0 || submitProgress > 100) {
      alert('Tiến độ phải nằm trong khoảng 0% - 100%, không được để số thập phân. ');
      return;
    }

    // TRICK: Nếu TTS báo cáo 100%, ta chỉ gửi 99 để Backend không tự động đóng Task
    let isSubmittingForApproval = false;
    if (submitProgress === 100) {
      submitProgress = 99;
      isSubmittingForApproval = true;
    }

    const updatePayload = {
      progress: submitProgress
    };

    this.taskService.updateTask(this.currentTask.id, updatePayload).subscribe({
      next: (res: any) => {
        if (isSubmittingForApproval) {
          alert('Đã gửi yêu cầu xác nhận hoàn thành đến Admin!');
        } else {
          alert(res.message);
        }
        this.closeModal();
        this.loadMyTasks(); 
      },
      error: (err: any) => {
        alert(err.error?.message || 'Có lỗi xảy ra khi cập nhật tiến độ.');
      }
    });
  }

  openUpdateModal(task: InternTask) {
    this.currentTask = { ...task }; 
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  
}