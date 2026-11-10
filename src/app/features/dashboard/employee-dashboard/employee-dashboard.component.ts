import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { AttendanceService } from '../../../core/services/attendance.service';
import { TaskService } from '../../../core/services/task.service';
import { LeaveService } from '../../../core/services/leave.service';
import { ToastService } from '../../../core/services/toast.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import {
  User,
  AttendanceRecord,
  TaskItem,
  LeaveRequest
} from '../../../core/models';
import {
  getTodayDateStringIST,
  getCurrentISTTimeString,
  formatTimeIST
} from '../../../core/services/ist-date.utils';
import { Subscription } from 'rxjs';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent, BadgeComponent],
  template: `
    <div class="space-y-6 max-w-5xl mx-auto">
      <!-- Welcome Header -->
      <div class="glass-panel p-6 sm:p-8 relative overflow-hidden">
        <div class="absolute -right-20 -top-20 w-80 h-80 bg-electric/15 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="text-xs font-mono uppercase tracking-widest text-electric font-semibold">
                {{ greetingTime }}
              </span>
              <span class="text-text-muted">•</span>
              <span class="text-xs font-mono text-text-muted">{{ todayDateFormatted }} (IST)</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, <span class="gradient-brand-text">{{ currentUser?.name }}</span>
            </h1>
            <p class="text-xs sm:text-sm text-text-secondary mt-1 font-medium">
              {{ currentUser?.designation }} · {{ currentUser?.department }}
            </p>
          </div>

          <div class="flex items-center gap-3">
            <div class="px-4 py-2.5 rounded-2xl bg-surface-secondary/80 border border-surface-border text-center">
              <div class="text-[10px] text-text-muted font-mono uppercase">Logged Today</div>
              <div class="text-lg font-bold text-emerald-400 font-mono">{{ liveWorkingHours }}h</div>
            </div>
            <div class="px-4 py-2.5 rounded-2xl bg-surface-secondary/80 border border-surface-border text-center">
              <div class="text-[10px] text-text-muted font-mono uppercase">Assigned Tasks</div>
              <div class="text-lg font-bold text-white font-mono">{{ myTasks.length }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ATTENDANCE TERMINAL: 2 Clear Primary Buttons -->
      <div class="glass-panel p-6 sm:p-8 relative overflow-hidden">
        <div class="glow-border-blue"></div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <app-icon name="clock" [size]="18" extraClass="text-electric"></app-icon>
                <h2 class="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Today's Attendance
                </h2>
              </div>
              <app-badge
                [label]="todayRecord?.status || 'Not Checked In'"
                [variant]="todayRecord?.status || 'warning'"
              ></app-badge>
            </div>

            <!-- Digital Clock -->
            <div class="p-3.5 rounded-2xl bg-surface-secondary/70 border border-surface-border">
              <div class="text-3xl font-extrabold text-white font-mono tracking-widest">
                {{ liveClock }}
              </div>
              <div class="text-[10px] text-text-muted font-mono mt-0.5">Indian Standard Time</div>
            </div>

            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="p-2.5 rounded-xl bg-surface-secondary/40 border border-surface-border">
                <span class="text-text-muted text-[10px] block">Check-In</span>
                <span class="font-mono text-white font-bold">
                  {{ todayRecord?.checkInTime ? formatTime(todayRecord!.checkInTime!) : '--:--' }}
                </span>
              </div>
              <div class="p-2.5 rounded-xl bg-surface-secondary/40 border border-surface-border">
                <span class="text-text-muted text-[10px] block">Check-Out</span>
                <span class="font-mono text-white font-bold">
                  {{ todayRecord?.checkOutTime ? formatTime(todayRecord!.checkOutTime!) : (todayRecord?.checkInTime ? 'Active' : '--:--') }}
                </span>
              </div>
            </div>
          </div>

          <!-- The Two Buttons -->
          <div class="space-y-3">
            <button
              type="button"
              (click)="handleCheckIn()"
              [disabled]="isCheckInDisabled"
              class="w-full py-3.5 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-md"
              [ngClass]="isCheckInDisabled ? 'bg-surface-secondary/40 text-text-muted border border-surface-border cursor-not-allowed opacity-40' : 'bg-gradient-to-r from-electric to-violet text-white hover:shadow-glow-electric active:scale-[0.98]'"
            >
              <app-icon name="play" [size]="16"></app-icon>
              <span>[ CHECK IN ]</span>
            </button>

            <button
              type="button"
              (click)="handleCheckOut()"
              [disabled]="isCheckOutDisabled"
              class="w-full py-3.5 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-md"
              [ngClass]="isCheckOutDisabled ? 'bg-surface-secondary/40 text-text-muted border border-surface-border cursor-not-allowed opacity-40' : 'bg-gradient-to-r from-rose-600 to-rose-700 text-white hover:shadow-[0_0_20px_rgba(225,29,72,0.4)] active:scale-[0.98]'"
            >
              <app-icon name="square" [size]="16"></app-icon>
              <span>[ CHECK OUT ]</span>
            </button>

            <div *ngIf="todayRecord?.checkOutTime" class="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
              <span class="text-xs font-bold text-blue-400">Shift Completed ({{ todayRecord?.workingHours }}h logged)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ASSIGNED TASKS: With [ Not Started ] [ In Progress ] [ Completed ] Status Buttons -->
      <div class="glass-panel p-6">
        <div class="flex items-center justify-between pb-4 border-b border-surface-border mb-4">
          <div class="flex items-center gap-2">
            <app-icon name="check-square" [size]="18" extraClass="text-electric"></app-icon>
            <h2 class="text-sm font-bold text-white uppercase tracking-wider font-mono">
              My Assigned Tasks
            </h2>
            <span class="text-xs px-2 py-0.5 rounded-full bg-surface-secondary text-text-secondary font-mono">
              {{ myTasks.length }}
            </span>
          </div>

          <a routerLink="/tasks" class="text-xs text-electric hover:underline font-medium">
            View All Tasks →
          </a>
        </div>

        <div class="space-y-3">
          <div
            *ngFor="let task of myTasks"
            class="p-4 rounded-xl bg-surface-secondary/40 border border-surface-border space-y-3"
          >
            <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <div>
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surface-tertiary text-text-muted">
                    {{ task.projectName }}
                  </span>
                  <app-badge [label]="task.priority" [variant]="task.priority"></app-badge>
                  <span class="text-[10px] font-mono text-text-muted font-bold">
                    Deadline: {{ task.dueDate }}
                  </span>
                </div>
                <h3 class="text-sm font-bold text-white">{{ task.title }}</h3>
              </div>

              <div class="text-[11px] font-mono text-text-muted">
                {{ task.status }}
              </div>
            </div>

            <!-- Simplified Status Buttons -->
            <div class="pt-2 border-t border-surface-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="inline-flex items-center gap-1.5 bg-surface-secondary/80 p-1 rounded-xl border border-surface-border text-xs">
                <button
                  type="button"
                  (click)="updateStatus(task, 'Not Started')"
                  class="px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer"
                  [ngClass]="task.status === 'Not Started' || task.status === 'Pending' ? 'bg-slate-700 text-white' : 'text-text-muted hover:text-white'"
                >
                  Not Started
                </button>
                <button
                  type="button"
                  (click)="updateStatus(task, 'In Progress')"
                  class="px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer"
                  [ngClass]="task.status === 'In Progress' ? 'bg-blue-600 text-white shadow-sm' : 'text-text-muted hover:text-white'"
                >
                  In Progress
                </button>
                <button
                  type="button"
                  (click)="updateStatus(task, 'Completed')"
                  class="px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer"
                  [ngClass]="task.status === 'Completed' ? 'bg-emerald-600 text-white shadow-sm' : 'text-text-muted hover:text-white'"
                >
                  Completed
                </button>
              </div>

              <span *ngIf="task.completedAt" class="text-[10px] text-emerald-400 font-mono">
                ✓ Completed
              </span>
            </div>
          </div>

          <div *ngIf="myTasks.length === 0" class="py-8 text-center text-xs text-text-muted">
            No active tasks assigned to you right now.
          </div>
        </div>
      </div>

      <!-- PERSONAL ATTENDANCE HISTORY -->
      <div class="glass-panel p-6">
        <div class="flex items-center justify-between pb-4 border-b border-surface-border mb-4">
          <div class="flex items-center gap-2">
            <app-icon name="clock" [size]="18" extraClass="text-electric"></app-icon>
            <h2 class="text-sm font-bold text-white uppercase tracking-wider font-mono">
              My Attendance History
            </h2>
          </div>
          <a routerLink="/attendance" class="text-xs text-electric hover:underline font-medium">
            Full Log →
          </a>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-surface-secondary/60 text-text-muted font-mono uppercase text-[10px] border-b border-surface-border">
              <tr>
                <th class="py-2.5 px-3">Date</th>
                <th class="py-2.5 px-3">Check-In</th>
                <th class="py-2.5 px-3">Check-Out</th>
                <th class="py-2.5 px-3 text-right">Hours</th>
                <th class="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-border">
              <tr *ngFor="let h of myAttendanceHistory.slice(0, 5)" class="hover:bg-surface-secondary/30">
                <td class="py-2.5 px-3 font-mono text-text-secondary">{{ h.date }}</td>
                <td class="py-2.5 px-3 font-mono text-white">{{ h.checkInTime ? formatTime(h.checkInTime) : '—' }}</td>
                <td class="py-2.5 px-3 font-mono text-text-secondary">{{ h.checkOutTime ? formatTime(h.checkOutTime) : '—' }}</td>
                <td class="py-2.5 px-3 font-mono text-right font-bold text-emerald-400">{{ h.workingHours }}h</td>
                <td class="py-2.5 px-3"><app-badge [label]="h.status" [variant]="h.status"></app-badge></td>
              </tr>
              <tr *ngIf="myAttendanceHistory.length === 0">
                <td colspan="5" class="py-6 text-center text-text-muted">No attendance history yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class EmployeeDashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  todayRecord: AttendanceRecord | undefined;
  myTasks: TaskItem[] = [];
  myAttendanceHistory: AttendanceRecord[] = [];

  liveClock = '';
  liveWorkingHours = 0;
  greetingTime = 'Good Morning';
  todayDateFormatted = '';

  private timerInterval: any;
  private subs: Subscription[] = [];
  private userSubs: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private attendanceService: AttendanceService,
    private taskService: TaskService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.updateClock();
    this.timerInterval = setInterval(() => this.updateClock(), 1000);

    const now = new Date();
    this.todayDateFormatted = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    }).format(now);

    const hours = now.getHours();
    if (hours < 12) this.greetingTime = 'Good Morning';
    else if (hours < 17) this.greetingTime = 'Good Afternoon';
    else this.greetingTime = 'Good Evening';

    this.subs.push(
      this.authService.currentUser$.subscribe(u => {
        this.currentUser = u;
        if (u) {
          this.loadUserData(u.id);
        } else {
          this.userSubs.forEach(s => s.unsubscribe());
          this.userSubs = [];
        }
      })
    );
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.userSubs.forEach(s => s.unsubscribe());
    this.subs.forEach(s => s.unsubscribe());
  }

  private loadUserData(userId: string): void {
    this.userSubs.forEach(s => s.unsubscribe());
    this.userSubs = [
      this.attendanceService.getTodayRecord(userId).subscribe(rec => {
        this.todayRecord = rec;
        this.updateWorkingHours();
      }),
      this.attendanceService.getUserAttendance(userId).subscribe(history => {
        this.myAttendanceHistory = history;
      }),
      this.taskService.getUserTasks(userId).subscribe(tasks => {
        this.myTasks = tasks;
      })
    ];
  }

  private updateClock(): void {
    this.liveClock = getCurrentISTTimeString();
    this.updateWorkingHours();
  }

  private updateWorkingHours(): void {
    if (this.todayRecord?.checkInTime) {
      this.liveWorkingHours = this.attendanceService.calculateLiveHours(
        this.todayRecord.checkInTime,
        this.todayRecord.checkOutTime
      );
    } else {
      this.liveWorkingHours = 0;
    }
  }

  get isCheckInDisabled(): boolean {
    return !!this.todayRecord?.checkInTime;
  }

  get isCheckOutDisabled(): boolean {
    return !this.todayRecord?.checkInTime || !!this.todayRecord?.checkOutTime;
  }

  handleCheckIn(): void {
    if (!this.currentUser) return;
    try {
      this.attendanceService.checkIn(this.currentUser, 'Studio / On-Site');
      this.toastService.success(`Checked in at ${this.liveClock} IST!`);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch (err: any) {
      this.toastService.error(err.message || 'Check-in failed');
    }
  }

  handleCheckOut(): void {
    if (!this.todayRecord) return;
    try {
      this.attendanceService.checkOut(this.todayRecord.id);
      this.toastService.success(`Checked out at ${this.liveClock} IST! Total: ${this.todayRecord.workingHours}h.`);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch (err: any) {
      this.toastService.error(err.message || 'Check-out failed');
    }
  }

  updateStatus(task: TaskItem, newStatus: 'Not Started' | 'In Progress' | 'Completed'): void {
    if (!this.currentUser) return;
    try {
      this.taskService.setTaskStatus(task.id, newStatus, this.currentUser);
      this.toastService.success(`Task status changed to [ ${newStatus} ]`);
      if (newStatus === 'Completed') {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
      }
    } catch (err: any) {
      this.toastService.error(err.message || 'Error updating status');
    }
  }

  formatTime(isoStr?: string): string {
    return formatTimeIST(isoStr);
  }
}
