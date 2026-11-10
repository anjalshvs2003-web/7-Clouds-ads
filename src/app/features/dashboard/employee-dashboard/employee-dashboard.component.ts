import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { AttendanceService } from '../../../core/services/attendance.service';
import { TaskService } from '../../../core/services/task.service';
import { LeaveService } from '../../../core/services/leave.service';
import { AnnouncementService } from '../../../core/services/announcement.service';
import { ToastService } from '../../../core/services/toast.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import {
  User,
  AttendanceRecord,
  TaskItem,
  LeaveRequest,
  Announcement,
  WorkLocation
} from '../../../core/models';
import { getTodayDateString } from '../../../core/services/mock-data';
import { Subscription } from 'rxjs';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent, BadgeComponent, ModalComponent],
  template: `
    <div class="space-y-6">
      <!-- Top Welcome Banner with Gradient Glow -->
      <div class="glass-panel p-6 sm:p-8 relative overflow-hidden">
        <div class="absolute -right-20 -top-20 w-80 h-80 bg-electric/15 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -left-20 -bottom-20 w-80 h-80 bg-violet/15 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="text-xs font-mono uppercase tracking-widest text-electric font-semibold">
                {{ greetingTime }}
              </span>
              <span class="text-text-muted">•</span>
              <span class="text-xs font-mono text-text-muted">{{ currentDateStr }}</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, <span class="gradient-brand-text">{{ currentUser?.name }}</span>
            </h1>
            <p class="text-xs sm:text-sm text-text-secondary mt-1 font-medium">
              {{ currentUser?.designation }} · {{ currentUser?.department }}
            </p>
          </div>

          <!-- Quick Stat Chips -->
          <div class="flex flex-wrap items-center gap-3">
            <div class="px-4 py-2.5 rounded-2xl bg-surface-secondary/80 border border-surface-border backdrop-blur-sm">
              <div class="text-[10px] text-text-muted font-mono uppercase">Tasks Due Today</div>
              <div class="text-lg font-bold text-white font-mono">{{ todayTasks.length }}</div>
            </div>

            <div class="px-4 py-2.5 rounded-2xl bg-surface-secondary/80 border border-surface-border backdrop-blur-sm">
              <div class="text-[10px] text-text-muted font-mono uppercase">Casual Leave Bal.</div>
              <div class="text-lg font-bold text-electric font-mono">{{ currentUser?.leaveBalances?.casual || 0 }}d</div>
            </div>

            <div class="px-4 py-2.5 rounded-2xl bg-surface-secondary/80 border border-surface-border backdrop-blur-sm">
              <div class="text-[10px] text-text-muted font-mono uppercase">Total Shift Hours</div>
              <div class="text-lg font-bold text-emerald-400 font-mono">{{ liveWorkingHours }}h</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Grid: Attendance Terminal & Daily Task Priority -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Attendance Control Terminal -->
        <div class="glass-panel p-6 flex flex-col justify-between relative overflow-hidden">
          <div class="glow-border-blue"></div>

          <div>
            <div class="flex items-center justify-between pb-4 border-b border-surface-border mb-5">
              <div class="flex items-center gap-2">
                <app-icon name="clock" [size]="18" extraClass="text-electric"></app-icon>
                <h2 class="text-sm font-bold text-white uppercase tracking-wider font-mono">Attendance Terminal</h2>
              </div>
              <app-badge
                [label]="todayAttendance?.status || 'Not Checked In'"
                [variant]="todayAttendance?.status || 'warning'"
              ></app-badge>
            </div>

            <!-- Digital Clock Display -->
            <div class="text-center py-4 bg-surface-secondary/60 rounded-2xl border border-surface-border mb-6">
              <div class="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-widest text-shadow-glow">
                {{ liveClock }}
              </div>
              <div class="text-[11px] text-text-muted font-mono mt-1 uppercase tracking-wider">
                {{ currentTimeZone }}
              </div>
            </div>

            <!-- Attendance Info Details -->
            <div class="space-y-3 mb-6 text-xs">
              <div class="flex items-center justify-between p-2.5 rounded-xl bg-surface-secondary/40 border border-surface-border/50">
                <span class="text-text-muted">Check-In Time</span>
                <span class="font-mono text-white font-medium">
                  {{ todayAttendance?.checkInTime ? formatTime(todayAttendance!.checkInTime!) : '--:--' }}
                </span>
              </div>

              <div class="flex items-center justify-between p-2.5 rounded-xl bg-surface-secondary/40 border border-surface-border/50">
                <span class="text-text-muted">Check-Out Time</span>
                <span class="font-mono text-white font-medium">
                  {{ todayAttendance?.checkOutTime ? formatTime(todayAttendance!.checkOutTime!) : (todayAttendance?.checkInTime ? 'Active Session' : '--:--') }}
                </span>
              </div>

              <div class="flex items-center justify-between p-2.5 rounded-xl bg-surface-secondary/40 border border-surface-border/50">
                <span class="text-text-muted">Working Location</span>
                <span class="text-text-secondary font-medium">
                  {{ todayAttendance?.workLocation || 'Standard Studio' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Check-in / Check-out Buttons -->
          <div>
            <div *ngIf="!todayAttendance?.checkInTime">
              <button
                (click)="openCheckInModal()"
                class="w-full btn-primary py-3 font-semibold text-sm shadow-glow-electric cursor-pointer"
              >
                <app-icon name="play" [size]="16"></app-icon>
                <span>Check-In for Today</span>
              </button>
            </div>

            <div *ngIf="todayAttendance?.checkInTime && !todayAttendance?.checkOutTime" class="space-y-2">
              <div class="text-center mb-1">
                <span class="text-[11px] text-emerald-400 font-mono flex items-center justify-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Session Active ({{ liveWorkingHours }} hrs logged)
                </span>
              </div>
              <button
                (click)="handleCheckOut()"
                class="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-white bg-rose-600/90 hover:bg-rose-600 transition-all shadow-[0_0_20px_rgba(225,29,72,0.3)] cursor-pointer"
              >
                <app-icon name="square" [size]="16"></app-icon>
                <span>Check-Out Shift</span>
              </button>
            </div>

            <div *ngIf="todayAttendance?.checkOutTime" class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <p class="text-xs font-semibold text-emerald-400">Shift Completed</p>
              <p class="text-[11px] text-text-muted mt-0.5">Total {{ todayAttendance?.workingHours }} hours logged today.</p>
            </div>
          </div>
        </div>

        <!-- Today's Priority Creative Tasks -->
        <div class="glass-panel p-6 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-4 border-b border-surface-border mb-4">
              <div class="flex items-center gap-2">
                <app-icon name="check-square" [size]="18" extraClass="text-electric"></app-icon>
                <h2 class="text-sm font-bold text-white uppercase tracking-wider font-mono">Today's Focus Tasks</h2>
                <span class="text-xs px-2 py-0.5 rounded-full bg-surface-secondary text-text-secondary font-mono">
                  {{ myTasks.length }} total
                </span>
              </div>
              <a routerLink="/tasks" class="text-xs text-electric hover:underline font-medium flex items-center gap-1">
                <span>View Board</span>
                <app-icon name="arrow-right" [size]="14"></app-icon>
              </a>
            </div>

            <!-- Task List -->
            <div class="space-y-3">
              <div
                *ngFor="let task of myTasks.slice(0, 4)"
                class="p-4 rounded-xl bg-surface-secondary/50 hover:bg-surface-secondary/80 border border-surface-border hover:border-surface-border-bright transition-all group"
              >
                <div class="flex items-start justify-between gap-3 mb-2">
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2 mb-1 flex-wrap">
                      <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surface-tertiary text-text-muted">
                        {{ task.projectName }}
                      </span>
                      <app-badge [label]="task.priority" [variant]="task.priority"></app-badge>
                      <app-badge [label]="task.status" [variant]="task.status"></app-badge>
                    </div>
                    <h3 class="text-sm font-semibold text-white group-hover:text-electric-light transition-colors line-clamp-1">
                      {{ task.title }}
                    </h3>
                  </div>

                  <!-- Quick Timer Action -->
                  <div class="flex items-center gap-1.5 shrink-0">
                    <button
                      *ngIf="!task.timerRunning && task.status !== 'Completed'"
                      (click)="toggleTaskTimer(task)"
                      class="p-2 rounded-lg bg-electric/15 hover:bg-electric text-electric-light hover:text-white transition-all cursor-pointer"
                      title="Start Task Timer"
                    >
                      <app-icon name="play" [size]="14"></app-icon>
                    </button>
                    <button
                      *ngIf="task.timerRunning"
                      (click)="toggleTaskTimer(task)"
                      class="p-2 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-white transition-all animate-pulse cursor-pointer"
                      title="Pause Timer"
                    >
                      <app-icon name="pause" [size]="14"></app-icon>
                    </button>
                    <button
                      *ngIf="task.status !== 'Completed'"
                      (click)="markTaskDone(task)"
                      class="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white transition-all cursor-pointer"
                      title="Complete Task"
                    >
                      <app-icon name="check" [size]="14"></app-icon>
                    </button>
                  </div>
                </div>

                <!-- Progress Bar & Hours -->
                <div class="flex items-center gap-4 text-xs mt-3 pt-2 border-t border-surface-border/40">
                  <div class="flex-1">
                    <div class="h-1.5 w-full bg-surface-tertiary rounded-full overflow-hidden">
                      <div
                        class="h-full bg-gradient-to-r from-electric to-violet rounded-full transition-all duration-300"
                        [style.width.%]="task.completionPercentage"
                      ></div>
                    </div>
                  </div>
                  <span class="text-text-muted font-mono text-[11px] shrink-0">
                    {{ task.completionPercentage }}%
                  </span>
                  <span class="text-text-secondary font-mono text-[11px] shrink-0">
                    {{ task.actualHours }}h / {{ task.estimatedHours }}h
                  </span>
                </div>
              </div>

              <div *ngIf="myTasks.length === 0" class="py-12 text-center text-text-muted text-xs">
                No active tasks assigned. Enjoy your creative focus time!
              </div>
            </div>
          </div>

          <!-- Bottom Footer Quick Links -->
          <div class="mt-4 pt-3 border-t border-surface-border flex items-center justify-between text-xs">
            <span class="text-text-muted">Daily Completion Rate</span>
            <span class="font-mono font-bold text-electric">{{ completionStats.completionRate }}% Done</span>
          </div>
        </div>
      </div>

      <!-- Secondary Row: Pinned Announcements & Upcoming Studio Leaves -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Announcements Feed -->
        <div class="glass-panel p-6">
          <div class="flex items-center justify-between pb-4 border-b border-surface-border mb-4">
            <div class="flex items-center gap-2">
              <app-icon name="megaphone" [size]="18" extraClass="text-violet-400"></app-icon>
              <h2 class="text-sm font-bold text-white uppercase tracking-wider font-mono">Studio Announcements</h2>
            </div>
            <a routerLink="/announcements" class="text-xs text-violet-400 hover:underline font-medium">All Notes →</a>
          </div>

          <div class="space-y-3">
            <div
              *ngFor="let ann of announcements.slice(0, 3)"
              class="p-4 rounded-xl bg-surface-secondary/40 border border-surface-border text-xs"
            >
              <div class="flex items-center justify-between gap-2 mb-1.5">
                <span class="font-bold text-white text-sm flex items-center gap-1.5">
                  <app-icon *ngIf="ann.pinned" name="pin" [size]="14" extraClass="text-amber-400"></app-icon>
                  {{ ann.title }}
                </span>
                <app-badge [label]="ann.priority" [variant]="ann.priority"></app-badge>
              </div>
              <p class="text-text-secondary line-clamp-2 leading-relaxed">{{ ann.content }}</p>
              <div class="mt-2 text-[10px] text-text-muted font-mono flex items-center gap-2">
                <span>By {{ ann.publishedByName }}</span>
                <span>•</span>
                <span>{{ ann.publishedAt | date:'mediumDate' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Leave Requests & Balance Quick Overview -->
        <div class="glass-panel p-6">
          <div class="flex items-center justify-between pb-4 border-b border-surface-border mb-4">
            <div class="flex items-center gap-2">
              <app-icon name="briefcase" [size]="18" extraClass="text-electric"></app-icon>
              <h2 class="text-sm font-bold text-white uppercase tracking-wider font-mono">Leave Status & Balances</h2>
            </div>
            <a routerLink="/leave" class="text-xs text-electric hover:underline font-medium">Request Leave →</a>
          </div>

          <!-- Leave Balances -->
          <div class="grid grid-cols-3 gap-3 mb-5">
            <div class="p-3 rounded-xl bg-surface-secondary/50 border border-surface-border text-center">
              <div class="text-[10px] uppercase font-mono text-text-muted">Casual</div>
              <div class="text-xl font-bold text-white font-mono mt-0.5">{{ currentUser?.leaveBalances?.casual || 0 }}</div>
              <div class="text-[9px] text-text-muted">Days Left</div>
            </div>

            <div class="p-3 rounded-xl bg-surface-secondary/50 border border-surface-border text-center">
              <div class="text-[10px] uppercase font-mono text-text-muted">Sick</div>
              <div class="text-xl font-bold text-white font-mono mt-0.5">{{ currentUser?.leaveBalances?.sick || 0 }}</div>
              <div class="text-[9px] text-text-muted">Days Left</div>
            </div>

            <div class="p-3 rounded-xl bg-surface-secondary/50 border border-surface-border text-center">
              <div class="text-[10px] uppercase font-mono text-text-muted">Emergency</div>
              <div class="text-xl font-bold text-white font-mono mt-0.5">{{ currentUser?.leaveBalances?.emergency || 0 }}</div>
              <div class="text-[9px] text-text-muted">Days Left</div>
            </div>
          </div>

          <!-- Recent My Leave Requests -->
          <div class="space-y-2">
            <div class="text-[11px] font-mono uppercase text-text-muted tracking-wider mb-2">Recent Requests</div>
            <div
              *ngFor="let leave of myLeaves.slice(0, 2)"
              class="flex items-center justify-between p-3 rounded-xl bg-surface-secondary/30 border border-surface-border text-xs"
            >
              <div>
                <div class="font-medium text-white">{{ leave.leaveType }} ({{ leave.daysCount }}d)</div>
                <div class="text-[10px] text-text-muted font-mono">{{ leave.startDate }} to {{ leave.endDate }}</div>
              </div>
              <app-badge [label]="leave.status" [variant]="leave.status"></app-badge>
            </div>

            <div *ngIf="myLeaves.length === 0" class="text-center py-4 text-xs text-text-muted">
              No recent leave requests submitted.
            </div>
          </div>
        </div>
      </div>

      <!-- Check-In Modal -->
      <app-modal
        [isOpen]="isCheckInModalOpen"
        title="Studio Attendance Check-In"
        subtitle="Confirm your working location and log today's session"
        (close)="isCheckInModalOpen = false"
      >
        <div class="space-y-4 text-xs">
          <div>
            <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
              Working Location
            </label>
            <select
              [(ngModel)]="selectedLocation"
              class="input-field"
            >
              <option value="Studio / On-Site">Studio / On-Site (7 Clouds HQ)</option>
              <option value="Work From Home">Work From Home (Remote GPU/Edit)</option>
              <option value="Client Location">Client Location / On-Set Shoot</option>
            </select>
          </div>

          <div>
            <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
              Today's Creative Focus / Notes (Optional)
            </label>
            <input
              type="text"
              [(ngModel)]="checkInNotes"
              placeholder="e.g. Editing Nike 4K master timeline in Suite 1..."
              class="input-field"
            />
          </div>

          <div class="p-3 rounded-xl bg-electric/10 border border-electric/20 text-electric-light text-[11px]">
            ⚡ Check-in timestamp will be recorded on the studio ledger and notified to HR Director.
          </div>

          <div class="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              (click)="isCheckInModalOpen = false"
              class="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              (click)="confirmCheckIn()"
              class="btn-primary text-xs"
            >
              Confirm Check-In
            </button>
          </div>
        </div>
      </app-modal>
    </div>
  `
})
export class EmployeeDashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  todayAttendance: AttendanceRecord | undefined;
  myTasks: TaskItem[] = [];
  myLeaves: LeaveRequest[] = [];
  announcements: Announcement[] = [];

  liveClock = '';
  liveWorkingHours = 0;
  currentTimeZone = 'Standard Studio Time';
  greetingTime = 'Good Morning';
  currentDateStr = '';

  isCheckInModalOpen = false;
  selectedLocation: WorkLocation = 'Studio / On-Site';
  checkInNotes = '';

  completionStats = {
    todayTasks: [] as TaskItem[],
    overdueTasks: [] as TaskItem[],
    upcomingTasks: [] as TaskItem[],
    completedTasks: [] as TaskItem[],
    totalEst: 0,
    totalAct: 0,
    completionRate: 0
  };

  todayTasks: TaskItem[] = [];

  private timerInterval: any;
  private subs: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private attendanceService: AttendanceService,
    private taskService: TaskService,
    private leaveService: LeaveService,
    private announcementService: AnnouncementService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.updateClock();
    this.timerInterval = setInterval(() => {
      this.updateClock();
    }, 1000);

    const now = new Date();
    this.currentDateStr = now.toLocaleDateString([], {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const hours = now.getHours();
    if (hours < 12) this.greetingTime = 'Good Morning';
    else if (hours < 17) this.greetingTime = 'Good Afternoon';
    else this.greetingTime = 'Good Evening';

    this.subs.push(
      this.authService.currentUser$.subscribe(u => {
        this.currentUser = u;
        if (u) {
          this.loadUserData(u.id);
        }
      }),
      this.announcementService.getAnnouncements().subscribe(list => {
        this.announcements = list;
      })
    );
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.subs.forEach(s => s.unsubscribe());
  }

  private loadUserData(userId: string): void {
    this.subs.push(
      this.attendanceService.getTodayRecord(userId).subscribe(record => {
        this.todayAttendance = record;
        this.updateWorkingHours();
      }),
      this.taskService.getUserTasks(userId).subscribe(tasks => {
        this.myTasks = tasks;
        this.completionStats = this.taskService.categorizeTasks(tasks);
        this.todayTasks = this.completionStats.todayTasks;
      }),
      this.leaveService.getUserLeaves(userId).subscribe(leaves => {
        this.myLeaves = leaves;
      })
    );
  }

  private updateClock(): void {
    const now = new Date();
    this.liveClock = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    this.updateWorkingHours();
  }

  private updateWorkingHours(): void {
    if (this.todayAttendance?.checkInTime) {
      this.liveWorkingHours = this.attendanceService.calculateLiveHours(
        this.todayAttendance.checkInTime,
        this.todayAttendance.checkOutTime
      );
    } else {
      this.liveWorkingHours = 0;
    }
  }

  openCheckInModal(): void {
    this.isCheckInModalOpen = true;
  }

  confirmCheckIn(): void {
    if (!this.currentUser) return;
    try {
      this.attendanceService.checkIn(
        this.currentUser,
        this.selectedLocation,
        this.checkInNotes
      );
      this.isCheckInModalOpen = false;
      this.toastService.success(`Checked in successfully at ${this.selectedLocation}!`);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (err: any) {
      this.toastService.error(err.message || 'Check-in failed');
    }
  }

  handleCheckOut(): void {
    if (!this.todayAttendance) return;
    if (confirm('Are you sure you want to check out and complete today’s shift?')) {
      try {
        this.attendanceService.checkOut(this.todayAttendance.id);
        this.toastService.success('Shift completed. Have a great evening!');

        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err: any) {
        this.toastService.error(err.message || 'Check-out failed');
      }
    }
  }

  toggleTaskTimer(task: TaskItem): void {
    if (task.timerRunning) {
      this.taskService.pauseTimer(task.id);
      this.toastService.info(`Paused timer for "${task.title}"`);
    } else {
      this.taskService.startTimer(task.id);
      this.toastService.success(`Started timer for "${task.title}"`);
    }
  }

  markTaskDone(task: TaskItem): void {
    this.taskService.updateTask(task.id, {
      status: 'Completed',
      completionPercentage: 100
    });
    this.toastService.success(`Great job! Completed "${task.title}"`);
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.7 }
    });
  }

  formatTime(isoStr: string): string {
    return new Date(isoStr).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
