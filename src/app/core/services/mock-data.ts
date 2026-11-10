import {
  User,
  AttendanceRecord,
  LeaveRequest,
  TaskItem,
  DailyWorkReport,
  Announcement,
  CompanyHoliday,
  NotificationItem,
  StudioSettings,
  AuditLog
} from '../models';
import { getTodayDateStringIST, getDateOffsetIST } from './ist-date.utils';
import { hashPassword } from './security.utils';

// Re-export IST date utility aliases for backwards compatibility
export { getTodayDateStringIST as getTodayDateString, getDateOffsetIST as getDateOffset } from './ist-date.utils';

export const INITIAL_SETTINGS: StudioSettings = {
  studioName: '7 Clouds Creative Studio',
  attendanceCutoffTime: '10:30',
  standardWorkingHours: 8,
  halfDayThresholdHours: 4,
  allowSelfCheckIn: true,
  fcmEnabled: true,
  demoMode: true
};

/**
 * Official Staff Account for Adithya Kumar
 * Active Video Editor account with passwordless instant 1-click access on the main page.
 */
export const ADITHYA_USER: User = {
  id: 'user-adithya',
  employeeId: '7C-EMP001',
  username: 'adithya',
  name: 'Adithya Kumar',
  email: 'adithya@7clouds.studio',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  phone: '8078415501',
  designation: 'Video Editor',
  department: 'Creative Post-Production',
  joiningDate: '2023-08-01',
  status: 'active',
  role: 'EMPLOYEE',
  passwordHash: hashPassword('password123'),
  leaveBalances: { casual: 12, sick: 10, emergency: 5, total: 27 },
  skills: ['Premiere Pro', 'After Effects', 'Color Grading', 'Sound Design'],
  bio: 'Creative Video Editor at 7 Clouds Studio.'
};

export const INITIAL_USERS: User[] = [ADITHYA_USER];

export const INITIAL_HOLIDAYS: CompanyHoliday[] = [
  {
    id: 'hol-1',
    title: 'New Year Studio Kickoff',
    date: '2026-01-01',
    type: 'Studio Holiday',
    description: 'Welcome to the creative year.'
  },
  {
    id: 'hol-2',
    title: 'Studio Creative Break',
    date: getDateOffsetIST(14),
    type: 'Studio Holiday',
    description: 'Team recharge and creative exploration.'
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-adi-today',
    userId: 'user-adithya',
    employeeId: '7C-EMP001',
    employeeName: 'Adithya Kumar',
    date: getTodayDateStringIST(),
    checkInTime: '09:30 AM',
    workingHours: 4.5,
    status: 'Present',
    workLocation: 'Studio / On-Site',
    notes: 'Checked in at 7 Clouds Studio editing suite.'
  }
];

export const INITIAL_LEAVES: LeaveRequest[] = [];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task-adi-1',
    title: 'Brand Commercial Cut & Color Grading',
    projectName: '7 Clouds Client Commercial',
    description: 'Assemble multi-cam timeline, sync audio stems, apply color grading passes and export master for client review.',
    assignedTo: 'user-adithya',
    assignedToName: 'Adithya Kumar',
    assignedToAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdBy: 'host-root-master-001',
    createdByName: 'Host Administrator',
    createdDate: getTodayDateStringIST(),
    dueDate: getDateOffsetIST(2),
    estimatedHours: 12,
    actualHours: 6,
    priority: 'High',
    status: 'In Progress',
    completionPercentage: 65
  },
  {
    id: 'task-adi-2',
    title: 'Instagram Reels Package #12',
    projectName: 'Agency Social Media',
    description: 'Cut 3 short-form dynamic reels with captions, sound effects, and kinetic typography.',
    assignedTo: 'user-adithya',
    assignedToName: 'Adithya Kumar',
    assignedToAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdBy: 'host-root-master-001',
    createdByName: 'Host Administrator',
    createdDate: getTodayDateStringIST(),
    dueDate: getDateOffsetIST(4),
    estimatedHours: 8,
    actualHours: 0,
    priority: 'Medium',
    status: 'Not Started',
    completionPercentage: 0
  }
];

export const INITIAL_REPORTS: DailyWorkReport[] = [];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: '7 Clouds Studio Workspace Live',
    content: 'Welcome to 7 Clouds workspace. Adithya Kumar (adithya@7clouds.studio) is active with 1-click workspace entry.',
    priority: 'Normal',
    publishedBy: 'host-root-master-001',
    publishedByName: 'Host Administrator',
    publishedAt: new Date().toISOString(),
    pinned: true,
    targetAudience: 'all'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    recipientId: 'all',
    senderName: 'Host Administrator',
    title: 'Studio System Updated',
    message: 'Simplified Attendance Check-In / Check-Out and 1-Click Access for Adithya Kumar are online.',
    type: 'announcement',
    link: '/announcements',
    isRead: false,
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-1',
    actorId: 'host-root-master-001',
    actorName: 'Host Administrator',
    action: 'PROVISIONED_EMPLOYEE_ACCOUNT',
    targetEntity: 'User',
    targetId: 'user-adithya',
    details: 'Configured official active employee account for Adithya Kumar (adithya@7clouds.studio) with 1-click login.',
    timestamp: new Date().toISOString()
  }
];
