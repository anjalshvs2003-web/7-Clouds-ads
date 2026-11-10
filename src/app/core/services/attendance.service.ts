import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AttendanceRecord, AttendanceStatus, User, WorkLocation } from '../models';
import { DataService } from './data.service';
import { getTodayDateStringIST } from './ist-date.utils';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  constructor(private dataService: DataService) {}

  getAllAttendance(): Observable<AttendanceRecord[]> {
    return this.dataService.getAttendance();
  }

  getUserAttendance(userId: string): Observable<AttendanceRecord[]> {
    return this.dataService.getAttendance().pipe(
      map(records => records.filter(r => r.userId === userId))
    );
  }

  getTodayRecord(userId: string): Observable<AttendanceRecord | undefined> {
    const today = getTodayDateStringIST();
    return this.dataService.getAttendance().pipe(
      map(records => records.find(r => r.userId === userId && r.date === today))
    );
  }

  getTodayRecordSnapshot(userId: string): AttendanceRecord | undefined {
    const today = getTodayDateStringIST();
    return this.dataService.getAttendanceSnapshot().find(r => r.userId === userId && r.date === today);
  }

  /**
   * Primary Action: CHECK IN
   * Records current date and time automatically in IST.
   * Prevents duplicate check-in.
   */
  checkIn(user: User, location: WorkLocation = 'Studio / On-Site', notes?: string): AttendanceRecord {
    const today = getTodayDateStringIST();
    const existing = this.getTodayRecordSnapshot(user.id);

    if (existing && existing.checkInTime) {
      throw new Error('Attendance already recorded: you have already checked in today.');
    }

    const now = new Date();
    const status: AttendanceStatus = location === 'Work From Home' ? 'Work From Home' : 'Present';

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      employeeId: user.employeeId,
      employeeName: user.name,
      date: today,
      checkInTime: now.toISOString(),
      workingHours: 0,
      status: status,
      workLocation: location,
      notes: notes || undefined
    };

    this.dataService.saveAttendanceRecord(newRecord);

    // Notify Host & HR Admin
    const timeFormatted = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(now);

    this.dataService.addNotification({
      id: `notif-${Date.now()}`,
      recipientId: 'all',
      senderName: user.name,
      title: 'Employee Check-in',
      message: `${user.name} checked in at ${timeFormatted} IST (${location}).`,
      type: 'attendance',
      link: '/attendance',
      isRead: false,
      createdAt: now.toISOString()
    });

    return newRecord;
  }

  /**
   * Primary Action: CHECK OUT
   * Records checkout time and calculates exact working hours.
   * Disables checkout and marks shift completed.
   */
  checkOut(recordId: string, notes?: string): AttendanceRecord {
    const records = this.dataService.getAttendanceSnapshot();
    const record = records.find(r => r.id === recordId);

    if (!record) {
      throw new Error('Attendance record not found.');
    }
    if (record.checkOutTime) {
      throw new Error('Shift already completed: you have already checked out today.');
    }

    const now = new Date();
    const checkIn = new Date(record.checkInTime!);
    const diffMs = now.getTime() - checkIn.getTime();
    const hours = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;

    const settings = this.dataService.getSettingsSnapshot();
    let status = record.status;
    if (hours < settings.halfDayThresholdHours && status === 'Present') {
      status = 'Half Day';
    }

    const updated: AttendanceRecord = {
      ...record,
      checkOutTime: now.toISOString(),
      workingHours: Math.max(hours, 0.1),
      status: status,
      notes: notes ? (record.notes ? `${record.notes} | ${notes}` : notes) : record.notes
    };

    this.dataService.saveAttendanceRecord(updated);

    const timeFormatted = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(now);

    this.dataService.addNotification({
      id: `notif-${Date.now()}`,
      recipientId: 'all',
      senderName: record.employeeName,
      title: 'Employee Checked Out',
      message: `${record.employeeName} checked out at ${timeFormatted} IST (${hours} hrs worked).`,
      type: 'attendance',
      link: '/attendance',
      isRead: false,
      createdAt: now.toISOString()
    });

    return updated;
  }

  /**
   * Correction by Host / HR Admin with audit logging
   */
  correctAttendance(
    recordId: string,
    updates: Partial<AttendanceRecord>,
    reason: string,
    adminUser: User
  ): void {
    const records = this.dataService.getAttendanceSnapshot();
    const record = records.find(r => r.id === recordId);
    if (!record) throw new Error('Record not found.');

    const now = new Date().toISOString();
    const updated: AttendanceRecord = {
      ...record,
      ...updates,
      isCorrected: true,
      correctionReason: reason,
      correctedBy: adminUser.name,
      correctedAt: now
    };

    this.dataService.saveAttendanceRecord(updated);

    this.dataService.logAction({
      actorId: adminUser.id,
      actorName: adminUser.name,
      action: 'CORRECTED_ATTENDANCE',
      targetEntity: 'AttendanceRecord',
      targetId: recordId,
      details: `Corrected attendance for ${record.employeeName} on ${record.date}. Status: ${updates.status || record.status}, Hours: ${updates.workingHours || record.workingHours}. Reason: ${reason}`
    });

    this.dataService.addNotification({
      id: `notif-${Date.now()}`,
      recipientId: record.userId,
      senderName: adminUser.name,
      title: 'Attendance Corrected by HR/Host',
      message: `Your attendance for ${record.date} was updated by ${adminUser.name}. Note: ${reason}`,
      type: 'attendance',
      link: '/attendance',
      isRead: false,
      createdAt: now
    });
  }

  calculateLiveHours(checkInTimeStr?: string, checkOutTimeStr?: string): number {
    if (!checkInTimeStr) return 0;
    const start = new Date(checkInTimeStr).getTime();
    const end = checkOutTimeStr ? new Date(checkOutTimeStr).getTime() : Date.now();
    const diffHours = (end - start) / (1000 * 60 * 60);
    return Math.max(0, Math.round(diffHours * 10) / 10);
  }
}
