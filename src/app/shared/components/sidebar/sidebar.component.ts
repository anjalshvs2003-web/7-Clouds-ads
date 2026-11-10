import { Component, EventEmitter, Input, OnInit, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconComponent } from '../icon/icon.component';
import { AuthService } from '../../../core/services/auth.service';
import { AttendanceService } from '../../../core/services/attendance.service';
import { PwaService } from '../../../core/services/pwa.service';
import { User, AttendanceRecord } from '../../../core/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  template: `
    <aside
      class="fixed inset-y-0 left-0 z-40 w-64 bg-surface border-r border-surface-border flex flex-col transition-transform duration-300 lg:static lg:translate-x-0"
      [class.-translate-x-full]="!isOpen"
    >
      <!-- Brand Logo Header -->
      <div class="h-16 flex items-center justify-between px-5 border-b border-surface-border">
        <a routerLink="/" class="flex items-center gap-3 group">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-electric via-violet to-lavender flex items-center justify-center shadow-glow-sm group-hover:shadow-glow-electric transition-all">
            <app-icon name="cloud" [size]="20" extraClass="text-white drop-shadow"></app-icon>
          </div>
          <div>
            <div class="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
              <span>7 CLOUDS</span>
              <span class="text-[9px] px-1.5 py-0.5 rounded-full bg-electric/20 text-electric-light font-mono font-semibold">ADS</span>
            </div>
            <div class="text-[10px] text-text-muted tracking-wider uppercase">Attendance & Tasks</div>
          </div>
        </a>

        <button
          type="button"
          (click)="closeSidebar.emit()"
          class="lg:hidden p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/5"
        >
          <app-icon name="x" [size]="18"></app-icon>
        </button>
      </div>

      <!-- Navigation Links Container -->
      <div class="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <!-- Personal Workspace (Accessible to everyone) -->
        <div>
          <div class="px-3 mb-2 text-[10px] font-bold text-text-muted uppercase tracking-widest font-mono">
            My Workspace
          </div>
          <nav class="space-y-1">
            <a
              routerLink="/dashboard"
              routerLinkActive="bg-electric/15 text-white border-electric/40 shadow-glow-sm font-semibold"
              [routerLinkActiveOptions]="{ exact: true }"
              (click)="closeSidebar.emit()"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-white hover:bg-white/5 border border-transparent transition-all group"
            >
              <app-icon name="layout-dashboard" [size]="18" extraClass="text-text-muted group-hover:text-electric transition-colors"></app-icon>
              <span>Dashboard</span>
            </a>

            <a
              routerLink="/attendance"
              routerLinkActive="bg-electric/15 text-white border-electric/40 shadow-glow-sm font-semibold"
              (click)="closeSidebar.emit()"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-white hover:bg-white/5 border border-transparent transition-all group"
            >
              <app-icon name="clock" [size]="18" extraClass="text-text-muted group-hover:text-electric transition-colors"></app-icon>
              <span class="flex-1">Attendance</span>
              <span
                *ngIf="todayRecord?.checkInTime && !todayRecord?.checkOutTime"
                class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
                title="Active check-in"
              ></span>
            </a>

            <a
              routerLink="/tasks"
              routerLinkActive="bg-electric/15 text-white border-electric/40 shadow-glow-sm font-semibold"
              (click)="closeSidebar.emit()"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-white hover:bg-white/5 border border-transparent transition-all group"
            >
              <app-icon name="check-square" [size]="18" extraClass="text-text-muted group-hover:text-electric transition-colors"></app-icon>
              <span>Daily Tasks</span>
            </a>

            <a
              routerLink="/leave"
              routerLinkActive="bg-electric/15 text-white border-electric/40 shadow-glow-sm font-semibold"
              (click)="closeSidebar.emit()"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-white hover:bg-white/5 border border-transparent transition-all group"
            >
              <app-icon name="briefcase" [size]="18" extraClass="text-text-muted group-hover:text-electric transition-colors"></app-icon>
              <span>Leave Requests</span>
            </a>

            <a
              routerLink="/calendar"
              routerLinkActive="bg-electric/15 text-white border-electric/40 shadow-glow-sm font-semibold"
              (click)="closeSidebar.emit()"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-white hover:bg-white/5 border border-transparent transition-all group"
            >
              <app-icon name="calendar" [size]="18" extraClass="text-text-muted group-hover:text-electric transition-colors"></app-icon>
              <span>Calendar</span>
            </a>

            <a
              routerLink="/notifications"
              routerLinkActive="bg-electric/15 text-white border-electric/40 shadow-glow-sm font-semibold"
              (click)="closeSidebar.emit()"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-white hover:bg-white/5 border border-transparent transition-all group"
            >
              <app-icon name="bell" [size]="18" extraClass="text-text-muted group-hover:text-electric transition-colors"></app-icon>
              <span>Notifications</span>
            </a>

            <a
              routerLink="/profile"
              routerLinkActive="bg-electric/15 text-white border-electric/40 shadow-glow-sm font-semibold"
              (click)="closeSidebar.emit()"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-white hover:bg-white/5 border border-transparent transition-all group"
            >
              <app-icon name="user" [size]="18" extraClass="text-text-muted group-hover:text-electric transition-colors"></app-icon>
              <span>My Profile</span>
            </a>
          </nav>
        </div>

        <!-- Studio Administration (Host & HR Admin Only) -->
        <div *ngIf="isAdmin">
          <div class="px-3 mb-2 flex items-center justify-between text-[10px] font-bold text-violet-400 uppercase tracking-widest font-mono">
            <span>{{ isHost ? 'HOST & MANAGEMENT' : 'HR MANAGEMENT' }}</span>
            <span class="px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 text-[9px]">
              {{ isHost ? 'HOST' : 'HR' }}
            </span>
          </div>
          <nav class="space-y-1">
            <a
              routerLink="/hr-dashboard"
              routerLinkActive="bg-violet-600/20 text-white border-violet-500/40 shadow-glow-violet font-semibold"
              (click)="closeSidebar.emit()"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-white hover:bg-white/5 border border-transparent transition-all group"
            >
              <app-icon name="shield" [size]="18" extraClass="text-violet-400 group-hover:text-violet-300 transition-colors"></app-icon>
              <span>{{ isHost ? 'Host Command Center' : 'HR Overview' }}</span>
            </a>

            <a
              routerLink="/employees"
              routerLinkActive="bg-violet-600/20 text-white border-violet-500/40 shadow-glow-violet font-semibold"
              (click)="closeSidebar.emit()"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-white hover:bg-white/5 border border-transparent transition-all group"
            >
              <app-icon name="users" [size]="18" extraClass="text-violet-400 group-hover:text-violet-300 transition-colors"></app-icon>
              <span>Staff Accounts</span>
            </a>

            <a
              routerLink="/reports"
              routerLinkActive="bg-violet-600/20 text-white border-violet-500/40 shadow-glow-violet font-semibold"
              (click)="closeSidebar.emit()"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-white hover:bg-white/5 border border-transparent transition-all group"
            >
              <app-icon name="bar-chart-2" [size]="18" extraClass="text-violet-400 group-hover:text-violet-300 transition-colors"></app-icon>
              <span>Attendance Reports</span>
            </a>

            <a
              routerLink="/announcements"
              routerLinkActive="bg-violet-600/20 text-white border-violet-500/40 shadow-glow-violet font-semibold"
              (click)="closeSidebar.emit()"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-white hover:bg-white/5 border border-transparent transition-all group"
            >
              <app-icon name="megaphone" [size]="18" extraClass="text-violet-400 group-hover:text-violet-300 transition-colors"></app-icon>
              <span>Announcements</span>
            </a>

            <a
              routerLink="/settings"
              routerLinkActive="bg-violet-600/20 text-white border-violet-500/40 shadow-glow-violet font-semibold"
              (click)="closeSidebar.emit()"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-white hover:bg-white/5 border border-transparent transition-all group"
            >
              <app-icon name="settings" [size]="18" extraClass="text-violet-400 group-hover:text-violet-300 transition-colors"></app-icon>
              <span>Studio Settings</span>
            </a>
          </nav>
        </div>
      </div>

      <!-- Bottom Card: Simplified Today Attendance Indicator & PWA -->
      <div class="p-3 border-t border-surface-border bg-surface-secondary/40 space-y-2">
        <div class="p-3 rounded-xl bg-surface border border-surface-border text-xs">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-text-muted text-[11px]">Today's Status</span>
            <span
              class="px-2 py-0.5 rounded-full text-[10px] font-semibold"
              [ngClass]="todayRecord?.checkInTime ? (todayRecord?.checkOutTime ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400') : 'bg-amber-500/10 text-amber-400'"
            >
              {{ todayRecord?.checkOutTime ? 'Completed' : (todayRecord?.checkInTime ? 'Checked In' : 'Not Checked In') }}
            </span>
          </div>

          <div *ngIf="!todayRecord?.checkInTime">
            <a
              routerLink="/attendance"
              class="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-electric text-white text-xs font-medium hover:bg-electric-hover transition-colors shadow-glow-sm"
            >
              <app-icon name="play" [size]="13"></app-icon>
              <span>CHECK IN</span>
            </a>
          </div>

          <div *ngIf="todayRecord?.checkInTime && !todayRecord?.checkOutTime">
            <a
              routerLink="/attendance"
              class="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-colors shadow-sm"
            >
              <app-icon name="square" [size]="13"></app-icon>
              <span>CHECK OUT</span>
            </a>
          </div>

          <div *ngIf="todayRecord?.checkOutTime" class="text-[11px] text-text-muted text-center pt-0.5">
            Shift complete ({{ todayRecord?.workingHours }}h)
          </div>
        </div>

        <button
          *ngIf="canInstallPwa"
          (click)="installPwa()"
          class="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-surface-tertiary hover:bg-surface-secondary border border-surface-border text-text-primary text-xs transition-colors cursor-pointer"
        >
          <app-icon name="download" [size]="14" extraClass="text-electric"></app-icon>
          <span>Install App</span>
        </button>
      </div>
    </aside>

    <!-- Mobile Backdrop -->
    <div
      *ngIf="isOpen"
      (click)="closeSidebar.emit()"
      class="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
    ></div>
  `
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Output() closeSidebar = new EventEmitter<void>();

  currentUser: User | null = null;
  isAdmin = false;
  isHost = false;
  todayRecord: AttendanceRecord | undefined;
  canInstallPwa = false;

  private subs: Subscription[] = [];
  private attendanceSub?: Subscription;

  constructor(
    private authService: AuthService,
    private attendanceService: AttendanceService,
    private pwaService: PwaService
  ) {}

  ngOnInit(): void {
    this.subs.push(
      this.authService.currentUser$.subscribe(u => {
        this.currentUser = u;
        this.isAdmin = this.authService.isAdmin();
        this.isHost = this.authService.isHost();
        if (u) {
          this.loadTodayAttendance(u.id);
        } else {
          this.todayRecord = undefined;
          if (this.attendanceSub) this.attendanceSub.unsubscribe();
        }
      }),
      this.pwaService.canInstall$.subscribe(can => {
        this.canInstallPwa = can;
      })
    );
  }

  ngOnDestroy(): void {
    if (this.attendanceSub) this.attendanceSub.unsubscribe();
    this.subs.forEach(s => s.unsubscribe());
  }

  private loadTodayAttendance(userId: string): void {
    if (this.attendanceSub) {
      this.attendanceSub.unsubscribe();
    }
    this.attendanceSub = this.attendanceService.getTodayRecord(userId).subscribe(record => {
      this.todayRecord = record;
    });
  }

  installPwa(): void {
    this.pwaService.installApp();
  }
}
