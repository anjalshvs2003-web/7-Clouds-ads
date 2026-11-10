import { Component, EventEmitter, OnInit, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconComponent } from '../icon/icon.component';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DataService } from '../../../core/services/data.service';
import { PwaService } from '../../../core/services/pwa.service';
import { User, NotificationItem } from '../../../core/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  template: `
    <header class="h-16 border-b border-surface-border bg-surface/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6">
      <!-- Left: Mobile Toggle & Brand Context -->
      <div class="flex items-center gap-3">
        <button
          type="button"
          (click)="toggleSidebar.emit()"
          class="lg:hidden p-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
          title="Toggle Navigation"
        >
          <app-icon name="layout-dashboard" [size]="20"></app-icon>
        </button>

        <!-- Connectivity & Live Clock -->
        <div class="hidden sm:flex items-center gap-4 text-xs">
          <div class="flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-secondary/70 border border-surface-border">
            <span class="w-2 h-2 rounded-full" [ngClass]="isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'"></span>
            <span class="text-text-secondary font-mono text-[11px]">
              {{ isOnline ? 'STUDIO MESH ONLINE' : 'OFFLINE MODE' }}
            </span>
          </div>

          <div class="flex items-center gap-1.5 text-text-secondary font-mono">
            <app-icon name="clock" [size]="14" extraClass="text-electric"></app-icon>
            <span class="text-text-primary font-medium tracking-wider">{{ currentTimeStr }}</span>
          </div>
        </div>
      </div>

      <!-- Right: Demo Switcher, Notifications & User Info -->
      <div class="flex items-center gap-3">
        <!-- Demo Switcher (Instant 1-Click Role/User Switcher) -->
        <div class="relative">
          <button
            type="button"
            (click)="showUserMenu = !showUserMenu; showNotifMenu = false"
            class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-secondary/90 hover:bg-surface-tertiary border border-surface-border hover:border-electric/40 transition-all text-xs cursor-pointer group"
          >
            <img
              [src]="currentUser?.avatar"
              [alt]="currentUser?.name"
              class="w-6 h-6 rounded-full object-cover border border-electric/40 ring-1 ring-electric/20"
            />
            <div class="text-left hidden md:block">
              <div class="font-medium text-text-primary leading-tight flex items-center gap-1">
                <span>{{ currentUser?.name }}</span>
                <span
                  class="text-[9px] uppercase px-1 py-0.2 rounded font-semibold tracking-wider"
                  [ngClass]="currentUser?.role === 'admin' ? 'bg-violet-500/20 text-violet-300' : 'bg-blue-500/20 text-blue-300'"
                >
                  {{ currentUser?.role }}
                </span>
              </div>
              <div class="text-[10px] text-text-muted truncate max-w-[120px]">{{ currentUser?.designation }}</div>
            </div>
            <app-icon name="chevron-down" [size]="14" extraClass="text-text-muted group-hover:text-white transition-colors"></app-icon>
          </button>

          <!-- User Switcher Dropdown -->
          <div
            *ngIf="showUserMenu"
            class="absolute right-0 mt-2 w-72 rounded-2xl bg-surface border border-surface-border-bright shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 backdrop-blur-xl"
          >
            <div class="px-3 py-2 border-b border-surface-border mb-1">
              <p class="text-xs font-semibold text-text-primary">Switch Demo Profile</p>
              <p class="text-[11px] text-text-muted">Simulate any creative or HR account</p>
            </div>

            <div class="max-h-64 overflow-y-auto space-y-1">
              <button
                *ngFor="let u of allUsers"
                (click)="switchUser(u.id)"
                class="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-all text-xs cursor-pointer"
                [ngClass]="u.id === currentUser?.id ? 'bg-electric/15 text-white border border-electric/30' : 'hover:bg-white/5 text-text-secondary hover:text-white'"
              >
                <img [src]="u.avatar" [alt]="u.name" class="w-7 h-7 rounded-full object-cover" />
                <div class="flex-1 min-w-0">
                  <div class="font-medium truncate flex items-center gap-1.5">
                    <span>{{ u.name }}</span>
                    <span *ngIf="u.role === 'admin'" class="text-[9px] px-1 py-0.2 rounded bg-violet-500/20 text-violet-300 font-semibold">HR</span>
                  </div>
                  <div class="text-[10px] text-text-muted truncate">{{ u.designation }}</div>
                </div>
                <app-icon *ngIf="u.id === currentUser?.id" name="check" [size]="14" extraClass="text-electric"></app-icon>
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

        <!-- Notification Bell & Center -->
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
                <span class="text-xs font-semibold text-text-primary">Studio Notifications</span>
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
                View all notification history →
              </a>
            </div>
          </div>
        </div>

        <!-- Quick Reset Data Button (Helpful for demo & testing) -->
        <button
          (click)="resetDemoData()"
          class="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-surface-secondary/60 hover:bg-surface-secondary border border-surface-border text-text-muted hover:text-amber-300 text-xs transition-colors cursor-pointer"
          title="Reset to fresh demo sample data"
        >
          <app-icon name="sparkles" [size]="14"></app-icon>
          <span>Reset Demo</span>
        </button>
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
  currentTimeStr: string = '';

  private timerInterval: any;
  private subs: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private notifService: NotificationService,
    private pwaService: PwaService
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
    const now = new Date();
    this.currentTimeStr = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  switchUser(userId: string): void {
    this.authService.switchUser(userId);
    this.showUserMenu = false;
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

  resetDemoData(): void {
    if (confirm('Reset workspace to initial demo seed data? All sample records will be restored.')) {
      this.dataService.resetToDefaults();
      window.location.reload();
    }
  }

  formatTime(isoStr: string): string {
    const d = new Date(isoStr);
    const diff = (Date.now() - d.getTime()) / 60000;
    if (diff < 1) return 'just now';
    if (diff < 60) return `${Math.floor(diff)}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}
