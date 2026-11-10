import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AttendanceService } from '../../core/services/attendance.service';
import { LeaveService } from '../../core/services/leave.service';
import { DataService } from '../../core/services/data.service';
import { ToastService } from '../../core/services/toast.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import {
  User,
  AttendanceRecord,
  AttendanceStatus,
  LeaveType
} from '../../core/models';
import {
  getTodayDateStringIST,
  getCurrentISTTimeString,
  formatTimeIST,
  formatDateIST,
  getDateOffsetIST
} from '../../core/services/ist-date.utils';
import { Subscription } from 'rxjs';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IconComponent, BadgeComponent, ModalComponent],
  template: `
    <div class="space-y-6 max-w-5xl mx-auto">
      <!-- Title Header -->
      <div class="glass-panel p-6 sm:p-8 relative overflow-hidden">
        <div class="absolute -right-20 -top-20 w-80 h-80 bg-electric/15 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="px-2.5 py-0.5 rounded-full bg-electric/20 text-electric-light font-mono text-[10px] font-bold uppercase tracking-wider">
                Simplified Attendance Terminal
              </span>
              <span class="text-text-muted">•</span>
              <span class="text-xs font-mono text-text-muted">Indian Standard Time (IST)</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Daily Attendance
            </h1>
            <p class="text-xs sm:text-sm text-text-secondary mt-1">
              Mark your arrival and departure with one click. Simple, instant and permanently recorded.
            </p>
          </div>

          <!-- Quick Planned Leave Shortcut -->
          <button
            type="button"
            (click)="openPlannedLeaveModal()"
            class="btn-secondary text-xs self-start sm:self-auto cursor-pointer"
          >
            <app-icon name="briefcase" [size]="14"></app-icon>
            <span>Notify Planned Leave</span>
          </button>
        </div>
      </div>

      <!-- MAIN ATTENDANCE CARD: 2 PRIMARY ACTIONS (CHECK IN / CHECK OUT) -->
      <div class="glass-panel p-6 sm:p-8 relative overflow-hidden">
        <div class="glow-border-blue"></div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <!-- Left: Real-time Live Clock & Today's Metrics -->
          <div class="space-y-4">
            <div>
              <div class="text-[11px] font-mono font-bold text-text-muted uppercase tracking-wider">
                Today's Date (IST)
              </div>
              <div class="text-lg sm:text-xl font-bold text-white font-mono mt-0.5">
                {{ todayDateFormatted }}
              </div>
            </div>

            <!-- Big Digital Clock -->
            <div class="p-4 rounded-2xl bg-surface-secondary/70 border border-surface-border text-center sm:text-left">
              <div class="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-widest text-shadow-glow">
                {{ liveClock }}
              </div>
              <div class="text-[10px] text-text-muted font-mono mt-1 uppercase tracking-wider">
                Indian Standard Time (UTC+05:30)
              </div>
            </div>

            <!-- Key Status Stats -->
            <div class="grid grid-cols-3 gap-2.5 text-xs">
              <div class="p-3 rounded-xl bg-surface-secondary/50 border border-surface-border">
                <div class="text-[10px] font-mono text-text-muted uppercase">Status</div>
                <div class="font-bold text-white mt-1 truncate">
                  {{ todayRecord?.status || 'Not Checked In' }}
                </div>
              </div>

              <div class="p-3 rounded-xl bg-surface-secondary/50 border border-surface-border">
                <div class="text-[10px] font-mono text-text-muted uppercase">Check-In</div>
                <div class="font-mono font-bold text-white mt-1">
                  {{ todayRecord?.checkInTime ? formatTime(todayRecord!.checkInTime!) : '--:--' }}
                </div>
              </div>

              <div class="p-3 rounded-xl bg-surface-secondary/50 border border-surface-border">
                <div class="text-[10px] font-mono text-text-muted uppercase">Check-Out</div>
                <div class="font-mono font-bold text-white mt-1">
                  {{ todayRecord?.checkOutTime ? formatTime(todayRecord!.checkOutTime!) : (todayRecord?.checkInTime ? 'Active' : '--:--') }}
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between p-3 rounded-xl bg-surface-secondary/30 border border-surface-border text-xs">
              <span class="text-text-muted">Total Working Hours</span>
              <span class="font-mono text-emerald-400 font-extrabold text-sm">
                {{ liveWorkingHours }} hours
              </span>
            </div>
          </div>

          <!-- Right: Two Clear, Visually Distinct Primary Buttons -->
          <div class="space-y-4 flex flex-col justify-center">
            <!-- CHECK IN BUTTON -->
            <div>
              <button
                type="button"
                (click)="handleCheckIn()"
                [disabled]="isCheckInDisabled"
                class="w-full py-4 px-6 rounded-2xl font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-3 transition-all duration-200 cursor-pointer shadow-lg"
                [ngClass]="isCheckInDisabled ? 'bg-surface-secondary/40 text-text-muted border border-surface-border cursor-not-allowed opacity-40' : 'bg-gradient-to-r from-electric to-violet text-white hover:shadow-glow-electric active:scale-[0.98]'"
              >
                <app-icon name="play" [size]="20"></app-icon>
                <span>[ CHECK IN ]</span>
              </button>
              <p *ngIf="isCheckInDisabled && !todayRecord?.checkOutTime" class="text-[11px] text-emerald-400 font-mono mt-1 text-center">
                ✓ Check-in recorded at {{ formatTime(todayRecord?.checkInTime) }}. Check out when leaving office.
              </p>
            </div>

            <!-- CHECK OUT BUTTON -->
            <div>
              <button
                type="button"
                (click)="handleCheckOut()"
                [disabled]="isCheckOutDisabled"
                class="w-full py-4 px-6 rounded-2xl font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-3 transition-all duration-200 cursor-pointer shadow-lg"
                [ngClass]="isCheckOutDisabled ? 'bg-surface-secondary/40 text-text-muted border border-surface-border cursor-not-allowed opacity-40' : 'bg-gradient-to-r from-rose-600 to-rose-700 text-white hover:shadow-[0_0_20px_rgba(225,29,72,0.4)] active:scale-[0.98]'"
              >
                <app-icon name="square" [size]="20"></app-icon>
                <span>[ CHECK OUT ]</span>
              </button>
              <p *ngIf="todayRecord?.checkOutTime" class="text-[11px] text-blue-400 font-mono mt-1 text-center font-semibold">
                ✓ Shift Completed for the day. Total: {{ todayRecord?.workingHours }} hours.
              </p>
            </div>

            <!-- Shift Completed Banner -->
            <div *ngIf="todayRecord?.checkOutTime" class="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
              <span class="text-xs font-bold text-blue-300">COMPLETED FOR TODAY</span>
              <p class="text-[11px] text-text-muted mt-0.5">Thank you for your creative contributions today!</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ATTENDANCE HISTORY SECTION -->
      <div class="glass-panel overflow-hidden p-6">
        <div class="flex items-center justify-between pb-4 border-b border-surface-border mb-4">
          <div class="flex items-center gap-2">
            <app-icon name="clock" [size]="18" extraClass="text-electric"></app-icon>
            <h2 class="text-sm font-bold text-white uppercase tracking-wider font-mono">
              {{ isAdmin ? 'Studio Staff Attendance History' : 'My Attendance History' }}
            </h2>
          </div>
          <span class="text-xs text-text-muted font-mono">
            {{ filteredAttendance.length }} record{{ filteredAttendance.length === 1 ? '' : 's' }}
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-surface-secondary/70 text-text-muted font-mono uppercase text-[10px] border-b border-surface-border">
              <tr>
                <th class="py-3 px-4 font-semibold">Date</th>
                <th class="py-3 px-4 font-semibold">Staff Member</th>
                <th class="py-3 px-4 font-semibold">Check-In</th>
                <th class="py-3 px-4 font-semibold">Check-Out</th>
                <th class="py-3 px-4 font-semibold text-right">Hours Logged</th>
                <th class="py-3 px-4 font-semibold">Status</th>
                <th *ngIf="isAdmin" class="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-border">
              <tr
                *ngFor="let row of filteredAttendance"
                class="hover:bg-surface-secondary/40 transition-colors"
              >
                <td class="py-3 px-4 font-mono text-text-secondary whitespace-nowrap">
                  {{ row.date }}
                </td>
                <td class="py-3 px-4">
                  <div class="font-bold text-white">{{ row.employeeName }}</div>
                  <div class="text-[10px] text-text-muted font-mono">{{ row.employeeId }}</div>
                </td>
                <td class="py-3 px-4 font-mono text-white">
                  {{ row.checkInTime ? formatTime(row.checkInTime) : '—' }}
                </td>
                <td class="py-3 px-4 font-mono text-text-secondary">
                  {{ row.checkOutTime ? formatTime(row.checkOutTime) : (row.checkInTime ? 'Active Session' : '—') }}
                </td>
                <td class="py-3 px-4 font-mono text-right font-bold text-emerald-400">
                  {{ row.workingHours }} hrs
                </td>
                <td class="py-3 px-4">
                  <app-badge [label]="row.status" [variant]="row.status"></app-badge>
                </td>
                <td *ngIf="isAdmin" class="py-3 px-4 text-right">
                  <button
                    type="button"
                    (click)="openCorrectionModal(row)"
                    class="p-1 rounded-lg text-text-muted hover:text-white hover:bg-white/5 cursor-pointer"
                    title="Correct Attendance Record"
                  >
                    <app-icon name="edit" [size]="14"></app-icon>
                  </button>
                </td>
              </tr>

              <tr *ngIf="filteredAttendance.length === 0">
                <td [attr.colspan]="isAdmin ? 7 : 6" class="py-8 text-center text-text-muted text-xs">
                  No attendance history logged yet.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Advance Planned Leave Notification Modal -->
      <app-modal
        [isOpen]="isPlannedLeaveModalOpen"
        title="Notify Planned Leave in Advance"
        subtitle="Submit your planned leave dates to HR for advance calendar approval"
        (close)="isPlannedLeaveModalOpen = false"
      >
        <form (ngSubmit)="submitPlannedLeave()" class="space-y-4 text-xs">
          <div>
            <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
              Leave Type *
            </label>
            <select [(ngModel)]="leaveData.leaveType" name="leaveType" class="input-field">
              <option value="Casual Leave">Casual Leave</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Emergency Leave">Emergency Leave</option>
              <option value="Full Day Leave">Full Day Leave</option>
              <option value="Half Day Leave">Half Day Leave</option>
            </select>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
                Start Date *
              </label>
              <input
                type="date"
                [(ngModel)]="leaveData.startDate"
                name="startDate"
                required
                class="input-field font-mono"
              />
            </div>

            <div>
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
                End Date *
              </label>
              <input
                type="date"
                [(ngModel)]="leaveData.endDate"
                name="endDate"
                required
                class="input-field font-mono"
              />
            </div>
          </div>

          <div>
            <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
              Reason for Planned Leave *
            </label>
            <textarea
              [(ngModel)]="leaveData.reason"
              name="reason"
              rows="3"
              required
              placeholder="e.g. Attending family function / Medical appointment..."
              class="input-field"
            ></textarea>
          </div>

          <div class="p-3 rounded-xl bg-surface-secondary/70 border border-surface-border text-text-muted text-[11px]">
            ℹ️ Approved leaves will appear on the Studio Calendar and are never counted as an unexcused absence.
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-surface-border">
            <button
              type="button"
              (click)="isPlannedLeaveModalOpen = false"
              class="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn-primary text-xs"
            >
              Submit Notification
            </button>
          </div>
        </form>
      </app-modal>

      <!-- HR Correction Modal -->
      <app-modal
        [isOpen]="isCorrectionModalOpen"
        title="Correct Attendance Record"
        subtitle="Host & HR Admin audit-logged adjustment"
        (close)="isCorrectionModalOpen = false"
      >
        <div *ngIf="selectedRecordForCorrection" class="space-y-4 text-xs">
          <div class="p-3 rounded-xl bg-surface-secondary border border-surface-border">
            <div class="font-bold text-white">{{ selectedRecordForCorrection.employeeName }}</div>
            <div class="text-[11px] text-text-muted font-mono">Date: {{ selectedRecordForCorrection.date }}</div>
          </div>

          <div>
            <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
              Adjusted Status
            </label>
            <select [(ngModel)]="correctedStatus" class="input-field">
              <option value="Present">Present</option>
              <option value="Half Day">Half Day</option>
              <option value="Work From Home">Work From Home</option>
              <option value="Leave">Leave</option>
              <option value="Absent">Absent</option>
              <option value="Holiday">Holiday</option>
            </select>
          </div>

          <div>
            <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
              Working Hours
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="24"
              [(ngModel)]="correctedHours"
              class="input-field font-mono"
            />
          </div>

          <div>
            <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
              Correction Reason (Mandatory Audit Log)
            </label>
            <textarea
              [(ngModel)]="correctionReason"
              rows="3"
              placeholder="e.g. Employee was on location shoot with client..."
              class="input-field"
            ></textarea>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-surface-border">
            <button
              type="button"
              (click)="isCorrectionModalOpen = false"
              class="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              (click)="saveAttendanceCorrection()"
              class="btn-primary text-xs"
            >
              Save Correction
            </button>
          </div>
        </div>
      </app-modal>
    </div>
  `
})
export class AttendanceComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isAdmin = false;
  todayRecord: AttendanceRecord | undefined;
  attendanceHistory: AttendanceRecord[] = [];

  liveClock = '';
  liveWorkingHours = 0;
  todayDateFormatted = '';

  // Planned Leave Modal
  isPlannedLeaveModalOpen = false;
  leaveData = {
    leaveType: 'Casual Leave' as LeaveType,
    startDate: getDateOffsetIST(2),
    endDate: getDateOffsetIST(2),
    reason: ''
  };

  // Correction Modal
  isCorrectionModalOpen = false;
  selectedRecordForCorrection: AttendanceRecord | null = null;
  correctedStatus: AttendanceStatus = 'Present';
  correctedHours = 8;
  correctionReason = '';

  private timerInterval: any;
  private subs: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private attendanceService: AttendanceService,
    private leaveService: LeaveService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.updateClock();
    this.timerInterval = setInterval(() => this.updateClock(), 1000);

    const now = new Date();
    this.todayDateFormatted = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(now);

    this.subs.push(
      this.authService.currentUser$.subscribe(u => {
        this.currentUser = u;
        this.isAdmin = this.authService.isAdmin();
        if (u) {
          this.loadAttendanceData(u.id);
        }
      }),
      this.attendanceService.getAllAttendance().subscribe(list => {
        this.attendanceHistory = list;
        if (this.currentUser) {
          const today = getTodayDateStringIST();
          this.todayRecord = list.find(r => r.userId === this.currentUser!.id && r.date === today);
          this.updateWorkingHours();
        }
      })
    );
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.subs.forEach(s => s.unsubscribe());
  }

  private loadAttendanceData(userId: string): void {
    const today = getTodayDateStringIST();
    this.todayRecord = this.attendanceHistory.find(r => r.userId === userId && r.date === today);
    this.updateWorkingHours();
  }

  private updateClock(): void {
    this.liveClock = getCurrentISTTimeString();
    this.updateWorkingHours();
  }

  private updateWorkingHours(): void {
    if (this.todayRecord?.checkInTime) {
      this.liveWorkingHours = this.attendanceService.calculateLiveHours(
        this.todayRecord.checkInTime,
        this.todayRecord.checkOutTime
      );
    } else {
      this.liveWorkingHours = 0;
    }
  }

  /**
   * Logic:
   * Before checking in: Check In is active, Check Out disabled.
   * After checking in: Check In disabled, Check Out active.
   * After checking out: Both disabled (shift completed).
   */
  get isCheckInDisabled(): boolean {
    return !!this.todayRecord?.checkInTime;
  }

  get isCheckOutDisabled(): boolean {
    return !this.todayRecord?.checkInTime || !!this.todayRecord?.checkOutTime;
  }

  get filteredAttendance(): AttendanceRecord[] {
    if (this.isAdmin) {
      return this.attendanceHistory;
    }
    if (!this.currentUser) return [];
    return this.attendanceHistory.filter(r => r.userId === this.currentUser!.id);
  }

  handleCheckIn(): void {
    if (!this.currentUser) return;
    try {
      this.attendanceService.checkIn(this.currentUser, 'Studio / On-Site');
      this.toastService.success(`Checked in at ${this.liveClock}! Welcome to 7 Clouds.`);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch (err: any) {
      this.toastService.error(err.message || 'Check-in failed');
    }
  }

  handleCheckOut(): void {
    if (!this.todayRecord) return;
    try {
      this.attendanceService.checkOut(this.todayRecord.id);
      this.toastService.success(`Checked out at ${this.liveClock}! Total ${this.todayRecord.workingHours} hrs.`);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch (err: any) {
      this.toastService.error(err.message || 'Check-out failed');
    }
  }

  openPlannedLeaveModal(): void {
    this.leaveData = {
      leaveType: 'Casual Leave',
      startDate: getDateOffsetIST(2),
      endDate: getDateOffsetIST(2),
      reason: ''
    };
    this.isPlannedLeaveModalOpen = true;
  }

  submitPlannedLeave(): void {
    if (!this.currentUser) return;
    if (!this.leaveData.reason.trim()) {
      this.toastService.error('Please enter a reason for the leave.');
      return;
    }

    try {
      this.leaveService.submitLeaveRequest(this.currentUser, {
        leaveType: this.leaveData.leaveType,
        startDate: this.leaveData.startDate,
        endDate: this.leaveData.endDate,
        reason: this.leaveData.reason
      });
      this.isPlannedLeaveModalOpen = false;
      this.toastService.success('Planned leave notification submitted to HR.');
    } catch (err: any) {
      this.toastService.error(err.message || 'Failed to submit leave');
    }
  }

  openCorrectionModal(row: AttendanceRecord): void {
    this.selectedRecordForCorrection = row;
    this.correctedStatus = row.status;
    this.correctedHours = row.workingHours;
    this.correctionReason = '';
    this.isCorrectionModalOpen = true;
  }

  saveAttendanceCorrection(): void {
    if (!this.selectedRecordForCorrection || !this.currentUser) return;
    if (!this.correctionReason.trim()) {
      this.toastService.error('Correction reason is mandatory for the audit log.');
      return;
    }

    try {
      this.attendanceService.correctAttendance(
        this.selectedRecordForCorrection.id,
        {
          status: this.correctedStatus,
          workingHours: this.correctedHours
        },
        this.correctionReason,
        this.currentUser
      );
      this.isCorrectionModalOpen = false;
      this.toastService.success('Attendance record updated and audit logged.');
    } catch (err: any) {
      this.toastService.error(err.message || 'Correction failed');
    }
  }

  formatTime(isoStr?: string): string {
    return formatTimeIST(isoStr);
  }
}
