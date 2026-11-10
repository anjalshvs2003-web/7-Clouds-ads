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

export const INITIAL_SETTINGS: StudioSettings = {
  studioName: '7 Clouds Creative Studio',
  attendanceCutoffTime: '10:30',
  standardWorkingHours: 8,
  halfDayThresholdHours: 4,
  allowSelfCheckIn: true,
  fcmEnabled: true,
  demoMode: true
};

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    employeeId: '7C-HR001',
    name: 'Elena Rostova',
    email: 'elena@7clouds.studio',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 234-8901',
    designation: 'Studio Director & HR Lead',
    department: 'Management / HR',
    joiningDate: '2023-01-15',
    status: 'active',
    role: 'admin',
    leaveBalances: { casual: 12, sick: 10, emergency: 5, total: 27 },
    skills: ['Talent Ops', 'Studio Production', 'Project Direction', 'Resource Allocation'],
    bio: 'Overseeing creative talent, studio operations and culture at 7 Clouds.'
  },
  {
    id: 'user-emp-1',
    employeeId: '7C-CR001',
    name: 'Leo Vance',
    email: 'leo@7clouds.studio',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 345-6712',
    designation: 'Lead Video Editor',
    department: 'Creative Post-Production',
    joiningDate: '2023-04-10',
    status: 'active',
    role: 'employee',
    leaveBalances: { casual: 10, sick: 8, emergency: 4, total: 22 },
    skills: ['Premiere Pro', 'DaVinci Resolve', 'Color Grading', 'Sound Design'],
    bio: 'Obsessed with kinetic cuts, pacing and cinema-grade color palettes.'
  },
  {
    id: 'user-emp-2',
    employeeId: '7C-CR002',
    name: 'Maya Chen',
    email: 'maya@7clouds.studio',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 456-7823',
    designation: 'Senior Graphic Designer',
    department: 'Visual Design',
    joiningDate: '2023-06-01',
    status: 'active',
    role: 'employee',
    leaveBalances: { casual: 11, sick: 9, emergency: 5, total: 25 },
    skills: ['Figma', 'Illustrator', 'Typography', 'Brand Identity', 'Packaging'],
    bio: 'Crafting minimalist, high-impact brand languages and kinetic typography.'
  },
  {
    id: 'user-emp-3',
    employeeId: '7C-CR003',
    name: 'Kai Thorne',
    email: 'kai@7clouds.studio',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 567-8934',
    designation: 'Motion & 3D Artist',
    department: 'Motion & VFX',
    joiningDate: '2023-08-15',
    status: 'active',
    role: 'employee',
    leaveBalances: { casual: 8, sick: 10, emergency: 3, total: 21 },
    skills: ['Cinema 4D', 'After Effects', 'Blender', 'Octane Render', 'Unreal Engine 5'],
    bio: 'Pushing the boundaries of 3D motion graphics, simulation, and spatial visuals.'
  },
  {
    id: 'user-emp-4',
    employeeId: '7C-CR004',
    name: 'Zara Al-Mansoor',
    email: 'zara@7clouds.studio',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 678-9045',
    designation: 'Digital Marketing Strategist',
    department: 'Growth & Marketing',
    joiningDate: '2024-01-08',
    status: 'active',
    role: 'employee',
    leaveBalances: { casual: 14, sick: 10, emergency: 5, total: 29 },
    skills: ['Paid Ads', 'Omnichannel Growth', 'Viral Strategy', 'Data Analytics', 'Meta Ads'],
    bio: 'Turning creative visuals into viral ad conversions and multi-channel hype.'
  },
  {
    id: 'user-emp-5',
    employeeId: '7C-CR005',
    name: 'Liam O’Connor',
    email: 'liam@7clouds.studio',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 789-0156',
    designation: 'Senior Photographer & DP',
    department: 'Media Production',
    joiningDate: '2023-09-20',
    status: 'active',
    role: 'employee',
    leaveBalances: { casual: 9, sick: 7, emergency: 5, total: 21 },
    skills: ['Studio Lighting', 'Medium Format', 'RED Camera Ops', 'Art Direction'],
    bio: 'Visual storyteller capturing editorial portraiture and futuristic commercial stills.'
  },
  {
    id: 'user-emp-6',
    employeeId: '7C-CR006',
    name: 'Chloe Dubois',
    email: 'chloe@7clouds.studio',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 890-1267',
    designation: 'Creative Content Producer',
    department: 'Content & Strategy',
    joiningDate: '2024-03-12',
    status: 'active',
    role: 'employee',
    leaveBalances: { casual: 12, sick: 10, emergency: 4, total: 26 },
    skills: ['Short-Form Video', 'TikTok/Reels', 'Scriptwriting', 'Influencer Collabs'],
    bio: 'Bridging culture and trends to produce hypnotic short-form content.'
  }
];

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDateOffset(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

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
    title: 'Spring Creative Retreat',
    date: getDateOffset(14),
    type: 'Special Event',
    description: 'Off-site studio creative exploration & team recharge.'
  },
  {
    id: 'hol-3',
    title: 'Design Innovation Day',
    date: getDateOffset(45),
    type: 'Studio Holiday',
    description: 'No client work, internal lab experiments only.'
  },
  {
    id: 'hol-4',
    title: 'Annual Studio Hackathon',
    date: getDateOffset(75),
    type: 'Special Event',
    description: '48-hour generative media & interactive design sprint.'
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-today-1',
    userId: 'user-emp-1',
    employeeId: '7C-CR001',
    employeeName: 'Leo Vance',
    date: getTodayDateString(),
    checkInTime: new Date(Date.now() - 3.5 * 3600000).toISOString(),
    workingHours: 3.5,
    status: 'Present',
    workLocation: 'Studio / On-Site',
    notes: 'Editing the Nike Cyberpunk 60s cut in Suite 1.'
  },
  {
    id: 'att-today-2',
    userId: 'user-emp-2',
    employeeId: '7C-CR002',
    employeeName: 'Maya Chen',
    date: getTodayDateString(),
    checkInTime: new Date(Date.now() - 4.2 * 3600000).toISOString(),
    workingHours: 4.2,
    status: 'Present',
    workLocation: 'Studio / On-Site',
    notes: 'Packaging and brand identity review.'
  },
  {
    id: 'att-today-3',
    userId: 'user-emp-3',
    employeeId: '7C-CR003',
    employeeName: 'Kai Thorne',
    date: getTodayDateString(),
    checkInTime: new Date(Date.now() - 5.0 * 3600000).toISOString(),
    workingHours: 5.0,
    status: 'Work From Home',
    workLocation: 'Work From Home',
    notes: 'Heavy GPU 3D simulation rendering from home workstation.'
  },
  {
    id: 'att-today-4',
    userId: 'user-emp-5',
    employeeId: '7C-CR005',
    employeeName: 'Liam O’Connor',
    date: getTodayDateString(),
    checkInTime: new Date(Date.now() - 2.8 * 3600000).toISOString(),
    workingHours: 2.8,
    status: 'Present',
    workLocation: 'Client Location',
    notes: 'Shooting editorial lookbook on location in SoHo.'
  }
];

export const INITIAL_LEAVES: LeaveRequest[] = [
  {
    id: 'leave-1',
    userId: 'user-emp-6',
    employeeId: '7C-CR006',
    employeeName: 'Chloe Dubois',
    employeeAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    leaveType: 'Full Day Leave',
    startDate: getDateOffset(2),
    endDate: getDateOffset(3),
    daysCount: 2,
    reason: 'Attending Creator Economy Summit in Los Angeles as panel speaker.',
    status: 'Pending',
    submittedAt: new Date(Date.now() - 12 * 3600000).toISOString()
  },
  {
    id: 'leave-2',
    userId: 'user-emp-4',
    employeeId: '7C-CR004',
    employeeName: 'Zara Al-Mansoor',
    employeeAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    leaveType: 'Casual Leave',
    startDate: getDateOffset(7),
    endDate: getDateOffset(8),
    daysCount: 2,
    reason: 'Family wedding out of state.',
    status: 'Approved',
    submittedAt: new Date(Date.now() - 72 * 3600000).toISOString(),
    reviewedBy: 'Elena Rostova',
    reviewedAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    reviewNotes: 'Approved. Leo Vance will coordinate client ad campaigns during this window.'
  },
  {
    id: 'leave-3',
    userId: 'user-emp-1',
    employeeId: '7C-CR001',
    employeeName: 'Leo Vance',
    employeeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    leaveType: 'Sick Leave',
    startDate: getDateOffset(-5),
    endDate: getDateOffset(-5),
    daysCount: 1,
    reason: 'Severe migraine recovery.',
    status: 'Approved',
    submittedAt: new Date(Date.now() - 140 * 3600000).toISOString(),
    reviewedBy: 'Elena Rostova',
    reviewedAt: new Date(Date.now() - 138 * 3600000).toISOString(),
    reviewNotes: 'Feel better soon Leo.'
  }
];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Final DaVinci Color Grade for Nike Cyber Spot',
    projectName: 'Nike Cyber Campaign',
    description: 'Apply custom futuristic neon LUTs, match skin tones across interior neon sequences, and export 4K HDR ProRes 4444 master.',
    assignedTo: 'user-emp-1',
    assignedToName: 'Leo Vance',
    assignedToAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdBy: 'user-admin',
    createdByName: 'Elena Rostova',
    createdDate: getDateOffset(-2),
    dueDate: getDateOffset(0), // Today
    estimatedHours: 6,
    actualHours: 4.5,
    priority: 'Urgent',
    status: 'In Progress',
    completionPercentage: 75,
    referenceUrl: 'https://frame.io/project/nike-cyber-2026',
    timerRunning: true,
    timerStartedAt: new Date(Date.now() - 45 * 60000).toISOString()
  },
  {
    id: 'task-2',
    title: 'Complete Spotify Sonic Brand Design System',
    projectName: 'Spotify Sonic Brand',
    description: 'Finalize fluid kinetic audio visualizer vector assets, album cover guidelines, and dark mode UI cards.',
    assignedTo: 'user-emp-2',
    assignedToName: 'Maya Chen',
    assignedToAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    createdBy: 'user-admin',
    createdByName: 'Elena Rostova',
    createdDate: getDateOffset(-4),
    dueDate: getDateOffset(1), // Tomorrow
    estimatedHours: 8,
    actualHours: 6.0,
    priority: 'High',
    status: 'In Progress',
    completionPercentage: 80,
    referenceUrl: 'https://figma.com/@7clouds/spotify-sonic'
  },
  {
    id: 'task-3',
    title: 'Holographic Cloth Simulation in Marvelous & Cinema 4D',
    projectName: 'Neon Runway Lookbook',
    description: 'Simulate iridescent flowing fabric physics reacting to ambient wind turbulence and render Octane passes with depth maps.',
    assignedTo: 'user-emp-3',
    assignedToName: 'Kai Thorne',
    assignedToAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdBy: 'user-admin',
    createdByName: 'Elena Rostova',
    createdDate: getDateOffset(-3),
    dueDate: getDateOffset(2),
    estimatedHours: 12,
    actualHours: 8.5,
    priority: 'High',
    status: 'In Progress',
    completionPercentage: 65,
    referenceUrl: 'https://dropbox.com/7clouds/3d-renders'
  },
  {
    id: 'task-4',
    title: 'Launch TikTok Ad Variations A/B Test for Aura Launch',
    projectName: 'Aura Smart Ring Brand Launch',
    description: 'Configure Meta & TikTok pixel event triggers, set up 5 hooked video variations with dynamic captions, and monitor early ROAS.',
    assignedTo: 'user-emp-4',
    assignedToName: 'Zara Al-Mansoor',
    assignedToAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    createdBy: 'user-admin',
    createdByName: 'Elena Rostova',
    createdDate: getDateOffset(-1),
    dueDate: getDateOffset(0), // Today
    estimatedHours: 4,
    actualHours: 2.0,
    priority: 'Urgent',
    status: 'In Progress',
    completionPercentage: 50,
    referenceUrl: 'https://ads.tiktok.com/aura-campaign'
  },
  {
    id: 'task-5',
    title: 'Studio Lighting Setup & Moodboard for Editorial Shoot',
    projectName: 'Neon Runway Lookbook',
    description: 'Calibrate Profoto D2 strobes with cyan/magenta gels and test anamorphic lens flares on Arri Alexa Mini LF.',
    assignedTo: 'user-emp-5',
    assignedToName: 'Liam O’Connor',
    assignedToAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    createdBy: 'user-admin',
    createdByName: 'Elena Rostova',
    createdDate: getDateOffset(-2),
    dueDate: getDateOffset(-1),
    estimatedHours: 5,
    actualHours: 5.5,
    priority: 'Medium',
    status: 'Completed',
    completionPercentage: 100,
    referenceUrl: 'https://captureone.com/sessions/neon-runway'
  },
  {
    id: 'task-6',
    title: 'Script & Storyboard 7 Clouds 2026 Showreel Intro',
    projectName: '7 Clouds Showreel 2026',
    description: 'Write voiceover narrative exploring high-velocity creativity, curate the top 20 agency projects, and draft animatics.',
    assignedTo: 'user-emp-6',
    assignedToName: 'Chloe Dubois',
    assignedToAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    createdBy: 'user-admin',
    createdByName: 'Elena Rostova',
    createdDate: getDateOffset(-3),
    dueDate: getDateOffset(4),
    estimatedHours: 7,
    actualHours: 3.0,
    priority: 'Medium',
    status: 'Pending',
    completionPercentage: 35,
    referenceUrl: 'https://notion.so/7clouds/showreel-script'
  }
];

export const INITIAL_REPORTS: DailyWorkReport[] = [
  {
    id: 'report-1',
    userId: 'user-emp-1',
    employeeId: '7C-CR001',
    employeeName: 'Leo Vance',
    employeeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    date: getDateOffset(-1),
    projectName: 'Nike Cyber Campaign',
    workDescription: 'Completed rough cut timeline assembly, aligned key action beats to the 140 BPM synthwave soundtrack, and sent review link to client.',
    category: 'Video Editing',
    timeSpentHours: 7.5,
    taskStatus: 'Completed',
    referenceUrl: 'https://frame.io/v1-preview',
    submittedAt: new Date(Date.now() - 24 * 3600000).toISOString()
  },
  {
    id: 'report-2',
    userId: 'user-emp-2',
    employeeId: '7C-CR002',
    employeeName: 'Maya Chen',
    employeeAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    date: getDateOffset(-1),
    projectName: 'Spotify Sonic Brand',
    workDescription: 'Delivered typography scales and gradient mesh exploration files. Conducted color contrast audits on dark mode interfaces.',
    category: 'Graphic Design',
    timeSpentHours: 6.8,
    taskStatus: 'In Progress',
    referenceUrl: 'https://figma.com/file/spotify-design-kit',
    submittedAt: new Date(Date.now() - 26 * 3600000).toISOString()
  },
  {
    id: 'report-3',
    userId: 'user-emp-3',
    employeeId: '7C-CR003',
    employeeName: 'Kai Thorne',
    employeeAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    date: getDateOffset(-1),
    projectName: 'Neon Runway Lookbook',
    workDescription: 'Baked cloth vertex simulations in Cinema 4D and dispatched 120 frames to local GPU render node with depth matte extraction.',
    category: 'Motion & 3D',
    timeSpentHours: 8.0,
    taskStatus: 'In Progress',
    referenceUrl: 'https://drive.google.com/render-cache',
    submittedAt: new Date(Date.now() - 25 * 3600000).toISOString()
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'DaVinci Resolve Studio 19 & Adobe CC 2026 Licenses Upgraded',
    content: 'All studio editing suites and workstations now have full neural accelerator plugins enabled. Please run the creative suite updater before opening new client project timelines.',
    priority: 'Important',
    publishedBy: 'user-admin',
    publishedByName: 'Elena Rostova',
    publishedAt: new Date(Date.now() - 18 * 3600000).toISOString(),
    pinned: true,
    targetAudience: 'all'
  },
  {
    id: 'ann-2',
    title: 'New High-Speed 100GbE Studio NAS Online',
    content: 'Mount the new 120TB NVMe scratch storage at smb://storage.7clouds.internal. Please keep all 8K RAW caches and Octane render passes on volume `/FastScratch`.',
    priority: 'Normal',
    publishedBy: 'user-admin',
    publishedByName: 'Elena Rostova',
    publishedAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    pinned: false,
    targetAudience: 'creative'
  },
  {
    id: 'ann-3',
    title: 'Reminder: Monthly Attendance & Work Reports Cutoff',
    content: 'Please submit any remaining work reports and verify your check-ins before Friday 18:00 for the monthly creative compensation and KPI review.',
    priority: 'Urgent',
    publishedBy: 'user-admin',
    publishedByName: 'Elena Rostova',
    publishedAt: new Date(Date.now() - 72 * 3600000).toISOString(),
    pinned: true,
    targetAudience: 'all'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    recipientId: 'all',
    senderName: 'Elena Rostova',
    title: 'Studio Announcement',
    message: 'DaVinci Resolve 19 licenses and 100GbE NAS are now active for all suites.',
    type: 'announcement',
    link: '/announcements',
    isRead: false,
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString()
  },
  {
    id: 'notif-2',
    recipientId: 'user-admin',
    senderName: 'Leo Vance',
    title: 'Attendance Checked In',
    message: 'Leo Vance checked in at 09:12 AM from Studio Suite 1.',
    type: 'attendance',
    link: '/attendance',
    isRead: false,
    createdAt: new Date(Date.now() - 3.5 * 3600000).toISOString()
  },
  {
    id: 'notif-3',
    recipientId: 'user-admin',
    senderName: 'Chloe Dubois',
    title: 'New Leave Request',
    message: 'Chloe Dubois submitted a 2-day leave request for Creator Economy Summit.',
    type: 'leave',
    link: '/leave',
    isRead: false,
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString()
  },
  {
    id: 'notif-4',
    recipientId: 'user-emp-1',
    senderName: 'Elena Rostova',
    title: 'Urgent Task Assigned',
    message: 'You have been assigned to "Final DaVinci Color Grade for Nike Cyber Spot". Due today.',
    type: 'task',
    link: '/tasks',
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString()
  },
  {
    id: 'notif-5',
    recipientId: 'user-emp-4',
    senderName: 'Elena Rostova',
    title: 'Leave Request Approved',
    message: 'Your Casual Leave request for next week has been officially approved.',
    type: 'leave',
    link: '/leave',
    isRead: true,
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString()
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-1',
    actorId: 'user-admin',
    actorName: 'Elena Rostova',
    action: 'APPROVED_LEAVE',
    targetEntity: 'LeaveRequest',
    targetId: 'leave-2',
    details: 'Approved 2 days Casual Leave for Zara Al-Mansoor.',
    timestamp: new Date(Date.now() - 48 * 3600000).toISOString()
  },
  {
    id: 'audit-2',
    actorId: 'user-admin',
    actorName: 'Elena Rostova',
    action: 'ASSIGNED_TASK',
    targetEntity: 'TaskItem',
    targetId: 'task-1',
    details: 'Assigned Urgent Task "Nike Cyber Spot Color Grade" to Leo Vance.',
    timestamp: new Date(Date.now() - 24 * 3600000).toISOString()
  },
  {
    id: 'audit-3',
    actorId: 'user-admin',
    actorName: 'Elena Rostova',
    action: 'PUBLISHED_ANNOUNCEMENT',
    targetEntity: 'Announcement',
    targetId: 'ann-1',
    details: 'Published DaVinci 19 & Storage announcement to all team members.',
    timestamp: new Date(Date.now() - 18 * 3600000).toISOString()
  }
];
