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
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import {
  User,
  AttendanceRecord,
  LeaveRequest,
  TaskItem,
  AuditLog,
  DailyWorkReport
} from '../../../core/models';
import { getTodayDateString } from '../../../core/services/mock-data';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-hr-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent, BadgeComponent],
  template: `
    <div class="space-y-6">
      <!-- HR Command Header -->
      <div class="glass-panel p-6 sm:p-8 relative overflow-hidden">
        <div class="absolute -right-20 -top-20 w-80 h-80 bg-violet/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -left-20 -bottom-20 w-80 h-80 bg-electric/20 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                HR Operations & Talent Command
              </span>
              <span class="text-text-muted">•</span>
              <span class="text-xs font-mono text-text-muted">{{ todayDateFormatted }}</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Studio Command Center
            </h1>
            <p class="text-xs sm:text-sm text-text-secondary mt-1">
              Real-time monitoring across 7 Clouds creative talent, attendance, deadlines & workflows.
            </p>
          </div>

          <!-- Quick Action Buttons -->
          <div class="flex items-center gap-2 flex-wrap">
            <a
              routerLink="/employees"
              class="btn-secondary text-xs"
            >
              <app-icon name="plus" [size]="14"></app-icon>
              <span>Add Employee</span>
            </a>
            <a
              routerLink="/reports"
              class="btn-primary text-xs"
            >
              <app-icon name="download" [size]="14"></app-icon>
              <span>Export Reports</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Key Metrics Row (Clickable to view detailed records) -->
      <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Total Employees -->
        <a
          routerLink="/employees"
          class="glass-panel-interactive p-4 sm:p-5 block cursor-pointer group"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-mono uppercase text-text-muted">Total Creatives</span>
            <div class="w-8 h-8 rounded-lg bg-surface-secondary flex items-center justify-center text-text-muted group-hover:text-electric transition-colors">
              <app-icon name="users" [size]="16"></app-icon>
            </div>
          </div>
          <div class="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
            {{ totalEmployeesCount }}
          </div>
          <div class="text-[11px] text-text-muted mt-1 flex items-center gap-1">
            <span class="text-emerald-400 font-semibold">100%</span>
            <span>studio active status</span>
          </div>
        </a>

        <!-- Present Today -->
        <a
          routerLink="/attendance"
          class="glass-panel-interactive p-4 sm:p-5 block cursor-pointer group"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-mono uppercase text-text-muted">Present Today</span>
            <div class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all">
              <app-icon name="clock" [size]="16"></app-icon>
            </div>
          </div>
          <div class="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
            {{ presentTodayCount }}
          </div>
          <div class="text-[11px] text-text-muted mt-1 flex items-center gap-1">
            <span class="text-emerald-400 font-semibold">{{ attendanceRate }}%</span>
            <span>studio presence rate</span>
          </div>
        </a>

        <!-- Pending Leave Requests -->
        <a
          routerLink="/leave"
          class="glass-panel-interactive p-4 sm:p-5 block cursor-pointer group"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-mono uppercase text-text-muted">Pending Leaves</span>
            <div class="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:shadow-[0_0_10px_rgba(245,158,11,0.3)] transition-all">
              <app-icon name="briefcase" [size]="16"></app-icon>
            </div>
          </div>
          <div class="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono tracking-tight">
            {{ pendingLeavesCount }}
          </div>
          <div class="text-[11px] text-text-muted mt-1">
            Requires HR review & approval
          </div>
        </a>

        <!-- Active Tasks In Progress -->
        <a
          routerLink="/tasks"
          class="glass-panel-interactive p-4 sm:p-5 block cursor-pointer group"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-mono uppercase text-text-muted">In Progress Tasks</span>
            <div class="w-8 h-8 rounded-lg bg-electric/10 flex items-center justify-center text-electric group-hover:shadow-glow-electric transition-all">
              <app-icon name="check-square" [size]="16"></app-icon>
            </div>
          </div>
          <div class="text-2xl sm:text-3xl font-extrabold text-electric font-mono tracking-tight">
            {{ inProgressTasksCount }}
          </div>
          <div class="text-[11px] text-text-muted mt-1 flex items-center gap-1">
            <span class="text-rose-400 font-medium" *ngIf="overdueTasksCount > 0">{{ overdueTasksCount }} overdue</span>
            <span *ngIf="overdueTasksCount === 0" class="text-emerald-400 font-medium">All timelines on track</span>
          </div>
        </a>
      </div>

      <!-- Middle Grid: Live Team Attendance Roster & Pending Approvals -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Team Live Attendance Status -->
        <div class="glass-panel p-6 lg:col-span-2">
          <div class="flex items-center justify-between pb-4 border-b border-surface-border mb-4">
            <div class="flex items-center gap-2">
              <app-icon name="clock" [size]="18" extraClass="text-emerald-400"></app-icon>
              <h2 class="text-sm font-bold text-white uppercase tracking-wider font-mono">Today's Team Check-In Status</h2>
            </div>
            <a routerLink="/attendance" class="text-xs text-electric hover:underline font-medium">Full Attendance Log →</a>
          </div>

          <!-- Roster Table / List -->
          <div class="space-y-2.5">
            <div
              *ngFor="let member of teamRoster"
              class="flex items-center justify-between p-3 rounded-xl bg-surface-secondary/40 hover:bg-surface-secondary/70 border border-surface-border transition-all text-xs"
            >
              <div class="flex items-center gap-3 min-w-0">
                <img [src]="member.avatar" [alt]="member.name" class="w-8 h-8 rounded-full object-cover shrink-0" />
                <div class="min-w-0">
                  <div class="font-semibold text-white flex items-center gap-2 truncate">
                    <span>{{ member.name }}</span>
                    <span class="text-[10px] text-text-muted font-mono">{{ member.employeeId }}</span>
                  </div>
                  <div class="text-[11px] text-text-secondary truncate">{{ member.designation }}</div>
                </div>
              </div>

              <!-- Status & Check In Time -->
              <div class="flex items-center gap-4 shrink-0">
                <div class="text-right hidden sm:block">
                  <div class="font-mono text-white text-xs">
                    {{ member.todayRecord?.checkInTime ? formatTime(member.todayRecord!.checkInTime!) : 'No Check-In' }}
                  </div>
                  <div class="text-[10px] text-text-muted">
                    {{ member.todayRecord?.workLocation || 'Standard Cutoff 10:30' }}
                  </div>
                </div>

                <app-badge
                  [label]="member.todayRecord?.status || 'Pending'"
                  [variant]="member.todayRecord?.status || 'warning'"
                ></app-badge>
              </div>
            </div>
          </div>
        </div>

        <!-- Pending Leave Approvals Widget -->
        <div class="glass-panel p-6 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-4 border-b border-surface-border mb-4">
              <div class="flex items-center gap-2">
                <app-icon name="briefcase" [size]="18" extraClass="text-amber-400"></app-icon>
                <h2 class="text-sm font-bold text-white uppercase tracking-wider font-mono">Pending Leave Requests</h2>
              </div>
              <span class="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-mono font-bold">
                {{ pendingLeaves.length }}
              </span>
            </div>

            <div class="space-y-3">
              <div
                *ngFor="let req of pendingLeaves"
                class="p-3.5 rounded-xl bg-surface-secondary/50 border border-surface-border text-xs"
              >
                <div class="flex items-start justify-between gap-2 mb-1.5">
                  <span class="font-bold text-white">{{ req.employeeName }}</span>
                  <app-badge [label]="req.leaveType" variant="warning"></app-badge>
                </div>
                <div class="text-[11px] text-text-secondary font-mono mb-2">
                  {{ req.startDate }} to {{ req.endDate }} ({{ req.daysCount }} days)
                </div>
                <p class="text-[11px] text-text-muted italic bg-surface-tertiary/50 p-2 rounded-lg mb-3">
                  "{{ req.reason }}"
                </p>

                <!-- 1-Click Approve / Reject -->
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    (click)="quickApproveLeave(req)"
                    class="flex-1 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white font-semibold transition-all text-xs cursor-pointer text-center"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    (click)="quickRejectLeave(req)"
                    class="flex-1 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white font-semibold transition-all text-xs cursor-pointer text-center"
                  >
                    Reject
                  </button>
                </div>
              </div>

              <div *ngIf="pendingLeaves.length === 0" class="py-8 text-center text-xs text-text-muted">
                No leave requests awaiting approval. All clear!
              </div>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-surface-border text-center">
            <a routerLink="/leave" class="text-xs text-electric hover:underline font-medium">
              View all leave records & history →
            </a>
          </div>
        </div>
      </div>

      <!-- Bottom Row: Recent Studio Activity & Audit Log -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Work Reports Stream -->
        <div class="glass-panel p-6">
          <div class="flex items-center justify-between pb-4 border-b border-surface-border mb-4">
            <div class="flex items-center gap-2">
              <app-icon name="file-text" [size]="18" extraClass="text-electric"></app-icon>
              <h2 class="text-sm font-bold text-white uppercase tracking-wider font-mono">Recent Daily Work Reports</h2>
            </div>
            <a routerLink="/work-reports" class="text-xs text-electric hover:underline font-medium">All Reports →</a>
          </div>

          <div class="space-y-3">
            <div
              *ngFor="let rep of recentReports.slice(0, 3)"
              class="p-3.5 rounded-xl bg-surface-secondary/40 border border-surface-border text-xs"
            >
              <div class="flex items-center justify-between mb-1.5">
                <div class="font-bold text-white flex items-center gap-2">
                  <span>{{ rep.employeeName }}</span>
                  <span class="text-[10px] text-text-muted font-mono">({{ rep.category }})</span>
                </div>
                <span class="font-mono text-emerald-400 font-bold">{{ rep.timeSpentHours }}h</span>
              </div>
              <div class="text-[11px] font-mono text-electric mb-1">{{ rep.projectName }}</div>
              <p class="text-text-secondary line-clamp-2 text-[11px] leading-relaxed">{{ rep.workDescription }}</p>
            </div>
          </div>
        </div>

        <!-- HR Security & Audit Log Stream -->
        <div class="glass-panel p-6">
          <div class="flex items-center justify-between pb-4 border-b border-surface-border mb-4">
            <div class="flex items-center gap-2">
              <app-icon name="shield" [size]="18" extraClass="text-violet-400"></app-icon>
              <h2 class="text-sm font-bold text-white uppercase tracking-wider font-mono">HR Action Audit Trail</h2>
            </div>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300">
              Immutable
            </span>
          </div>

          <div class="space-y-3">
            <div
              *ngFor="let log of auditLogs.slice(0, 4)"
              class="p-3 rounded-xl bg-surface-secondary/30 border border-surface-border text-xs"
            >
              <div class="flex items-center justify-between mb-1">
                <span class="font-mono text-violet-300 font-bold text-[11px]">{{ log.action }}</span>
                <span class="text-[10px] text-text-muted font-mono">{{ log.timestamp | date:'shortTime' }}</span>
              </div>
              <p class="text-text-secondary text-[11px]">{{ log.details }}</p>
              <div class="mt-1 text-[10px] text-text-muted">By {{ log.actorName }}</div>
            </div>

            <div *ngIf="auditLogs.length === 0" class="py-8 text-center text-xs text-text-muted">
              No audit logs recorded yet.
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HrDashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  totalEmployeesCount = 0;
  presentTodayCount = 0;
  pendingLeavesCount = 0;
  inProgressTasksCount = 0;
  overdueTasksCount = 0;
  attendanceRate = 0;

  todayDateFormatted = '';
  teamRoster: {
    id: string;
    employeeId: string;
    name: string;
    avatar: string;
    designation: string;
    todayRecord?: AttendanceRecord;
  }[] = [];

  pendingLeaves: LeaveRequest[] = [];
  recentReports: DailyWorkReport[] = [];
  auditLogs: AuditLog[] = [];

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
    this.todayDateFormatted = now.toLocaleDateString([], {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    this.subs.push(
      this.authService.currentUser$.subscribe(u => (this.currentUser = u)),
      this.dataService.getUsers().subscribe(users => {
        const employees = users.filter(u => u.status === 'active');
        this.totalEmployeesCount = employees.length;
        this.buildRoster(employees, this.dataService.getAttendanceSnapshot());
      }),
      this.attendanceService.getAllAttendance().subscribe(att => {
        const today = getTodayDateString();
        const todayRecords = att.filter(r => r.date === today && r.checkInTime);
        this.presentTodayCount = todayRecords.length;

        const totalActive = this.totalEmployeesCount || 6;
        this.attendanceRate = Math.round((this.presentTodayCount / totalActive) * 100);

        this.buildRoster(this.dataService.getUsersSnapshot(), att);
      }),
      this.leaveService.getAllLeaves().subscribe(leaves => {
        this.pendingLeaves = leaves.filter(l => l.status === 'Pending');
        this.pendingLeavesCount = this.pendingLeaves.length;
      }),
      this.taskService.getAllTasks().subscribe(tasks => {
        const categorized = this.taskService.categorizeTasks(tasks);
        this.inProgressTasksCount = tasks.filter(t => t.status === 'In Progress').length;
        this.overdueTasksCount = categorized.overdueTasks.length;
      }),
      this.dataService.getReports().subscribe(reps => {
        this.recentReports = reps;
      }),
      this.dataService.getAuditLogs().subscribe(logs => {
        this.auditLogs = logs;
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  private buildRoster(users: User[], attendanceRecords: AttendanceRecord[]): void {
    const today = getTodayDateString();
    this.teamRoster = users
      .filter(u => u.role !== 'admin')
      .map(u => {
        const rec = attendanceRecords.find(a => a.userId === u.id && a.date === today);
        return {
          id: u.id,
          employeeId: u.employeeId,
          name: u.name,
          avatar: u.avatar,
          designation: u.designation,
          todayRecord: rec
        };
      });
  }

  quickApproveLeave(req: LeaveRequest): void {
    if (!this.currentUser) return;
    this.leaveService.reviewLeaveRequest(
      req.id,
      'Approved',
      'Approved directly from HR Command Center.',
      this.currentUser
    );
    this.toastService.success(`Approved ${req.daysCount} days leave for ${req.employeeName}.`);
  }

  quickRejectLeave(req: LeaveRequest): void {
    if (!this.currentUser) return;
    const reason = prompt('Enter rejection reason:') || 'Dates conflict with ongoing production deadline.';
    this.leaveService.reviewLeaveRequest(req.id, 'Rejected', reason, this.currentUser);
    this.toastService.warning(`Rejected leave for ${req.employeeName}.`);
  }

  formatTime(isoStr: string): string {
    return new Date(isoStr).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
