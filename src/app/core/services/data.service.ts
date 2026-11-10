import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
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

import { hashPassword } from './security.utils';
import { formatDateTimeIST, getTodayDateStringIST } from './ist-date.utils';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  // Use v3 prefix for private Host account + public employee registration system
  private readonly STORAGE_PREFIX = '7clouds_v3_';

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
    // If no v3 users found or old Host name was embedded in users, initialize clean staff directory
    if (!storedUsers || storedUsers.some(u => u.name.includes('Anjalsh') || u.role === 'HOST' || (u.role as string) === 'super_admin')) {
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
    // Strictly exclude any Host account from staff directories
    return this.users$.pipe(
      map(users => users.filter(u => u.role !== 'HOST' && (u.role as string) !== 'super_admin'))
    );
  }

  getRegisteredEmployees(): Observable<User[]> {
    return this.users$.pipe(
      map(users => users.filter(u => u.role !== 'HOST' && (u.role as string) !== 'super_admin'))
    );
  }

  getPendingRegistrations(): Observable<User[]> {
    return this.users$.pipe(
      map(users => users.filter(u => u.status === 'pending_approval'))
    );
  }

  getActiveEmployees(): Observable<User[]> {
    return this.users$.pipe(
      map(users => users.filter(u => u.status === 'active' && u.role !== 'HOST' && (u.role as string) !== 'super_admin'))
    );
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
    if (user?.role === 'HOST' || (user?.role as string) === 'super_admin') {
      throw new Error('The Host / Super Admin account can never be deleted.');
    }
    const list = this.users$.value.filter(u => u.id !== userId);
    this.users$.next(list);
    this.saveToStorage('users', list);
  }

  // --- Employee Registration & Host Approval System ---
  generateNextEmployeeId(): string {
    const users = this.users$.value;
    let maxNum = 0;
    for (const u of users) {
      if (u.employeeId && u.employeeId.startsWith('7C-EMP')) {
        const numPart = parseInt(u.employeeId.replace('7C-EMP', ''), 10);
        if (!isNaN(numPart) && numPart > maxNum) {
          maxNum = numPart;
        }
      }
    }
    const nextNum = (maxNum + 1).toString().padStart(3, '0');
    return `7C-EMP${nextNum}`;
  }

  registerEmployee(data: {
    name: string;
    phone: string;
    designation: string;
    email: string;
    password: string;
  }): User {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPhone = data.phone.trim();
    const users = this.users$.value;

    // Check duplicate
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error(`An account with email '${data.email}' is already registered.`);
    }
    if (users.some(u => u.phone === cleanPhone)) {
      throw new Error(`An account with phone number '${data.phone}' is already registered.`);
    }

    const employeeId = this.generateNextEmployeeId();
    const newUser: User = {
      id: 'user-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      employeeId,
      name: data.name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      designation: data.designation.trim() || 'Staff Specialist',
      department: 'Creative Studio',
      joiningDate: getTodayDateStringIST(),
      status: 'pending_approval',
      role: 'EMPLOYEE',
      passwordHash: hashPassword(data.password),
      registeredAt: formatDateTimeIST(new Date()),
      registeredViaPublicForm: true,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      leaveBalances: { casual: 12, sick: 10, emergency: 5, total: 27 },
      skills: ['Workspace Operations'],
      bio: 'Registered staff specialist at 7 Clouds Studio.'
    };

    this.addUser(newUser);

    // Create notification for Host
    this.addNotification({
      id: 'notif-' + Date.now(),
      recipientId: 'all',
      title: 'New Registration Pending Approval',
      message: `${newUser.name} (${newUser.designation}) registered and is awaiting Host approval.`,
      createdAt: formatDateTimeIST(new Date()),
      isRead: false,
      type: 'system',
      link: '/employees'
    });

    return newUser;
  }

  approveRegistration(userId: string): void {
    const user = this.users$.value.find(u => u.id === userId);
    if (!user) return;
    const updated: User = {
      ...user,
      status: 'active',
      approvedAt: formatDateTimeIST(new Date())
    };
    this.updateUser(updated);

    this.addNotification({
      id: 'notif-' + Date.now(),
      recipientId: 'all',
      title: 'Employee Approved',
      message: `${user.name} (${user.employeeId}) has been approved by the Host and can now log in.`,
      createdAt: formatDateTimeIST(new Date()),
      isRead: false,
      type: 'system'
    });
  }

  rejectRegistration(userId: string, reason: string = 'Registration not approved'): void {
    const user = this.users$.value.find(u => u.id === userId);
    if (!user) return;
    const updated: User = {
      ...user,
      status: 'rejected',
      rejectedReason: reason
    };
    this.updateUser(updated);
  }

  promoteToHr(userId: string): void {
    const user = this.users$.value.find(u => u.id === userId);
    if (!user) return;
    const updated: User = {
      ...user,
      role: 'HR ADMIN'
    };
    this.updateUser(updated);

    this.addNotification({
      id: 'notif-' + Date.now(),
      recipientId: 'all',
      title: 'HR Role Assigned',
      message: `${user.name} was promoted to HR Admin by the Host.`,
      createdAt: formatDateTimeIST(new Date()),
      isRead: false,
      type: 'system'
    });
  }

  demoteToEmployee(userId: string): void {
    const user = this.users$.value.find(u => u.id === userId);
    if (!user) return;
    const updated: User = {
      ...user,
      role: 'EMPLOYEE'
    };
    this.updateUser(updated);
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
