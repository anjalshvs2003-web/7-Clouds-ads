export type UserRole = 'admin' | 'employee';
export type AccountStatus = 'active' | 'inactive';

export interface LeaveBalances {
  casual: number;
  sick: number;
  emergency: number;
  total: number;
}

export interface User {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  avatar: string;
  phone: string;
  designation: string;
  department: string;
  joiningDate: string; // YYYY-MM-DD
  status: AccountStatus;
  role: UserRole;
  leaveBalances: LeaveBalances;
  skills?: string[];
  bio?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export type AttendanceStatus =
  | 'Present'
  | 'Half Day'
  | 'Leave'
  | 'Work From Home'
  | 'Holiday'
  | 'Absent'
  | 'Pending';

export type WorkLocation = 'Studio / On-Site' | 'Work From Home' | 'Client Location';

export interface AttendanceRecord {
  id: string;
  userId: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  checkInTime?: string; // ISO
  checkOutTime?: string; // ISO
  workingHours: number; // decimal hours
  status: AttendanceStatus;
  workLocation: WorkLocation;
  notes?: string;
  isCorrected?: boolean;
  correctionReason?: string;
  correctedBy?: string;
  correctedAt?: string;
}

export type LeaveType =
  | 'Full Day Leave'
  | 'Half Day Leave'
  | 'Sick Leave'
  | 'Casual Leave'
  | 'Emergency Leave'
  | 'Other Leave';

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export interface LeaveRequest {
  id: string;
  userId: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  leaveType: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  daysCount: number;
  halfDayPeriod?: 'First Half' | 'Second Half';
  reason: string;
  attachmentUrl?: string;
  status: LeaveStatus;
  submittedAt: string; // ISO
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'On Hold';

export interface TaskItem {
  id: string;
  title: string;
  projectName: string;
  description: string;
  assignedTo: string; // userId
  assignedToName: string;
  assignedToAvatar: string;
  createdBy: string;
  createdByName?: string;
  createdDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  estimatedHours: number;
  actualHours: number;
  priority: TaskPriority;
  status: TaskStatus;
  completionPercentage: number; // 0 - 100
  referenceUrl?: string;
  attachments?: string[];
  timerRunning?: boolean;
  timerStartedAt?: string; // ISO timestamp
}

export type WorkCategory =
  | 'Video Editing'
  | 'Graphic Design'
  | 'Motion & 3D'
  | 'Digital Marketing'
  | 'Photography'
  | 'Content Creation'
  | 'Strategy & Review';

export interface DailyWorkReport {
  id: string;
  userId: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar: string;
  date: string; // YYYY-MM-DD
  projectName: string;
  workDescription: string;
  category: WorkCategory;
  timeSpentHours: number;
  taskStatus: 'Completed' | 'In Progress' | 'Blocked' | 'Pending Review';
  referenceUrl?: string;
  attachments?: string[];
  submittedAt: string; // ISO
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'Normal' | 'Important' | 'Urgent';
  publishedBy: string;
  publishedByName: string;
  publishedAt: string; // ISO
  pinned: boolean;
  targetAudience: 'all' | 'creative' | 'marketing';
}

export interface CompanyHoliday {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: 'National' | 'Studio Holiday' | 'Special Event';
  description?: string;
}

export interface NotificationItem {
  id: string;
  recipientId: string; // 'all' or userId
  senderId?: string;
  senderName?: string;
  title: string;
  message: string;
  type: 'attendance' | 'leave' | 'task' | 'report' | 'announcement' | 'system';
  link?: string;
  isRead: boolean;
  createdAt: string; // ISO
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  targetEntity: string;
  targetId: string;
  details: string;
  timestamp: string; // ISO
}

export interface StudioSettings {
  studioName: string;
  attendanceCutoffTime: string; // e.g. "10:30"
  standardWorkingHours: number;
  halfDayThresholdHours: number;
  allowSelfCheckIn: boolean;
  fcmEnabled: boolean;
  demoMode: boolean;
}
