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
 * Official Staff Accounts for 7 Clouds
 * 1. Athira Girish (HR Admin) - 9847921883
 * 2. Anjalsh V.S (Host / Super Admin) - 8086351883
 * 3. Adithya Kumar (Video Editor) - 8078415501
 * 4. Nehil (Graphics Designer) - 9605770326
 * 5. Nadiya (Junior Video Editor) - 9846084217
 */
export const INITIAL_USERS: User[] = [
  {
    id: 'user-anjalsh',
    employeeId: '7C-HOST001',
    name: 'Anjalsh V.S',
    email: 'anjalsh@7clouds.studio',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '8086351883',
    designation: 'Senior Video Editor',
    department: 'Post-Production / Studio Lead',
    joiningDate: '2023-01-01',
    status: 'active',
    role: 'super_admin', // Host / Super Admin (Primary Owner)
    leaveBalances: { casual: 14, sick: 10, emergency: 5, total: 29 },
    skills: ['Cinematic Storytelling', 'DaVinci Resolve HDR', 'Premiere Pro', 'Studio Direction'],
    bio: 'Studio Host & Senior Video Editor leading cinematic vision and production velocity at 7 Clouds.'
  },
  {
    id: 'user-athira',
    employeeId: '7C-HR001',
    name: 'Athira Girish',
    email: 'athira@7clouds.studio',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '9847921883',
    designation: 'HR',
    department: 'Management / HR',
    joiningDate: '2023-03-15',
    status: 'active',
    role: 'hr_admin', // HR Admin
    leaveBalances: { casual: 12, sick: 10, emergency: 5, total: 27 },
    skills: ['Talent Operations', 'Attendance Compliance', 'People Care', 'Resource Planning'],
    bio: 'HR Lead managing studio culture, employee attendance, talent relations and workflows.'
  },
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
    role: 'employee',
    leaveBalances: { casual: 10, sick: 8, emergency: 4, total: 22 },
    skills: ['Premiere Pro', 'After Effects', 'Pacing & Transitions', 'Audio Synchronization'],
    bio: 'Crafting high-impact commercial video edits, kinetic typography and digital ads.'
  },
  {
    id: 'user-nehil',
    employeeId: '7C-EMP002',
    name: 'Nehil',
    email: 'nehil@7clouds.studio',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    phone: '9605770326',
    designation: 'Graphics Designer',
    department: 'Visual Design',
    joiningDate: '2024-01-10',
    status: 'active',
    role: 'employee',
    leaveBalances: { casual: 12, sick: 10, emergency: 5, total: 27 },
    skills: ['Figma', 'Photoshop', 'Illustrator', 'Futuristic UI', 'Brand Identity'],
    bio: 'Specializing in futuristic visual designs, promotional posters and visual assets.'
  },
  {
    id: 'user-nadiya',
    employeeId: '7C-EMP003',
    name: 'Nadiya',
    email: 'nadiya@7clouds.studio',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    phone: '9846084217',
    designation: 'Junior Video Editor',
    department: 'Creative Post-Production',
    joiningDate: '2024-05-15',
    status: 'active',
    role: 'employee',
    leaveBalances: { casual: 11, sick: 9, emergency: 5, total: 25 },
    skills: ['Short-Form Cuts', 'Reels/TikTok Ads', 'Color Correction', 'B-Roll Sync'],
    bio: 'Dynamic video editor assembling snappy social clips and commercial teasers.'
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
    userId: 'user-anjalsh',
    employeeId: '7C-HOST001',
    employeeName: 'Anjalsh V.S',
    date: getTodayDateStringIST(),
    checkInTime: new Date(Date.now() - 4.0 * 3600000).toISOString(),
    workingHours: 4.0,
    status: 'Present',
    workLocation: 'Studio / On-Site',
    notes: 'Supervising post-production masters and video suites.'
  },
  {
    id: 'att-2',
    userId: 'user-athira',
    employeeId: '7C-HR001',
    employeeName: 'Athira Girish',
    date: getTodayDateStringIST(),
    checkInTime: new Date(Date.now() - 4.5 * 3600000).toISOString(),
    workingHours: 4.5,
    status: 'Present',
    workLocation: 'Studio / On-Site',
    notes: 'HR review and studio staff management.'
  },
  {
    id: 'att-3',
    userId: 'user-adithya',
    employeeId: '7C-EMP001',
    employeeName: 'Adithya Kumar',
    date: getTodayDateStringIST(),
    checkInTime: new Date(Date.now() - 3.2 * 3600000).toISOString(),
    workingHours: 3.2,
    status: 'Present',
    workLocation: 'Studio / On-Site',
    notes: 'Editing commercial campaign timelines.'
  }
];

export const INITIAL_LEAVES: LeaveRequest[] = [
  {
    id: 'leave-1',
    userId: 'user-nadiya',
    employeeId: '7C-EMP003',
    employeeName: 'Nadiya',
    employeeAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    leaveType: 'Casual Leave',
    startDate: getDateOffsetIST(3),
    endDate: getDateOffsetIST(3),
    daysCount: 1,
    reason: 'Family event and personal work.',
    status: 'Pending',
    submittedAt: new Date(Date.now() - 6 * 3600000).toISOString()
  },
  {
    id: 'leave-2',
    userId: 'user-nehil',
    employeeId: '7C-EMP002',
    employeeName: 'Nehil',
    employeeAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    leaveType: 'Casual Leave',
    startDate: getDateOffsetIST(8),
    endDate: getDateOffsetIST(9),
    daysCount: 2,
    reason: 'Out of station personal trip.',
    status: 'Approved',
    submittedAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    reviewedBy: 'Athira Girish',
    reviewedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    reviewNotes: 'Approved. Deliverables rescheduled.'
  }
];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Master Color Grade & 4K ProRes Export',
    projectName: '7 Clouds Main Commercial 2026',
    description: 'Apply high-contrast film LUT, balance skin tones, and generate 4K HDR master output.',
    assignedTo: 'user-anjalsh',
    assignedToName: 'Anjalsh V.S',
    assignedToAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdBy: 'user-anjalsh',
    createdByName: 'Anjalsh V.S',
    createdDate: getDateOffsetIST(-1),
    dueDate: getDateOffsetIST(0),
    estimatedHours: 5,
    actualHours: 3.5,
    priority: 'Urgent',
    status: 'In Progress',
    completionPercentage: 70
  },
  {
    id: 'task-2',
    title: 'Rough Cut Timeline Assembly for Client Promo',
    projectName: 'Cyberpunk Teaser Campaign',
    description: 'Synchronize 140 BPM audio track with action cuts, insert sound effects and text overlays.',
    assignedTo: 'user-adithya',
    assignedToName: 'Adithya Kumar',
    assignedToAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdBy: 'user-athira',
    createdByName: 'Athira Girish',
    createdDate: getDateOffsetIST(-2),
    dueDate: getDateOffsetIST(1),
    estimatedHours: 6,
    actualHours: 2.0,
    priority: 'High',
    status: 'In Progress',
    completionPercentage: 50
  },
  {
    id: 'task-3',
    title: 'Design Dark Mode UI Visuals & Campaign Posters',
    projectName: 'Aura Studio Rebrand',
    description: 'Create high-res vector graphics, typography lockups and electric blue banner assets.',
    assignedTo: 'user-nehil',
    assignedToName: 'Nehil',
    assignedToAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    createdBy: 'user-anjalsh',
    createdByName: 'Anjalsh V.S',
    createdDate: getDateOffsetIST(-3),
    dueDate: getDateOffsetIST(2),
    estimatedHours: 8,
    actualHours: 0,
    priority: 'Medium',
    status: 'Not Started',
    completionPercentage: 0
  },
  {
    id: 'task-4',
    title: 'Instagram Reels & Shorts 9:16 Re-edits',
    projectName: 'Viral Social Showcase',
    description: 'Repackage landscape footage into 9:16 vertical cuts with dynamic captions and hooks.',
    assignedTo: 'user-nadiya',
    assignedToName: 'Nadiya',
    assignedToAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    createdBy: 'user-athira',
    createdByName: 'Athira Girish',
    createdDate: getDateOffsetIST(-1),
    dueDate: getDateOffsetIST(0),
    estimatedHours: 4,
    actualHours: 4.0,
    priority: 'Urgent',
    status: 'Completed',
    completionPercentage: 100,
    completedAt: new Date(Date.now() - 2 * 3600000).toISOString()
  }
];

export const INITIAL_REPORTS: DailyWorkReport[] = [
  {
    id: 'report-1',
    userId: 'user-anjalsh',
    employeeId: '7C-HOST001',
    employeeName: 'Anjalsh V.S',
    employeeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
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
