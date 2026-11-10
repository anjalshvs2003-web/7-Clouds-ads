import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { NotificationItem } from '../models';
import { DataService } from './data.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(
    private dataService: DataService,
    private authService: AuthService
  ) {}

  getMyNotifications(): Observable<NotificationItem[]> {
    return this.dataService.getNotifications().pipe(
      map(notifs => {
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) return [];
        return notifs.filter(
          n => n.recipientId === 'all' || n.recipientId === currentUser.id
        );
      })
    );
  }

  getUnreadCount(): Observable<number> {
    return this.getMyNotifications().pipe(
      map(notifs => notifs.filter(n => !n.isRead).length)
    );
  }

  markAsRead(id: string): void {
    this.dataService.markNotificationAsRead(id);
  }

  markAllAsRead(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.dataService.markAllNotificationsAsRead(user.id);
    }
  }

  clearAll(): void {
    this.dataService.clearNotifications();
  }

  async requestPushPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Desktop push notifications not supported in this browser.');
      return false;
    }
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (e) {
      console.warn('Error requesting notification permission:', e);
      return false;
    }
  }

  showDesktopNotification(title: string, body: string, icon?: string): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: icon || '/favicon.ico',
          badge: '/favicon.ico'
        });
      } catch (e) {
        console.warn('Failed to show native notification', e);
      }
    }
  }
}
