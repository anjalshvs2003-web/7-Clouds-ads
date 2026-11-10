import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { DailyWorkReport, User, WorkCategory } from '../models';
import { DataService } from './data.service';
import { getTodayDateString } from './mock-data';

@Injectable({
  providedIn: 'root'
})
export class WorkReportService {
  constructor(private dataService: DataService) {}

  getAllReports(): Observable<DailyWorkReport[]> {
    return this.dataService.getReports();
  }

  getUserReports(userId: string): Observable<DailyWorkReport[]> {
    return this.dataService.getReports().pipe(
      map(reports => reports.filter(r => r.userId === userId))
    );
  }

  submitReport(
    user: User,
    data: {
      date?: string;
      projectName: string;
      workDescription: string;
      category: WorkCategory;
      timeSpentHours: number;
      taskStatus: DailyWorkReport['taskStatus'];
      referenceUrl?: string;
    }
  ): DailyWorkReport {
    const reportDate = data.date || getTodayDateString();

    const newReport: DailyWorkReport = {
      id: `report-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      employeeId: user.employeeId,
      employeeName: user.name,
      employeeAvatar: user.avatar,
      date: reportDate,
      projectName: data.projectName,
      workDescription: data.workDescription,
      category: data.category,
      timeSpentHours: data.timeSpentHours,
      taskStatus: data.taskStatus,
      referenceUrl: data.referenceUrl,
      submittedAt: new Date().toISOString()
    };

    this.dataService.saveReport(newReport);

    // Notify HR
    this.dataService.addNotification({
      id: `notif-${Date.now()}`,
      recipientId: 'user-admin',
      senderName: user.name,
      title: 'Daily Work Report Submitted',
      message: `${user.name} submitted their report for "${data.projectName}" (${data.timeSpentHours} hrs).`,
      type: 'report',
      link: '/work-reports',
      isRead: false,
      createdAt: new Date().toISOString()
    });

    return newReport;
  }
}
