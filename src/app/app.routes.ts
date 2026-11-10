import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/employee-dashboard/employee-dashboard.component').then(
        m => m.EmployeeDashboardComponent
      )
  },
  {
    path: 'hr-dashboard',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./features/dashboard/hr-dashboard/hr-dashboard.component').then(
        m => m.HrDashboardComponent
      )
  },
  {
    path: 'attendance',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/attendance/attendance.component').then(m => m.AttendanceComponent)
  },
  {
    path: 'tasks',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/tasks/tasks.component').then(m => m.TasksComponent)
  },
  {
    path: 'leave',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/leave/leave.component').then(m => m.LeaveComponent)
  },
  {
    path: 'work-reports',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/work-reports/work-reports.component').then(m => m.WorkReportsComponent)
  },
  {
    path: 'employees',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./features/employees/employees.component').then(m => m.EmployeesComponent)
  },
  {
    path: 'reports',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./features/reports/reports.component').then(m => m.ReportsComponent)
  },
  {
    path: 'calendar',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/calendar/calendar.component').then(m => m.CalendarComponent)
  },
  {
    path: 'announcements',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/announcements/announcements.component').then(m => m.AnnouncementsComponent)
  },
  {
    path: 'notifications',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/notifications/notifications.component').then(m => m.NotificationsComponent)
  },
  {
    path: 'settings',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./features/settings/settings.component').then(m => m.SettingsComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
