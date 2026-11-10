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
 * Registered Staff Directory for 7 Clouds
 * Clean state: All employees register themselves with their own User ID and Password.
 * The Host account is private, provisioned securely via environment configuration.
 */
export const INITIAL_USERS: User[] = [];

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

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];

export const INITIAL_LEAVES: LeaveRequest[] = [];

export const INITIAL_TASKS: TaskItem[] = [];

export const INITIAL_REPORTS: DailyWorkReport[] = [];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: '7 Clouds Studio Workspace Live',
    content: 'Welcome to 7 Clouds workspace. New staff can create their account with a custom User ID and password.',
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
    senderName: 'Anjalsh V.S',
    title: 'Studio System Updated',
    message: 'Simplified Attendance Check-In / Check-Out and Task Status buttons are online.',
    type: 'announcement',
    link: '/announcements',
    isRead: false,
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-1',
    actorId: 'user-anjalsh',
    actorName: 'Anjalsh V.S',
    action: 'INITIALIZED_STAFF_DIRECTORY',
    targetEntity: 'User',
    targetId: 'all',
    details: 'Configured official accounts for Athira Girish, Anjalsh V.S, Adithya Kumar, Nehil, and Nadiya.',
    timestamp: new Date().toISOString()
  }
];
