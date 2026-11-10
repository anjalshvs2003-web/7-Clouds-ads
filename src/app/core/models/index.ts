export type UserRole =
  | 'HOST'
  | 'HR ADMIN'
  | 'EMPLOYEE'
  | 'super_admin'
  | 'hr_admin'
  | 'employee'
  | 'admin';

export type AccountStatus =
  | 'pending_approval'
  | 'active'
  | 'inactive'
  | 'rejected'
  | 'pending_invite';

export interface LeaveBalances {
  casual: number;
  sick: number;
  emergency: number;
  total: number;
}

export interface User {
  id: string;
  employeeId: string; // User ID / Employee ID created by employee or system
  username?: string; // Custom login User ID chosen during registration
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
  firstLoginRequired?: boolean;
  passwordHash?: string;
  invitationLink?: string;
  registeredAt?: string;
  approvedAt?: string;
  rejectedReason?: string;
  registeredViaPublicForm?: boolean;
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
  checkInTime?: string; // ISO / IST
  checkOutTime?: string; // ISO / IST
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
  submittedAt: string; // ISO / IST
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

// 3 simplified status buttons requested by user:
// [ Not Started ] [ In Progress ] [ Completed ]
export type TaskStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Pending' | 'On Hold';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

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
  completedAt?: string; // Automatically saved timestamp when marked Completed
  referenceUrl?: string;
  attachments?: string[];
  timerRunning?: boolean;
  timerStartedAt?: string;
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
  submittedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'Normal' | 'Important' | 'Urgent';
  publishedBy: string;
  publishedByName: string;
  publishedAt: string;
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
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  targetEntity: string;
  targetId: string;
  details: string;
  timestamp: string;
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
