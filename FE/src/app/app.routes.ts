import { Routes } from '@angular/router';
import { ScheduleComponent } from './schedule/schedule';
import { UserComponent } from './user/user';
import { AdminLayoutComponent } from './admin-layout/admin-layout';
import { UserLayoutComponent } from './user-layout/user-layout';
import { AttendanceComponent } from './attendance/attendance';
import { AdminTask } from './admin-task/admin-task';
import { InternTaskComponent } from './user-task/user-task';
import { InternProfileComponent } from './user-info/user-info';
import { AdminInternProfileComponent } from './admin-info/admin-info';
import { AdminScheduleComponent } from './admin-schedule/admin-schedule';
export const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent, 
    children: [
      
      { path: 'app-user', component: UserComponent }, 
      { path: '', redirectTo: 'app-user', pathMatch: 'full' },
      { path: 'app-admin-task', component: AdminTask },
      { path: 'app-admin-info', component: AdminInternProfileComponent },
      {path: 'app-admin-schedule', component: AdminScheduleComponent }
    ]
  },

  {  path: '',
     component: UserLayoutComponent, children: [
    {path: 'app-schedule', component: ScheduleComponent },
    {path: 'app-attendance', component: AttendanceComponent },
    { path: 'app-user-task', component: InternTaskComponent },
    { path: 'app-user-info', component: InternProfileComponent },
    ]}
];