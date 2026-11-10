import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { LeaveRequest, LeaveStatus, User } from '../models';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  constructor(private dataService: DataService) {}

  getAllLeaves(): Observable<LeaveRequest[]> {
    return this.dataService.getLeaves();
  }

  getUserLeaves(userId: string): Observable<LeaveRequest[]> {
    return this.dataService.getLeaves().pipe(
      map(leaves => leaves.filter(l => l.userId === userId))
    );
  }

  submitLeaveRequest(
    user: User,
    data: {
      leaveType: LeaveRequest['leaveType'];
      startDate: string;
      endDate: string;
      halfDayPeriod?: 'First Half' | 'Second Half';
      reason: string;
      attachmentUrl?: string;
    }
  ): LeaveRequest {
    // Validate overlapping active requests
    const existing = this.dataService.getLeavesSnapshot().filter(
      l => l.userId === user.id && l.status !== 'Rejected' && l.status !== 'Cancelled'
    );

    const newStart = new Date(data.startDate).getTime();
    const newEnd = new Date(data.endDate).getTime();

    if (newEnd < newStart) {
      throw new Error('End date cannot be prior to start date.');
    }

    const hasOverlap = existing.some(l => {
      const eStart = new Date(l.startDate).getTime();
      const eEnd = new Date(l.endDate).getTime();
      return (newStart <= eEnd && newEnd >= eStart);
    });

    if (hasOverlap) {
      throw new Error('You already have an existing leave request spanning these dates.');
    }

    // Calculate days count
    let daysCount = 1;
    if (data.leaveType === 'Half Day Leave') {
      daysCount = 0.5;
    } else {
      const diffTime = Math.abs(newEnd - newStart);
      daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    const newRequest: LeaveRequest = {
      id: `leave-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      employeeId: user.employeeId,
      employeeName: user.name,
      employeeAvatar: user.avatar,
      leaveType: data.leaveType,
      startDate: data.startDate,
      endDate: data.endDate,
      daysCount,
      halfDayPeriod: data.halfDayPeriod,
      reason: data.reason,
      attachmentUrl: data.attachmentUrl,
      status: 'Pending',
      submittedAt: new Date().toISOString()
    };

    this.dataService.saveLeaveRequest(newRequest);

    // Notify HR
    this.dataService.addNotification({
      id: `notif-${Date.now()}`,
      recipientId: 'user-admin',
      senderName: user.name,
      title: 'New Leave Request Submitted',
      message: `${user.name} submitted a ${data.leaveType} (${daysCount} day${daysCount > 1 ? 's' : ''}) for ${data.startDate}.`,
      type: 'leave',
      link: '/leave',
      isRead: false,
      createdAt: new Date().toISOString()
    });

    return newRequest;
  }

  reviewLeaveRequest(
    leaveId: string,
    status: 'Approved' | 'Rejected',
    reviewNotes: string,
    reviewer: User
  ): void {
    const leaves = this.dataService.getLeavesSnapshot();
    const leave = leaves.find(l => l.id === leaveId);
    if (!leave) throw new Error('Leave request not found.');

    const now = new Date().toISOString();
    const updated: LeaveRequest = {
      ...leave,
      status,
      reviewedBy: reviewer.name,
      reviewedAt: now,
      reviewNotes
    };

    this.dataService.saveLeaveRequest(updated);

    // If approved, update user's leave balance
    if (status === 'Approved') {
      const users = this.dataService.getUsersSnapshot();
      const user = users.find(u => u.id === leave.userId);
      if (user) {
        const balances = { ...user.leaveBalances };
        if (leave.leaveType === 'Casual Leave' || leave.leaveType === 'Full Day Leave') {
          balances.casual = Math.max(0, balances.casual - leave.daysCount);
        } else if (leave.leaveType === 'Sick Leave') {
          balances.sick = Math.max(0, balances.sick - leave.daysCount);
        } else if (leave.leaveType === 'Emergency Leave') {
          balances.emergency = Math.max(0, balances.emergency - leave.daysCount);
        }
        balances.total = Math.max(0, balances.total - leave.daysCount);
        this.dataService.updateUser({ ...user, leaveBalances: balances });
      }
    }

    // Audit log
    this.dataService.logAction({
      actorId: reviewer.id,
      actorName: reviewer.name,
      action: status === 'Approved' ? 'APPROVED_LEAVE' : 'REJECTED_LEAVE',
      targetEntity: 'LeaveRequest',
      targetId: leaveId,
      details: `${status} leave for ${leave.employeeName} (${leave.daysCount} days, ${leave.startDate}). Notes: ${reviewNotes}`
    });

    // Notify employee
    this.dataService.addNotification({
      id: `notif-${Date.now()}`,
      recipientId: leave.userId,
      senderName: reviewer.name,
      title: `Leave Request ${status}`,
      message: `Your ${leave.leaveType} from ${leave.startDate} to ${leave.endDate} has been ${status.toLowerCase()} by ${reviewer.name}.`,
      type: 'leave',
      link: '/leave',
      isRead: false,
      createdAt: now
    });
  }

  cancelLeaveRequest(leaveId: string, userId: string): void {
    const leaves = this.dataService.getLeavesSnapshot();
    const leave = leaves.find(l => l.id === leaveId);
    if (!leave) throw new Error('Leave request not found.');
    if (leave.userId !== userId) throw new Error('Unauthorized to cancel this request.');
    if (leave.status !== 'Pending') throw new Error('Only pending requests can be cancelled.');

    const updated: LeaveRequest = {
      ...leave,
      status: 'Cancelled'
    };
    this.dataService.saveLeaveRequest(updated);
  }
}
