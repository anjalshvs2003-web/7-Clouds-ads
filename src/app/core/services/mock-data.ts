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
 * NOTE: The Host account is private, provisioned securely via environment configuration,
 * and is strictly excluded from this employee directory as per security requirements.
 */
export const INITIAL_USERS: User[] = [
  {
    id: 'user-adithya',
    employeeId: '7C-EMP001',
    name: 'Adithya Kumar',
    email: 'adithya@7clouds.studio',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '8078415501',
    designation: 'Video Editor',
    department: 'Creative Post-Production',
    joiningDate: '2023-08-01',
    status: 'active',
    role: 'EMPLOYEE',
    passwordHash: '7c_sec_password123',
    leaveBalances: { casual: 10, sick: 8, emergency: 4, total: 22 },
    skills: ['Premiere Pro', 'After Effects', 'Pacing & Transitions', 'Audio Synchronization'],
    bio: 'Crafting high-impact commercial video edits, kinetic typography and digital ads.'
  },
  {
    id: 'user-pending-kavya',
    employeeId: '7C-EMP002',
    name: 'Kavya S.',
    email: 'kavya@7clouds.studio',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '9846001122',
    designation: 'Motion Designer',
    department: 'Visual Design',
    joiningDate: getTodayDateStringIST(),
    status: 'pending_approval',
    role: 'EMPLOYEE',
    passwordHash: '7c_sec_password123',
    registeredAt: '2026-11-10 09:30 IST',
    registeredViaPublicForm: true,
    leaveBalances: { casual: 12, sick: 10, emergency: 5, total: 27 },
    skills: ['3D Motion', 'Cinema 4D', 'After Effects'],
    bio: 'Creative motion designer specializing in title sequences and 3D graphics.'
  }
];

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
    id: 'att-1',
    userId: 'user-adithya',
    employeeId: '7C-EMP001',
    employeeName: 'Adithya Kumar',
    date: getTodayDateStringIST(),
    checkInTime: new Date(Date.now() - 3.5 * 3600000).toISOString(),
    workingHours: 3.5,
    status: 'Present',
    workLocation: 'Studio / On-Site',
    notes: 'Editing commercial campaign timelines.'
  }
];

export const INITIAL_LEAVES: LeaveRequest[] = [
  {
    id: 'leave-1',
    userId: 'user-adithya',
    employeeId: '7C-EMP001',
    employeeName: 'Adithya Kumar',
    employeeAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    leaveType: 'Casual Leave',
    startDate: getDateOffsetIST(5),
    endDate: getDateOffsetIST(5),
    daysCount: 1,
    reason: 'Family event and personal work.',
    status: 'Pending',
    submittedAt: new Date(Date.now() - 6 * 3600000).toISOString()
  }
];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Rough Cut Timeline Assembly for Client Promo',
    projectName: 'Cyberpunk Teaser Campaign',
    description: 'Synchronize 140 BPM audio track with action cuts, insert sound effects and text overlays.',
    assignedTo: 'user-adithya',
    assignedToName: 'Adithya Kumar',
    assignedToAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdBy: 'host-root-master-001',
    createdByName: 'Host Administrator',
    createdDate: getDateOffsetIST(-2),
    dueDate: getDateOffsetIST(1),
    estimatedHours: 6,
    actualHours: 2.0,
    priority: 'High',
    status: 'In Progress',
    completionPercentage: 50
  },
  {
    id: 'task-2',
    title: 'Master Color Grade & 4K ProRes Export',
    projectName: '7 Clouds Main Commercial 2026',
    description: 'Apply high-contrast film LUT, balance skin tones, and generate 4K HDR master output.',
    assignedTo: 'user-adithya',
    assignedToName: 'Adithya Kumar',
    assignedToAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdBy: 'host-root-master-001',
    createdByName: 'Host Administrator',
    createdDate: getDateOffsetIST(-1),
    dueDate: getDateOffsetIST(2),
    estimatedHours: 5,
    actualHours: 0,
    priority: 'Urgent',
    status: 'Not Started',
    completionPercentage: 0
  }
];

export const INITIAL_REPORTS: DailyWorkReport[] = [
  {
    id: 'report-1',
    userId: 'user-adithya',
    employeeId: '7C-EMP001',
    employeeName: 'Adithya Kumar',
    employeeAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    date: getDateOffsetIST(-1),
    projectName: '7 Clouds Main Commercial 2026',
    workDescription: 'Completed rough grade and exported test master for sound engineering review.',
    category: 'Video Editing',
    timeSpentHours: 8.0,
    taskStatus: 'In Progress',
    submittedAt: new Date(Date.now() - 24 * 3600000).toISOString()
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Official 7 Clouds Staff Workspace Active',
    content: 'Welcome Athira, Anjalsh, Adithya, Nehil, and Nadiya. The streamlined attendance terminal and task board are now live.',
    priority: 'Important',
    publishedBy: 'user-anjalsh',
    publishedByName: 'Anjalsh V.S (Host)',
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
