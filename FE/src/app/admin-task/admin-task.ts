import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService, TaskRegDTO } from '../services/task-api';
import { UserApi } from '../services/user-api';

@Component({
  selector: 'app-admin-task',
  standalone: true, 
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-task.html',
  styleUrls: ['./admin-task.css']
})
export class TaskComponent implements OnInit {
  taskList = signal<any[]>([]);
  internList = signal<any[]>([]);
  allTasks: any[] = [];
  isModalOpen = signal(false);
  isEditMode = signal(false);

  searchKeyword = '';
  filterAssignee = 'all';
  filterStatus = 'all';

  currentTask: any = {
    id: null,
    title: '',
    description: '',
    assigneeId: undefined,
    status: 'in_progress',
    progress: 0
  };

  constructor(private taskService: TaskService, private userApi: UserApi) {}

  ngOnInit() {
    this.loadInterns();
    this.loadTasks();
  }

  loadInterns() {
    this.userApi.getAllUsers().subscribe({
      next: (res: any) => {
        const allUsers = res.user; 
        if (allUsers && Array.isArray(allUsers)) {
          const internOnly = allUsers.filter((u: any) => u.role === 'tts');
          this.internList.set(internOnly);
        }
      },
      error: (err: any) => console.error('Lỗi khi tải danh sách User:', err)
    });
  }

  openCreateModal() {
    this.isEditMode.set(false);
    this.currentTask = {
      id: null,
      title: '',
      description: '',
      assigneeId: undefined,
      status: 'in_progress',
      progress: 0
    };
    this.isModalOpen.set(true);
  }

  openEditModal(task: any) {
    this.isEditMode.set(true);
    this.currentTask = { ...task };

    // --- FIX LỖI 1: Xử lý trạng thái ảo khi mở form ---
    // Nếu task đang chờ duyệt (pending), đổi UI form về lại đang thực hiện và hiển thị 99% (giá trị thật dưới DB)
    if (this.currentTask.status === 'pending') {
      this.currentTask.status = 'in_progress';
      this.currentTask.progress = 99; 
    }
    // Nếu task dưới DB lưu bằng số, đồng bộ về dạng chuỗi cho Select Form
    if (this.currentTask.status === 1) this.currentTask.status = 'done';
    if (this.currentTask.status === 0) this.currentTask.status = 'in_progress';

    const selectedIntern = this.internList().find(
      (intern: any) => intern.tendangnhap === task.assigneeName
    );
    
    if (selectedIntern) {
      this.currentTask.assigneeId = selectedIntern.id;
    }

    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  onSubmit() {
    if (!this.currentTask.title || !this.currentTask.assigneeId) {
      alert('Vui lòng nhập đầy đủ Tiêu đề và Chọn Thực tập sinh!');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    
    let finalProgress = Number(this.currentTask.progress);
    let finalStatus = this.currentTask.status;

    // --- FIX LỖI 2: Tự động đồng bộ Tiến độ và Trạng thái bảo vệ TTS ---
    if (finalProgress === 100) {
      // Nếu Admin gõ thẳng 100%, tự động ép trạng thái là done
      finalStatus = 'done'; 
    } else if (finalProgress < 100 && (finalStatus === 'done' || finalStatus === 1)) {
      // Nếu Admin giảm tiến độ xuống < 100 mà quên đổi trạng thái, tự động ép về in_progress
      finalStatus = 'in_progress'; 
    }

    const payload: TaskRegDTO = {
      User_ID: Number(this.currentTask.assigneeId),
      title: this.currentTask.title,
      content: this.currentTask.description,
      progress: finalProgress,
      statusTask: finalStatus,
      ngay_dang_ki: today
    };

    if (this.isEditMode()) {
      this.taskService.adminUpdateTask(this.currentTask.id, payload).subscribe({
        next: (res) => {
          alert(res.message);
          this.closeModal();
          this.loadTasks(); 
        },
        error: (err) => alert(err.error?.message || 'Lỗi khi cập nhật task')
      });
    } else {
      this.taskService.createTask(payload).subscribe({
        next: (res) => {
          alert(res.message);
          this.closeModal();
          this.loadTasks(); 
        },
        error: (err) => alert(err.error?.message || 'Lỗi khi tạo task')
      });
    }
  }

  loadTasks() {
    this.taskService.getTasksDone().subscribe({
      next: (res: any) => {
        if (res.task && Array.isArray(res.task)) {
          const mappedTasks = res.task.map((t: any) => {
            let uiProgress = t.progress;
            let uiStatus = t.statusTask;

            // 1. Chuẩn hóa trạng thái từ DB về dạng chuỗi để dễ lọc
            if (uiStatus === 0) uiStatus = 'in_progress';
            if (uiStatus === 1) uiStatus = 'done';

            // 2. Nhận diện trạng thái ảo Chờ duyệt (99%)
            if (t.progress === 99 && uiStatus === 'in_progress') {
              uiProgress = 100;
              uiStatus = 'pending';
            }

            return {
              id: t.id,
              title: t.tieu_de,
              description: t.noi_dung,
              assigneeName: t.username,
              progress: uiProgress,
              status: uiStatus, // Lúc này status chỉ có thể là 'in_progress', 'pending' hoặc 'done'
              date: t.ngay_dang_ki
            };
          });
          
          this.allTasks = mappedTasks;
          this.applyFilters(); 
        }
      },
      error: (err: any) => console.error('Lỗi khi tải danh sách Task:', err)
    });
  }

  // Chức năng Duyệt Task
  approveTask(task: any) {
    if (confirm(`Bạn có chắc chắn muốn duyệt hoàn thành task: "${task.title}"?`)) {
      const selectedIntern = this.internList().find(
        (intern: any) => intern.tendangnhap === task.assigneeName
      );
      
      // Lúc này Admin duyệt mới thực sự đẩy 100% và trạng thái done lên Backend
      const payload: TaskRegDTO = {
        User_ID: selectedIntern ? selectedIntern.id : 0, 
        title: task.title,
        content: task.description,
        progress: 100,
        statusTask: 'done', // Hoặc truyền 1 nếu Backend yêu cầu số
        ngay_dang_ki: task.date
      };

      this.taskService.adminUpdateTask(task.id, payload).subscribe({
        next: (res) => {
          alert('Đã duyệt hoàn thành task!');
          this.loadTasks(); 
        },
        error: (err) => alert(err.error?.message || 'Lỗi khi duyệt task')
      });
    }
  }

  // ... (giữ nguyên các phần đầu)

  applyFilters() {
    let filtered = this.allTasks;

    if (this.searchKeyword && this.searchKeyword.trim() !== '') {
      const keyword = this.searchKeyword.toLowerCase().trim();
      filtered = filtered.filter(t => t.title.toLowerCase().includes(keyword));
    }

    if (this.filterAssignee !== 'all') {
      filtered = filtered.filter(t => t.assigneeName === this.filterAssignee);
    }

    // Lọc trực tiếp theo trạng thái đã được chuẩn hóa
    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === this.filterStatus);
    }

    this.taskList.set(filtered);
  }

  // Bổ sung hàm Duyệt task nhanh
  
  clearFilters() {
    this.searchKeyword = '';
    this.filterAssignee = 'all';
    this.filterStatus = 'all';
    this.applyFilters(); 
  }
}