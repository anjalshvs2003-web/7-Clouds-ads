import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  User,
  AttendanceRecord,
  LeaveRequest,
  TaskItem,
  DailyWorkReport,
  Announcement,
  CompanyHoliday,
  NotificationItem,
  AuditLog,
  StudioSettings
} from '../models';
import {
  INITIAL_USERS,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVES,
  INITIAL_TASKS,
  INITIAL_REPORTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_HOLIDAYS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SETTINGS
} from './mock-data';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  // Use v2 prefix for smooth migration to the official 5 staff members
  private readonly STORAGE_PREFIX = '7clouds_v2_';

  private users$ = new BehaviorSubject<User[]>([]);
  private attendance$ = new BehaviorSubject<AttendanceRecord[]>([]);
  private leaves$ = new BehaviorSubject<LeaveRequest[]>([]);
  private tasks$ = new BehaviorSubject<TaskItem[]>([]);
  private reports$ = new BehaviorSubject<DailyWorkReport[]>([]);
  private announcements$ = new BehaviorSubject<Announcement[]>([]);
  private holidays$ = new BehaviorSubject<CompanyHoliday[]>([]);
  private notifications$ = new BehaviorSubject<NotificationItem[]>([]);
  private auditLogs$ = new BehaviorSubject<AuditLog[]>([]);
  private settings$ = new BehaviorSubject<StudioSettings>(INITIAL_SETTINGS);

  constructor() {
    this.initializeData();
  }

  private initializeData(): void {
    const storedUsers = this.getFromStorage<User[]>('users');
    // If no v2 users or old users found, initialize with official 5 staff
    if (!storedUsers || storedUsers.length === 0 || !storedUsers.some(u => u.name.includes('Anjalsh') || u.name.includes('Athira'))) {
      this.resetToDefaults();
    } else {
      this.users$.next(storedUsers);
      this.attendance$.next(this.getFromStorage<AttendanceRecord[]>('attendance') || INITIAL_ATTENDANCE);
      this.leaves$.next(this.getFromStorage<LeaveRequest[]>('leaves') || INITIAL_LEAVES);
      this.tasks$.next(this.getFromStorage<TaskItem[]>('tasks') || INITIAL_TASKS);
      this.reports$.next(this.getFromStorage<DailyWorkReport[]>('reports') || INITIAL_REPORTS);
      this.announcements$.next(this.getFromStorage<Announcement[]>('announcements') || INITIAL_ANNOUNCEMENTS);
      this.holidays$.next(this.getFromStorage<CompanyHoliday[]>('holidays') || INITIAL_HOLIDAYS);
      this.notifications$.next(this.getFromStorage<NotificationItem[]>('notifications') || INITIAL_NOTIFICATIONS);
      this.auditLogs$.next(this.getFromStorage<AuditLog[]>('audit_logs') || INITIAL_AUDIT_LOGS);
      this.settings$.next(this.getFromStorage<StudioSettings>('settings') || INITIAL_SETTINGS);
    }
  }

  public resetToDefaults(): void {
    this.saveToStorage('users', INITIAL_USERS);
    this.saveToStorage('attendance', INITIAL_ATTENDANCE);
    this.saveToStorage('leaves', INITIAL_LEAVES);
    this.saveToStorage('tasks', INITIAL_TASKS);
    this.saveToStorage('reports', INITIAL_REPORTS);
    this.saveToStorage('announcements', INITIAL_ANNOUNCEMENTS);
    this.saveToStorage('holidays', INITIAL_HOLIDAYS);
    this.saveToStorage('notifications', INITIAL_NOTIFICATIONS);
    this.saveToStorage('audit_logs', INITIAL_AUDIT_LOGS);
    this.saveToStorage('settings', INITIAL_SETTINGS);

    this.users$.next(INITIAL_USERS);
    this.attendance$.next(INITIAL_ATTENDANCE);
    this.leaves$.next(INITIAL_LEAVES);
    this.tasks$.next(INITIAL_TASKS);
    this.reports$.next(INITIAL_REPORTS);
    this.announcements$.next(INITIAL_ANNOUNCEMENTS);
    this.holidays$.next(INITIAL_HOLIDAYS);
    this.notifications$.next(INITIAL_NOTIFICATIONS);
    this.auditLogs$.next(INITIAL_AUDIT_LOGS);
    this.settings$.next(INITIAL_SETTINGS);
  }

  private saveToStorage<T>(key: string, data: T): void {
    try {
      localStorage.setItem(`${this.STORAGE_PREFIX}${key}`, JSON.stringify(data));
    } catch (e) {
      console.warn(`LocalStorage write error for ${key}:`, e);
    }
  }

  private getFromStorage<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(`${this.STORAGE_PREFIX}${key}`);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.warn(`LocalStorage read error for ${key}:`, e);
      return null;
    }
  }

  // --- Observables Getters ---
  getUsers(): Observable<User[]> {
    return this.users$.asObservable();
  }

  getAttendance(): Observable<AttendanceRecord[]> {
    return this.attendance$.asObservable();
  }

  getLeaves(): Observable<LeaveRequest[]> {
    return this.leaves$.asObservable();
  }

  getTasks(): Observable<TaskItem[]> {
    return this.tasks$.asObservable();
  }

  getReports(): Observable<DailyWorkReport[]> {
    return this.reports$.asObservable();
  }

  getAnnouncements(): Observable<Announcement[]> {
    return this.announcements$.asObservable();
  }

  getHolidays(): Observable<CompanyHoliday[]> {
    return this.holidays$.asObservable();
  }

  getNotifications(): Observable<NotificationItem[]> {
    return this.notifications$.asObservable();
  }

  getAuditLogs(): Observable<AuditLog[]> {
    return this.auditLogs$.asObservable();
  }

  getSettings(): Observable<StudioSettings> {
    return this.settings$.asObservable();
  }

  // Snapshot Getters
  getUsersSnapshot(): User[] {
    return this.users$.value;
  }

  getAttendanceSnapshot(): AttendanceRecord[] {
    return this.attendance$.value;
  }

  getLeavesSnapshot(): LeaveRequest[] {
    return this.leaves$.value;
  }

  getTasksSnapshot(): TaskItem[] {
    return this.tasks$.value;
  }

  getReportsSnapshot(): DailyWorkReport[] {
    return this.reports$.value;
  }

  getAnnouncementsSnapshot(): Announcement[] {
    return this.announcements$.value;
  }

  getHolidaysSnapshot(): CompanyHoliday[] {
    return this.holidays$.value;
  }

  getNotificationsSnapshot(): NotificationItem[] {
    return this.notifications$.value;
  }

  getAuditLogsSnapshot(): AuditLog[] {
    return this.auditLogs$.value;
  }

  getSettingsSnapshot(): StudioSettings {
    return this.settings$.value;
  }

  // --- Users Operations ---
  addUser(user: User): void {
    const list = [user, ...this.users$.value];
    this.users$.next(list);
    this.saveToStorage('users', list);
  }

  updateUser(updated: User): void {
    const list = this.users$.value.map(u => (u.id === updated.id ? updated : u));
    this.users$.next(list);
    this.saveToStorage('users', list);
  }

  deleteUser(userId: string): void {
    const user = this.users$.value.find(u => u.id === userId);
    if (user?.role === 'super_admin') {
      throw new Error('The Host / Super Admin account can never be deleted.');
    }
    const list = this.users$.value.filter(u => u.id !== userId);
    this.users$.next(list);
    this.saveToStorage('users', list);
  }

  // --- Attendance Operations ---
  saveAttendanceRecord(record: AttendanceRecord): void {
    const list = this.attendance$.value;
    const existingIndex = list.findIndex(a => a.id === record.id);
    let updatedList: AttendanceRecord[];

    if (existingIndex > -1) {
      updatedList = [...list];
      updatedList[existingIndex] = record;
    } else {
      updatedList = [record, ...list];
    }
    this.attendance$.next(updatedList);
    this.saveToStorage('attendance', updatedList);
  }

  // --- Leave Operations ---
  saveLeaveRequest(leave: LeaveRequest): void {
    const list = this.leaves$.value;
    const index = list.findIndex(l => l.id === leave.id);
    let updatedList: LeaveRequest[];

    if (index > -1) {
      updatedList = [...list];
      updatedList[index] = leave;
    } else {
      updatedList = [leave, ...list];
    }
    this.leaves$.next(updatedList);
    this.saveToStorage('leaves', updatedList);
  }

  // --- Tasks Operations ---
  saveTask(task: TaskItem): void {
    const list = this.tasks$.value;
    const index = list.findIndex(t => t.id === task.id);
    let updatedList: TaskItem[];

    if (index > -1) {
      updatedList = [...list];
      updatedList[index] = task;
    } else {
      updatedList = [task, ...list];
    }
    this.tasks$.next(updatedList);
    this.saveToStorage('tasks', updatedList);
  }

  deleteTask(taskId: string): void {
    const list = this.tasks$.value.filter(t => t.id !== taskId);
    this.tasks$.next(list);
    this.saveToStorage('tasks', list);
  }

  // --- Daily Work Reports Operations ---
  saveReport(report: DailyWorkReport): void {
    const list = this.reports$.value;
    const index = list.findIndex(r => r.id === report.id);
    let updatedList: DailyWorkReport[];

    if (index > -1) {
      updatedList = [...list];
      updatedList[index] = report;
    } else {
      updatedList = [report, ...list];
    }
    this.reports$.next(updatedList);
    this.saveToStorage('reports', updatedList);
  }

  // --- Announcements Operations ---
  saveAnnouncement(ann: Announcement): void {
    const list = this.announcements$.value;
    const index = list.findIndex(a => a.id === ann.id);
    let updatedList: Announcement[];

    if (index > -1) {
      updatedList = [...list];
      updatedList[index] = ann;
    } else {
      updatedList = [ann, ...list];
    }
    this.announcements$.next(updatedList);
    this.saveToStorage('announcements', updatedList);
  }

  deleteAnnouncement(id: string): void {
    const list = this.announcements$.value.filter(a => a.id !== id);
    this.announcements$.next(list);
    this.saveToStorage('announcements', list);
  }

  // --- Holidays Operations ---
  saveHoliday(holiday: CompanyHoliday): void {
    const list = this.holidays$.value;
    const index = list.findIndex(h => h.id === holiday.id);
    let updatedList: CompanyHoliday[];

    if (index > -1) {
      updatedList = [...list];
      updatedList[index] = holiday;
    } else {
      updatedList = [...list, holiday];
    }
    this.holidays$.next(updatedList);
    this.saveToStorage('holidays', updatedList);
  }

  deleteHoliday(id: string): void {
    const list = this.holidays$.value.filter(h => h.id !== id);
    this.holidays$.next(list);
    this.saveToStorage('holidays', list);
  }

  // --- Notifications Operations ---
  addNotification(notif: NotificationItem): void {
    const list = [notif, ...this.notifications$.value];
    this.notifications$.next(list);
    this.saveToStorage('notifications', list);
  }

  markNotificationAsRead(id: string): void {
    const list = this.notifications$.value.map(n => (n.id === id ? { ...n, isRead: true } : n));
    this.notifications$.next(list);
    this.saveToStorage('notifications', list);
  }

  markAllNotificationsAsRead(recipientId: string): void {
    const list = this.notifications$.value.map(n => {
      if (n.recipientId === 'all' || n.recipientId === recipientId) {
        return { ...n, isRead: true };
      }
      return n;
    });
    this.notifications$.next(list);
    this.saveToStorage('notifications', list);
  }

  clearNotifications(): void {
    this.notifications$.next([]);
    this.saveToStorage('notifications', []);
  }

  // --- Audit Logs ---
  logAction(log: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const newLog: AuditLog = {
      ...log,
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString()
    };
    const list = [newLog, ...this.auditLogs$.value];
    this.auditLogs$.next(list);
    this.saveToStorage('audit_logs', list);
  }

  // --- Settings ---
  updateSettings(settings: StudioSettings): void {
    this.settings$.next(settings);
    this.saveToStorage('settings', settings);
  }
}
