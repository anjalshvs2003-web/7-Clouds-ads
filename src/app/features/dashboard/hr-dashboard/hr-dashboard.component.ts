import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';
import { AttendanceService } from '../../../core/services/attendance.service';
import { LeaveService } from '../../../core/services/leave.service';
import { TaskService } from '../../../core/services/task.service';
import { ToastService } from '../../../core/services/toast.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import {
  User,
  AttendanceRecord,
  LeaveRequest,
  TaskItem
} from '../../../core/models';
import {
  getTodayDateStringIST,
  formatTimeIST
} from '../../../core/services/ist-date.utils';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-hr-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent, BadgeComponent],
  template: `
    <div class="space-y-6 max-w-6xl mx-auto">
      <!-- Top Header -->
      <div class="glass-panel p-6 sm:p-8 relative overflow-hidden">
        <div class="absolute -right-20 -top-20 w-80 h-80 bg-violet/20 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                {{ isHost ? 'Host & Studio Direction' : 'HR Operations Hub' }}
              </span>
              <span class="text-text-muted">•</span>
              <span class="text-xs font-mono text-text-muted">{{ todayDateFormatted }} (IST)</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {{ isHost ? 'Studio Command Center' : 'HR Staff & Attendance Overview' }}
            </h1>
            <p class="text-xs sm:text-sm text-text-secondary mt-1">
              Real-time attendance status, staff roster, task deliverables and leave requests for 7 Clouds.
            </p>
          </div>

          <div class="flex items-center gap-2.5 flex-wrap">
            <a routerLink="/attendance" class="btn-primary text-xs">
              <app-icon name="clock" [size]="14"></app-icon>
              <span>Live Attendance</span>
            </a>
            <a routerLink="/tasks" class="btn-secondary text-xs">
              <app-icon name="check-square" [size]="14"></app-icon>
              <span>Task Board</span>
            </a>
          </div>
        </div>
      </div>

      <!-- KEY 7 METRICS DISPLAY (As specified in requirement 5) -->
      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <!-- 1. Total Employees -->
        <div class="glass-panel p-3.5 text-center">
          <div class="text-[10px] font-mono text-text-muted uppercase">Total Staff</div>
          <div class="text-2xl font-extrabold text-white font-mono mt-1">{{ totalStaffCount }}</div>
          <div class="text-[9px] text-text-secondary mt-0.5">Active team</div>
        </div>

        <!-- 2. Currently Checked In -->
        <div class="glass-panel p-3.5 text-center border-emerald-500/30">
          <div class="text-[10px] font-mono text-emerald-400 uppercase font-bold">Checked In</div>
          <div class="text-2xl font-extrabold text-emerald-400 font-mono mt-1">{{ checkedInCount }}</div>
          <div class="text-[9px] text-emerald-400/80 mt-0.5">Present today</div>
        </div>

        <!-- 3. Approved Leave -->
        <div class="glass-panel p-3.5 text-center">
          <div class="text-[10px] font-mono text-amber-400 uppercase">On Leave</div>
          <div class="text-2xl font-extrabold text-amber-400 font-mono mt-1">{{ onLeaveCount }}</div>
          <div class="text-[9px] text-text-muted mt-0.5">Approved time-off</div>
        </div>

        <!-- 4. Not Checked In -->
        <div class="glass-panel p-3.5 text-center">
          <div class="text-[10px] font-mono text-rose-400 uppercase">Not In Yet</div>
          <div class="text-2xl font-extrabold text-rose-400 font-mono mt-1">{{ notCheckedInCount }}</div>
          <div class="text-[9px] text-text-muted mt-0.5">Pending arrival</div>
        </div>

        <!-- 5. Tasks in Progress -->
        <div class="glass-panel p-3.5 text-center border-blue-500/30">
          <div class="text-[10px] font-mono text-blue-400 uppercase">In Progress</div>
          <div class="text-2xl font-extrabold text-blue-400 font-mono mt-1">{{ inProgressTasksCount }}</div>
          <div class="text-[9px] text-text-muted mt-0.5">Active tasks</div>
        </div>

        <!-- 6. Completed Tasks -->
        <div class="glass-panel p-3.5 text-center">
          <div class="text-[10px] font-mono text-emerald-400 uppercase">Completed</div>
          <div class="text-2xl font-extrabold text-emerald-400 font-mono mt-1">{{ completedTasksCount }}</div>
          <div class="text-[9px] text-text-muted mt-0.5">Finished tasks</div>
        </div>

        <!-- 7. Pending / Not Started Tasks -->
        <div class="glass-panel p-3.5 text-center">
          <div class="text-[10px] font-mono text-slate-400 uppercase">Not Started</div>
          <div class="text-2xl font-extrabold text-white font-mono mt-1">{{ notStartedTasksCount }}</div>
          <div class="text-[9px] text-text-muted mt-0.5">In backlog</div>
        </div>
      </div>

      <!-- MAIN CONTENT: Clean Employee Attendance Roster & Pending Leaves -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Staff Attendance Status List -->
        <div class="glass-panel p-6 lg:col-span-2">
          <div class="flex items-center justify-between pb-4 border-b border-surface-border mb-4">
            <div class="flex items-center gap-2">
              <app-icon name="users" [size]="18" extraClass="text-electric"></app-icon>
              <h2 class="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Today's Staff Check-In Roster
              </h2>
            </div>
            <a routerLink="/attendance" class="text-xs text-electric hover:underline font-medium">
              View Detailed Attendance →
            </a>
          </div>

          <div class="space-y-2.5">
            <div
              *ngFor="let member of staffRoster"
              class="flex items-center justify-between p-3.5 rounded-xl bg-surface-secondary/40 hover:bg-surface-secondary/70 border border-surface-border transition-all text-xs"
            >
              <div class="flex items-center gap-3 min-w-0">
                <img [src]="member.avatar" [alt]="member.name" class="w-8 h-8 rounded-full object-cover shrink-0" />
                <div class="min-w-0">
                  <div class="font-bold text-white flex items-center gap-2 truncate">
                    <span>{{ member.name }}</span>
                    <span
                      class="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase"
                      [ngClass]="member.role === 'super_admin' ? 'bg-gradient-to-r from-violet-600 to-electric text-white' : (member.role === 'hr_admin' ? 'bg-violet-500/20 text-violet-300' : 'bg-surface-tertiary text-text-muted')"
                    >
                      {{ member.role === 'super_admin' ? 'HOST' : (member.role === 'hr_admin' ? 'HR' : member.employeeId) }}
                    </span>
                  </div>
                  <div class="text-[11px] text-text-secondary truncate">{{ member.designation }} • {{ member.phone }}</div>
                </div>
              </div>

              <div class="flex items-center gap-3 shrink-0 text-right">
                <div class="hidden sm:block">
                  <div class="font-mono text-white text-xs">
                    {{ member.todayRecord?.checkInTime ? formatTime(member.todayRecord!.checkInTime!) : 'No Check-In' }}
                  </div>
                  <div class="text-[10px] text-text-muted font-mono">
                    {{ member.todayRecord?.workingHours ? member.todayRecord!.workingHours + 'h logged' : 'Cutoff 10:30' }}
                  </div>
                </div>

                <app-badge
                  [label]="member.todayRecord?.checkOutTime ? 'Completed' : (member.todayRecord?.checkInTime ? 'Checked In' : 'Pending')"
                  [variant]="member.todayRecord?.checkOutTime ? 'info' : (member.todayRecord?.checkInTime ? 'success' : 'warning')"
                ></app-badge>
              </div>
            </div>
          </div>
        </div>

        <!-- Pending Leave Notifications -->
        <div class="glass-panel p-6 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-4 border-b border-surface-border mb-4">
              <div class="flex items-center gap-2">
                <app-icon name="briefcase" [size]="18" extraClass="text-amber-400"></app-icon>
                <h2 class="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Pending Leave Requests
                </h2>
              </div>
              <span class="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold">
                {{ pendingLeaves.length }}
              </span>
            </div>

            <div class="space-y-3">
              <div
                *ngFor="let req of pendingLeaves"
                class="p-3.5 rounded-xl bg-surface-secondary/50 border border-surface-border text-xs space-y-2"
              >
                <div class="flex items-center justify-between">
                  <span class="font-bold text-white">{{ req.employeeName }}</span>
                  <app-badge [label]="req.leaveType" variant="warning"></app-badge>
                </div>

                <div class="text-[11px] font-mono text-text-secondary">
                  {{ req.startDate }} to {{ req.endDate }} ({{ req.daysCount }}d)
                </div>

                <p class="text-[11px] text-text-muted italic bg-surface-tertiary/40 p-2 rounded-lg">
                  "{{ req.reason }}"
                </p>

                <div class="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    (click)="approveLeave(req)"
                    class="flex-1 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white font-bold transition-all text-xs cursor-pointer text-center"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    (click)="rejectLeave(req)"
                    class="flex-1 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white font-bold transition-all text-xs cursor-pointer text-center"
                  >
                    Reject
                  </button>
                </div>
              </div>

              <div *ngIf="pendingLeaves.length === 0" class="py-8 text-center text-xs text-text-muted">
                No leave requests awaiting approval.
              </div>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-surface-border text-center">
            <a routerLink="/leave" class="text-xs text-electric hover:underline font-medium">
              View all leave records & balances →
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HrDashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isHost = false;
  todayDateFormatted = '';

  // 7 Specified Metrics
  totalStaffCount = 5;
  checkedInCount = 0;
  onLeaveCount = 0;
  notCheckedInCount = 0;
  inProgressTasksCount = 0;
  completedTasksCount = 0;
  notStartedTasksCount = 0;

  staffRoster: {
    id: string;
    employeeId: string;
    name: string;
    avatar: string;
    designation: string;
    phone: string;
    role: string;
    todayRecord?: AttendanceRecord;
  }[] = [];

  pendingLeaves: LeaveRequest[] = [];

  private subs: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private attendanceService: AttendanceService,
    private leaveService: LeaveService,
    private taskService: TaskService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const now = new Date();
    this.todayDateFormatted = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(now);

    this.subs.push(
      this.authService.currentUser$.subscribe(u => {
        this.currentUser = u;
        this.isHost = this.authService.isHost();
      }),
      this.dataService.getUsers().subscribe(users => {
        const activeUsers = users.filter(u => u.status === 'active');
        this.totalStaffCount = activeUsers.length;
        this.buildRoster(activeUsers, this.dataService.getAttendanceSnapshot());
      }),
      this.attendanceService.getAllAttendance().subscribe(att => {
        const today = getTodayDateStringIST();
        const todayCheckedIn = att.filter(r => r.date === today && r.checkInTime);
        this.checkedInCount = todayCheckedIn.length;
        this.notCheckedInCount = Math.max(0, this.totalStaffCount - this.checkedInCount);
        this.buildRoster(this.dataService.getUsersSnapshot(), att);
      }),
      this.leaveService.getAllLeaves().subscribe(leaves => {
        this.pendingLeaves = leaves.filter(l => l.status === 'Pending');
        const today = getTodayDateStringIST();
        this.onLeaveCount = leaves.filter(
          l => l.status === 'Approved' && today >= l.startDate && today <= l.endDate
        ).length;
      }),
      this.taskService.getAllTasks().subscribe(tasks => {
        this.inProgressTasksCount = tasks.filter(t => t.status === 'In Progress').length;
        this.completedTasksCount = tasks.filter(t => t.status === 'Completed').length;
        this.notStartedTasksCount = tasks.filter(t => t.status === 'Not Started' || t.status === 'Pending').length;
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  private buildRoster(users: User[], records: AttendanceRecord[]): void {
    const today = getTodayDateStringIST();
    this.staffRoster = users.map(u => {
      const rec = records.find(r => r.userId === u.id && r.date === today);
      return {
        id: u.id,
        employeeId: u.employeeId,
        name: u.name,
        avatar: u.avatar,
        designation: u.designation,
        phone: u.phone,
        role: u.role,
        todayRecord: rec
      };
    });
  }

  approveLeave(req: LeaveRequest): void {
    if (!this.currentUser) return;
    this.leaveService.reviewLeaveRequest(req.id, 'Approved', 'Approved by Host/HR', this.currentUser);
    this.toastService.success(`Approved leave for ${req.employeeName}`);
  }

  rejectLeave(req: LeaveRequest): void {
    if (!this.currentUser) return;
    const reason = prompt('Enter rejection reason:', 'Scheduling conflicts') || 'Declined';
    this.leaveService.reviewLeaveRequest(req.id, 'Rejected', reason, this.currentUser);
    this.toastService.warning(`Rejected leave for ${req.employeeName}`);
  }

  formatTime(isoStr?: string): string {
    return formatTimeIST(isoStr);
  }
}
