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
 * Official Staff Accounts for 7 Clouds Creative Studio
 */
export const ANJALSH_USER: User = {
  id: 'user-anjalsh',
  employeeId: '7C-HOST',
  username: 'anjalsh',
  name: 'Anjalsh V.S',
  email: 'anjalsh@7clouds.studio',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  phone: '8086351883',
  designation: 'Senior Video Editor & Workspace Host',
  department: 'Creative Direction',
  joiningDate: '2023-01-01',
  status: 'active',
  role: 'HOST',
  passwordHash: hashPassword('password123'),
  leaveBalances: { casual: 30, sick: 20, emergency: 10, total: 60 },
  skills: ['Creative Direction', 'Senior Video Editing', 'Studio Architecture'],
  bio: 'Workspace Host & Super Admin at 7 Clouds Studio.'
};

export const ATHIRA_USER: User = {
  id: 'user-athira',
  employeeId: '7C-HR001',
  username: 'athira',
  name: 'Athira Girish',
  email: 'athira@7clouds.studio',
  avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  phone: '9847921883',
  designation: 'HR',
  department: 'People & Operations',
  joiningDate: '2023-03-01',
  status: 'active',
  role: 'HR ADMIN',
  passwordHash: hashPassword('password123'),
  leaveBalances: { casual: 15, sick: 12, emergency: 5, total: 32 },
  skills: ['Human Resources', 'Team Operations', 'Staff Coordination'],
  bio: 'HR Administrator at 7 Clouds Studio.'
};

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

export const NEHIL_USER: User = {
  id: 'user-nehil',
  employeeId: '7C-EMP002',
  username: 'nehil',
  name: 'Nehil',
  email: 'nehil@7clouds.studio',
  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  phone: '9605770326',
  designation: 'Graphics Designer',
  department: 'Brand & Visual Design',
  joiningDate: '2023-09-01',
  status: 'active',
  role: 'EMPLOYEE',
  passwordHash: hashPassword('password123'),
  leaveBalances: { casual: 12, sick: 10, emergency: 5, total: 27 },
  skills: ['Brand Identity', 'Photoshop', 'Illustrator', 'Poster Design'],
  bio: 'Graphic Designer at 7 Clouds Studio.'
};

export const NADIYA_USER: User = {
  id: 'user-nadiya',
  employeeId: '7C-EMP003',
  username: 'nadiya',
  name: 'Nadiya',
  email: 'nadiya@7clouds.studio',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  phone: '9846084217',
  designation: 'Junior Video Editor',
  department: 'Creative Post-Production',
  joiningDate: '2024-01-15',
  status: 'active',
  role: 'EMPLOYEE',
  passwordHash: hashPassword('password123'),
  leaveBalances: { casual: 12, sick: 10, emergency: 5, total: 27 },
  skills: ['Video Assembly', 'Audio Sync', 'Motion Graphics Basics'],
  bio: 'Junior Video Editor at 7 Clouds Studio.'
};

export const INITIAL_USERS: User[] = [
  ANJALSH_USER,
  ATHIRA_USER,
  ADITHYA_USER,
  NEHIL_USER,
  NADIYA_USER
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
    id: 'att-past-1',
    userId: 'user-adithya',
    employeeId: '7C-EMP001',
    employeeName: 'Adithya Kumar',
    date: getDateOffsetIST(-1),
    checkInTime: `${getDateOffsetIST(-1)}T09:30:00.000Z`,
    checkOutTime: `${getDateOffsetIST(-1)}T18:00:00.000Z`,
    workingHours: 8.5,
    status: 'Present',
    workLocation: 'Studio / On-Site',
    notes: 'Completed edit suite timeline passes.'
  },
  {
    id: 'att-past-2',
    userId: 'user-athira',
    employeeId: '7C-HR001',
    employeeName: 'Athira Girish',
    date: getDateOffsetIST(-1),
    checkInTime: `${getDateOffsetIST(-1)}T09:15:00.000Z`,
    checkOutTime: `${getDateOffsetIST(-1)}T17:45:00.000Z`,
    workingHours: 8.5,
    status: 'Present',
    workLocation: 'Studio / On-Site',
    notes: 'HR operations and staff coordination.'
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
    createdBy: 'user-anjalsh',
    createdByName: 'Anjalsh V.S',
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
    createdBy: 'user-anjalsh',
    createdByName: 'Anjalsh V.S',
    createdDate: getTodayDateStringIST(),
    dueDate: getDateOffsetIST(4),
    estimatedHours: 8,
    actualHours: 0,
    priority: 'Medium',
    status: 'Not Started',
    completionPercentage: 0
  },
  {
    id: 'task-nehil-1',
    title: 'Brand Identity Vector Assets',
    projectName: 'Client Rebrand 2026',
    description: 'Design typography lockups, icon grid and brand guideline presentation slides.',
    assignedTo: 'user-nehil',
    assignedToName: 'Nehil',
    assignedToAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    createdBy: 'user-anjalsh',
    createdByName: 'Anjalsh V.S',
    createdDate: getTodayDateStringIST(),
    dueDate: getDateOffsetIST(3),
    estimatedHours: 10,
    actualHours: 3,
    priority: 'High',
    status: 'In Progress',
    completionPercentage: 40
  },
  {
    id: 'task-nadiya-1',
    title: 'B-Roll Logging and Rough Assembly',
    projectName: 'Documentary Commercial',
    description: 'Ingest 4K footage, label scene metadata, sync interview audio, and prepare assembly bin.',
    assignedTo: 'user-nadiya',
    assignedToName: 'Nadiya',
    assignedToAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    createdBy: 'user-anjalsh',
    createdByName: 'Anjalsh V.S',
    createdDate: getTodayDateStringIST(),
    dueDate: getDateOffsetIST(1),
    estimatedHours: 6,
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
    content: 'Welcome to 7 Clouds Studio workspace. Staff members can sign in or register their official account.',
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
    title: 'Studio Workspace Active',
    message: 'Attendance tracking, leave management, and daily task management are online.',
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
    action: 'INITIALIZED_WORKSPACE',
    targetEntity: 'System',
    targetId: 'system',
    details: 'Initialized studio workspace database and staff governance systems.',
    timestamp: new Date().toISOString()
  }
];
