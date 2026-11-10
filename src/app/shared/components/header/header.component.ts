import { Component, EventEmitter, OnInit, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { IconComponent } from '../icon/icon.component';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DataService } from '../../../core/services/data.service';
import { PwaService } from '../../../core/services/pwa.service';
import { ToastService } from '../../../core/services/toast.service';
import { User, NotificationItem } from '../../../core/models';
import { getCurrentISTTimeString, formatTimeIST } from '../../../core/services/ist-date.utils';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  template: `
    <header class="h-16 border-b border-surface-border bg-surface/85 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6">
      <!-- Left: Mobile Toggle & Brand Context -->
      <div class="flex items-center gap-3">
        <button
          type="button"
          (click)="toggleSidebar.emit()"
          class="lg:hidden p-2 rounded-xl text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
          title="Toggle Navigation"
        >
          <app-icon name="layout-dashboard" [size]="20"></app-icon>
        </button>

        <!-- Live Clock in Indian Standard Time (IST) -->
        <div class="flex items-center gap-3 text-xs">
          <div class="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-secondary/70 border border-surface-border">
            <span class="w-2 h-2 rounded-full" [ngClass]="isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'"></span>
            <span class="text-text-secondary font-mono text-[11px]">
              {{ isOnline ? 'STUDIO ONLINE' : 'OFFLINE MODE' }}
            </span>
          </div>

          <div class="flex items-center gap-1.5 text-text-secondary font-mono">
            <app-icon name="clock" [size]="14" extraClass="text-electric"></app-icon>
            <span class="text-text-primary font-bold tracking-wider">{{ istClockStr }}</span>
            <span class="text-[10px] text-text-muted font-bold">IST</span>
          </div>
        </div>
      </div>

      <!-- Right: Demo Switcher, Notifications & User Info -->
      <div class="flex items-center gap-3">
        <!-- Staff Profile Switcher Dropdown -->
        <div class="relative">
          <button
            type="button"
            (click)="showUserMenu = !showUserMenu; showNotifMenu = false"
            class="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-surface-secondary/90 hover:bg-surface-tertiary border border-surface-border hover:border-electric/40 transition-all text-xs cursor-pointer group"
          >
            <img
              [src]="currentUser?.avatar"
              [alt]="currentUser?.name"
              class="w-7 h-7 rounded-full object-cover border border-electric/40 ring-1 ring-electric/20"
            />
            <div class="text-left hidden md:block">
              <div class="font-bold text-text-primary leading-tight flex items-center gap-1.5">
                <span>{{ currentUser?.name }}</span>
                <span
                  class="text-[9px] uppercase px-1.5 py-0.2 rounded font-bold tracking-wider"
                  [ngClass]="getRoleBadgeClass(currentUser?.role)"
                >
                  {{ getRoleLabel(currentUser?.role) }}
                </span>
              </div>
              <div class="text-[10px] text-text-muted truncate max-w-[140px]">{{ currentUser?.designation }}</div>
            </div>
            <app-icon name="chevron-down" [size]="14" extraClass="text-text-muted group-hover:text-white transition-colors"></app-icon>
          </button>

          <!-- User Switcher Dropdown Menu -->
          <div
            *ngIf="showUserMenu"
            class="absolute right-0 mt-2 w-72 rounded-2xl bg-surface border border-surface-border-bright shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 backdrop-blur-xl"
          >
            <div class="px-3 py-2 border-b border-surface-border mb-1">
              <p class="text-xs font-bold text-white">7 Clouds Staff Directory</p>
              <p class="text-[11px] text-text-muted">Switch active staff session</p>
            </div>

            <div class="max-h-64 overflow-y-auto space-y-1">
              <button
                *ngFor="let u of allUsers"
                (click)="switchUser(u.id)"
                class="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-all text-xs cursor-pointer"
                [ngClass]="u.id === currentUser?.id ? 'bg-electric/15 text-white border border-electric/30' : 'hover:bg-white/5 text-text-secondary hover:text-white'"
              >
                <img [src]="u.avatar" [alt]="u.name" class="w-7 h-7 rounded-full object-cover shrink-0" />
                <div class="flex-1 min-w-0">
                  <div class="font-semibold truncate flex items-center justify-between gap-1">
                    <span class="truncate">{{ u.name }}</span>
                    <span
                      class="text-[9px] px-1 py-0.2 rounded font-bold uppercase shrink-0"
                      [ngClass]="getRoleBadgeClass(u.role)"
                    >
                      {{ getRoleLabel(u.role) }}
                    </span>
                  </div>
                  <div class="text-[10px] text-text-muted truncate">{{ u.designation }}</div>
                </div>
                <app-icon *ngIf="u.id === currentUser?.id" name="check" [size]="14" extraClass="text-electric shrink-0"></app-icon>
              </button>
            </div>

            <div class="border-t border-surface-border mt-2 pt-2 flex items-center justify-between px-2">
              <a
                routerLink="/profile"
                (click)="showUserMenu = false"
                class="text-xs text-text-secondary hover:text-electric flex items-center gap-1.5 transition-colors"
              >
                <app-icon name="user" [size]="14"></app-icon>
                <span>My Profile</span>
              </a>
              <button
                (click)="logout()"
                class="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <app-icon name="log-out" [size]="14"></app-icon>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Notification Bell -->
        <div class="relative">
          <button
            type="button"
            (click)="showNotifMenu = !showNotifMenu; showUserMenu = false"
            class="relative p-2 rounded-xl bg-surface-secondary/80 hover:bg-surface-tertiary border border-surface-border text-text-secondary hover:text-white transition-all cursor-pointer"
            title="Notifications"
          >
            <app-icon name="bell" [size]="18"></app-icon>
            <span
              *ngIf="unreadCount > 0"
              class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-electric text-white text-[10px] font-bold flex items-center justify-center border-2 border-surface shadow-[0_0_10px_rgba(69,104,255,0.7)] animate-pulse"
            >
              {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
          </button>

          <!-- Notification Dropdown -->
          <div
            *ngIf="showNotifMenu"
            class="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-surface border border-surface-border-bright shadow-2xl p-3 z-50 backdrop-blur-xl"
          >
            <div class="flex items-center justify-between pb-2 border-b border-surface-border mb-2">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-text-primary">Studio Alerts</span>
                <span class="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-electric/20 text-electric-light">
                  {{ unreadCount }} unread
                </span>
              </div>
              <button
                (click)="markAllAsRead()"
                class="text-[11px] text-text-muted hover:text-electric transition-colors cursor-pointer"
              >
                Mark all read
              </button>
            </div>

            <div class="max-h-72 overflow-y-auto space-y-1.5">
              <div
                *ngFor="let n of recentNotifications"
                (click)="markAsRead(n)"
                class="p-2.5 rounded-xl transition-all cursor-pointer flex gap-3 text-xs"
                [ngClass]="n.isRead ? 'bg-surface-secondary/40 text-text-muted hover:bg-surface-secondary/70' : 'bg-surface-secondary/90 text-text-primary border border-electric/20 shadow-sm'"
              >
                <div class="mt-0.5">
                  <span
                    class="w-2 h-2 rounded-full inline-block"
                    [ngClass]="n.isRead ? 'bg-slate-600' : 'bg-electric animate-pulse'"
                  ></span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-medium flex items-center justify-between">
                    <span class="truncate">{{ n.title }}</span>
                    <span class="text-[10px] text-text-muted ml-2 shrink-0">{{ formatTime(n.createdAt) }}</span>
                  </div>
                  <p class="text-[11px] text-text-secondary mt-0.5 line-clamp-2">{{ n.message }}</p>
                </div>
              </div>

              <div *ngIf="recentNotifications.length === 0" class="py-8 text-center text-xs text-text-muted">
                No notifications right now.
              </div>
            </div>

            <div class="border-t border-surface-border mt-2 pt-2 text-center">
              <a
                routerLink="/notifications"
                (click)="showNotifMenu = false"
                class="text-xs font-medium text-electric hover:underline"
              >
                View full notification history →
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>();

  currentUser: User | null = null;
  allUsers: User[] = [];
  unreadCount: number = 0;
  recentNotifications: NotificationItem[] = [];

  showUserMenu = false;
  showNotifMenu = false;
  isOnline = true;
  istClockStr: string = '';

  private timerInterval: any;
  private subs: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private notifService: NotificationService,
    private pwaService: PwaService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.updateClock();
    this.timerInterval = setInterval(() => this.updateClock(), 1000);

    this.subs.push(
      this.authService.currentUser$.subscribe(u => {
        this.currentUser = u;
      }),
      this.dataService.getUsers().subscribe(users => {
        this.allUsers = users;
      }),
      this.notifService.getUnreadCount().subscribe(count => {
        this.unreadCount = count;
      }),
      this.notifService.getMyNotifications().subscribe(list => {
        this.recentNotifications = list.slice(0, 6);
      }),
      this.pwaService.isOnline$.subscribe(online => {
        this.isOnline = online;
      })
    );
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.subs.forEach(s => s.unsubscribe());
  }

  private updateClock(): void {
    this.istClockStr = getCurrentISTTimeString();
  }

  switchUser(userId: string): void {
    const user = this.allUsers.find(u => u.id === userId && u.status === 'active');
    if (user) {
      this.authService.switchUser(user.id);
      this.showUserMenu = false;
      this.toastService.success(`Switched active session to ${user.name}`);
      if (
        user.role === 'HOST' ||
        (user.role as string) === 'super_admin' ||
        user.role === 'HR ADMIN' ||
        (user.role as string) === 'hr_admin'
      ) {
        this.router.navigate(['/hr-dashboard']);
      } else {
        this.router.navigate(['/dashboard']);
      }
    }
  }

  logout(): void {
    this.showUserMenu = false;
    this.authService.logout();
  }

  markAsRead(n: NotificationItem): void {
    this.notifService.markAsRead(n.id);
  }

  markAllAsRead(): void {
    this.notifService.markAllAsRead();
  }

  getRoleLabel(role?: string): string {
    if (role === 'HOST' || role === 'super_admin') return 'HOST';
    if (role === 'HR ADMIN' || role === 'hr_admin' || role === 'admin') return 'HR ADMIN';
    return 'EMPLOYEE';
  }

  getRoleBadgeClass(role?: string): string {
    if (role === 'HOST' || role === 'super_admin') {
      return 'bg-gradient-to-r from-violet-600 to-electric text-white';
    }
    if (role === 'HR ADMIN' || role === 'hr_admin' || role === 'admin') {
      return 'bg-violet-500/20 text-violet-300';
    }
    return 'bg-blue-500/20 text-blue-300';
  }

  formatTime(isoStr: string): string {
    return formatTimeIST(isoStr);
  }
}
