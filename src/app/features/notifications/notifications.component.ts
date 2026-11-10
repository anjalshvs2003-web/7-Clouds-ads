import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../core/services/notification.service';
import { ToastService } from '../../core/services/toast.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { NotificationItem } from '../../core/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Title & Push Permission Bar -->
      <div class="glass-panel p-6 sm:p-8 relative overflow-hidden">
        <div class="absolute -right-20 -top-20 w-80 h-80 bg-electric/15 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="px-2.5 py-0.5 rounded-full bg-electric/20 text-electric-light font-mono text-[10px] font-bold uppercase tracking-wider">
                Event Dispatch Hub
              </span>
              <span class="text-text-muted">•</span>
              <span class="text-xs font-mono text-text-muted">{{ unreadCount }} Unread Events</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Studio Notification Center
            </h1>
            <p class="text-xs sm:text-sm text-text-secondary mt-1">
              Real-time audit alerts for check-ins, leave decisions, creative task assignments and studio broadcasts.
            </p>
          </div>

          <!-- Quick Actions -->
          <div class="flex items-center gap-2.5 flex-wrap">
            <button
              (click)="requestPushNotifications()"
              class="btn-secondary text-xs cursor-pointer"
            >
              <app-icon name="bell" [size]="14"></app-icon>
              <span>Enable Browser Push</span>
            </button>

            <button
              *ngIf="unreadCount > 0"
              (click)="markAllAsRead()"
              class="btn-primary text-xs cursor-pointer"
            >
              <app-icon name="check" [size]="14"></app-icon>
              <span>Mark All as Read</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Filters & Clear -->
      <div class="glass-panel p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 text-xs">
          <button
            type="button"
            (click)="typeFilter = 'ALL'"
            class="px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap"
            [ngClass]="typeFilter === 'ALL' ? 'bg-electric text-white shadow-glow-sm' : 'text-text-muted hover:text-white hover:bg-white/5'"
          >
            All Events ({{ notifications.length }})
          </button>
          <button
            type="button"
            (click)="typeFilter = 'task'"
            class="px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap"
            [ngClass]="typeFilter === 'task' ? 'bg-electric text-white shadow-glow-sm' : 'text-text-muted hover:text-white hover:bg-white/5'"
          >
            Tasks
          </button>
          <button
            type="button"
            (click)="typeFilter = 'leave'"
            class="px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap"
            [ngClass]="typeFilter === 'leave' ? 'bg-amber-500 text-white' : 'text-text-muted hover:text-white hover:bg-white/5'"
          >
            Leaves
          </button>
          <button
            type="button"
            (click)="typeFilter = 'attendance'"
            class="px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap"
            [ngClass]="typeFilter === 'attendance' ? 'bg-emerald-500 text-white' : 'text-text-muted hover:text-white hover:bg-white/5'"
          >
            Attendance
          </button>
          <button
            type="button"
            (click)="typeFilter = 'announcement'"
            class="px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap"
            [ngClass]="typeFilter === 'announcement' ? 'bg-violet-500 text-white' : 'text-text-muted hover:text-white hover:bg-white/5'"
          >
            Announcements
          </button>
        </div>

        <button
          type="button"
          (click)="clearAll()"
          class="text-xs text-rose-400 hover:text-rose-300 transition-colors self-end sm:self-auto cursor-pointer"
        >
          Clear History
        </button>
      </div>

      <!-- Notifications Feed -->
      <div class="space-y-3">
        <div
          *ngFor="let n of displayedNotifications"
          (click)="handleItemClick(n)"
          class="glass-panel p-4 sm:p-5 flex items-start gap-4 transition-all cursor-pointer group hover:border-surface-border-bright"
          [ngClass]="n.isRead ? 'opacity-80' : 'border-electric/30 shadow-[0_0_15px_rgba(69,104,255,0.08)] bg-surface-secondary/50'"
        >
          <!-- Icon avatar -->
          <div
            class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
            [ngClass]="getIconBg(n.type)"
          >
            <app-icon [name]="getTypeIcon(n.type)" [size]="20" [extraClass]="getIconColor(n.type)"></app-icon>
          </div>

          <!-- Content Details -->
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-2 mb-1">
              <div class="flex items-center gap-2">
                <span class="font-bold text-white text-sm group-hover:text-electric-light transition-colors">
                  {{ n.title }}
                </span>
                <span *ngIf="!n.isRead" class="w-2 h-2 rounded-full bg-electric animate-pulse"></span>
              </div>
              <span class="text-[11px] text-text-muted font-mono shrink-0">
                {{ n.createdAt | date:'shortTime' }} • {{ n.createdAt | date:'mediumDate' }}
              </span>
            </div>

            <p class="text-xs text-text-secondary leading-relaxed mb-2">{{ n.message }}</p>

            <div class="flex items-center justify-between text-[11px]">
              <span class="text-text-muted font-mono uppercase text-[10px]">
                Type: {{ n.type }} {{ n.senderName ? '• from ' + n.senderName : '' }}
              </span>

              <span *ngIf="n.link" class="text-electric group-hover:underline flex items-center gap-1 font-medium">
                <span>View Details</span>
                <app-icon name="arrow-right" [size]="12"></app-icon>
              </span>
            </div>
          </div>
        </div>

        <div *ngIf="displayedNotifications.length === 0" class="glass-panel py-16 text-center text-xs text-text-muted">
          No notifications found matching this filter.
        </div>
      </div>
    </div>
  `
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: NotificationItem[] = [];
  unreadCount = 0;
  typeFilter = 'ALL';

  private subs: Subscription[] = [];

  constructor(
    private notificationService: NotificationService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.subs.push(
      this.notificationService.getMyNotifications().subscribe(list => {
        this.notifications = list;
      }),
      this.notificationService.getUnreadCount().subscribe(count => {
        this.unreadCount = count;
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  get displayedNotifications(): NotificationItem[] {
    if (this.typeFilter === 'ALL') return this.notifications;
    return this.notifications.filter(n => n.type === this.typeFilter);
  }

  handleItemClick(n: NotificationItem): void {
    if (!n.isRead) {
      this.notificationService.markAsRead(n.id);
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
    this.toastService.success('All notifications marked as read.');
  }

  clearAll(): void {
    if (confirm('Clear your notification history?')) {
      this.notificationService.clearAll();
      this.toastService.info('Notification history cleared.');
    }
  }

  async requestPushNotifications(): Promise<void> {
    const granted = await this.notificationService.requestPushPermission();
    if (granted) {
      this.toastService.success('Push notifications enabled for 7 Clouds Studio!');
      this.notificationService.showDesktopNotification(
        '7 Clouds Push Connected',
        'You will now receive instant desktop alerts for deadlines and approvals.'
      );
    } else {
      this.toastService.warning('Push notification permission was denied in your browser settings.');
    }
  }

  getTypeIcon(type: NotificationItem['type']): string {
    switch (type) {
      case 'attendance': return 'clock';
      case 'leave': return 'briefcase';
      case 'task': return 'check-square';
      case 'report': return 'file-text';
      case 'announcement': return 'megaphone';
      default: return 'bell';
    }
  }

  getIconBg(type: NotificationItem['type']): string {
    switch (type) {
      case 'attendance': return 'bg-emerald-500/10 border border-emerald-500/20';
      case 'leave': return 'bg-amber-500/10 border border-amber-500/20';
      case 'task': return 'bg-electric/10 border border-electric/20';
      case 'announcement': return 'bg-violet-500/10 border border-violet-500/20';
      default: return 'bg-surface-secondary';
    }
  }

  getIconColor(type: NotificationItem['type']): string {
    switch (type) {
      case 'attendance': return 'text-emerald-400';
      case 'leave': return 'text-amber-400';
      case 'task': return 'text-electric';
      case 'announcement': return 'text-violet-400';
      default: return 'text-text-muted';
    }
  }
}
