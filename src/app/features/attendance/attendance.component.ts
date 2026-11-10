import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { AttendanceService } from '../../core/services/attendance.service';
import { DataService } from '../../core/services/data.service';
import { ToastService } from '../../core/services/toast.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import {
  User,
  AttendanceRecord,
  AttendanceStatus,
  WorkLocation
} from '../../core/models';
import { getTodayDateString } from '../../core/services/mock-data';
import { Subscription } from 'rxjs';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, BadgeComponent, ModalComponent],
  template: `
    <div class="space-y-6">
      <!-- Top Title & Personal Check-In Bar -->
      <div class="glass-panel p-6 sm:p-8 relative overflow-hidden">
        <div class="absolute -right-20 -top-20 w-80 h-80 bg-electric/15 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="px-2.5 py-0.5 rounded-full bg-electric/20 text-electric-light font-mono text-[10px] font-bold uppercase tracking-wider">
                Studio Precision Clocking
              </span>
              <span class="text-text-muted">•</span>
              <span class="text-xs font-mono text-text-muted">{{ currentDateStr }}</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Attendance & Time Tracking
            </h1>
            <p class="text-xs sm:text-sm text-text-secondary mt-1">
              Live biometric-style shift ledger with automated cutoff checks and HR audit correction.
            </p>
          </div>

          <!-- Personal Clock Card -->
          <div class="flex items-center gap-4 bg-surface-secondary/70 border border-surface-border p-3.5 rounded-2xl backdrop-blur-md">
            <div class="text-right">
              <div class="text-2xl font-extrabold text-white font-mono tracking-widest">{{ liveClock }}</div>
              <div class="text-[10px] text-text-muted font-mono uppercase">
                Logged Today: <span class="text-emerald-400 font-bold">{{ liveWorkingHours }}h</span>
              </div>
            </div>

            <!-- Action Button -->
            <div *ngIf="!myTodayRecord?.checkInTime">
              <button
                (click)="isCheckInModalOpen = true"
                class="btn-primary py-2.5 px-4 text-xs font-semibold cursor-pointer"
              >
                <app-icon name="play" [size]="14"></app-icon>
                <span>Check-In Now</span>
              </button>
            </div>

            <div *ngIf="myTodayRecord?.checkInTime && !myTodayRecord?.checkOutTime">
              <button
                (click)="handleCheckOut()"
                class="inline-flex items-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-all cursor-pointer shadow-[0_0_15px_rgba(225,29,72,0.3)]"
              >
                <app-icon name="square" [size]="14"></app-icon>
                <span>Check-Out</span>
              </button>
            </div>

            <div *ngIf="myTodayRecord?.checkOutTime" class="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
              Shift Ended
            </div>
          </div>
        </div>
      </div>

      <!-- Filters & Controls Bar -->
      <div class="glass-panel p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-3 flex-wrap flex-1">
          <!-- Search input -->
          <div class="relative min-w-[200px] flex-1 sm:flex-initial">
            <app-icon name="search" [size]="15" extraClass="absolute left-3 top-2.5 text-text-muted"></app-icon>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Search creative employee..."
              class="input-field pl-9 py-2 text-xs"
            />
          </div>

          <!-- Status Filter -->
          <select
            [(ngModel)]="selectedStatusFilter"
            class="input-field py-2 text-xs w-auto"
          >
            <option value="ALL">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Half Day">Half Day</option>
            <option value="Work From Home">Work From Home</option>
            <option value="Leave">On Leave</option>
            <option value="Absent">Absent</option>
          </select>

          <!-- Date Filter -->
          <input
            type="date"
            [(ngModel)]="selectedDateFilter"
            class="input-field py-2 text-xs w-auto font-mono"
          />

          <button
            *ngIf="selectedDateFilter || selectedStatusFilter !== 'ALL' || searchQuery"
            (click)="resetFilters()"
            class="btn-ghost text-xs text-text-muted hover:text-white"
          >
            Reset Filters
          </button>
        </div>

        <!-- Export CSV Button -->
        <button
          (click)="exportAttendanceCsv()"
          class="btn-secondary text-xs shrink-0"
        >
          <app-icon name="download" [size]="14"></app-icon>
          <span>Export CSV</span>
        </button>
      </div>

      <!-- Attendance Table -->
      <div class="glass-panel overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-surface-secondary/70 text-text-muted font-mono uppercase text-[10px] border-b border-surface-border">
              <tr>
                <th class="py-3.5 px-4 font-semibold">Employee</th>
                <th class="py-3.5 px-4 font-semibold">Date</th>
                <th class="py-3.5 px-4 font-semibold">Check-In</th>
                <th class="py-3.5 px-4 font-semibold">Check-Out</th>
                <th class="py-3.5 px-4 font-semibold">Logged Hours</th>
                <th class="py-3.5 px-4 font-semibold">Location</th>
                <th class="py-3.5 px-4 font-semibold">Status</th>
                <th *ngIf="isAdmin" class="py-3.5 px-4 font-semibold text-right">HR Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-border">
              <tr
                *ngFor="let row of filteredAttendance"
                class="hover:bg-surface-secondary/40 transition-colors"
              >
                <!-- Employee -->
                <td class="py-3.5 px-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-surface-tertiary flex items-center justify-center font-bold text-white uppercase text-xs">
                      {{ row.employeeName.charAt(0) }}
                    </div>
                    <div>
                      <div class="font-semibold text-white flex items-center gap-1.5">
                        <span>{{ row.employeeName }}</span>
                        <span *ngIf="row.isCorrected" class="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono" title="Corrected by HR">
                          MODIFIED
                        </span>
                      </div>
                      <div class="text-[10px] text-text-muted font-mono">{{ row.employeeId }}</div>
                    </div>
                  </div>
                </td>

                <!-- Date -->
                <td class="py-3.5 px-4 font-mono text-text-secondary">
                  {{ row.date }}
                </td>

                <!-- Check-in -->
                <td class="py-3.5 px-4 font-mono text-white font-medium">
                  {{ row.checkInTime ? formatTime(row.checkInTime) : '—' }}
                </td>

                <!-- Check-out -->
                <td class="py-3.5 px-4 font-mono text-text-secondary">
                  {{ row.checkOutTime ? formatTime(row.checkOutTime) : (row.checkInTime ? 'Active Session' : '—') }}
                </td>

                <!-- Logged Hours -->
                <td class="py-3.5 px-4 font-mono font-bold" [ngClass]="row.workingHours >= 8 ? 'text-emerald-400' : 'text-text-primary'">
                  {{ row.workingHours }} hrs
                </td>

                <!-- Location -->
                <td class="py-3.5 px-4 text-text-secondary">
                  {{ row.workLocation || 'Studio' }}
                </td>

                <!-- Status -->
                <td class="py-3.5 px-4">
                  <app-badge [label]="row.status" [variant]="row.status"></app-badge>
                </td>

                <!-- HR Correction Action -->
                <td *ngIf="isAdmin" class="py-3.5 px-4 text-right">
                  <button
                    type="button"
                    (click)="openCorrectionModal(row)"
                    class="p-1.5 rounded-lg bg-surface-secondary hover:bg-surface-tertiary text-text-muted hover:text-white transition-colors cursor-pointer"
                    title="Correct Attendance Record (HR)"
                  >
                    <app-icon name="edit" [size]="14"></app-icon>
                  </button>
                </td>
              </tr>

              <tr *ngIf="filteredAttendance.length === 0">
                <td [attr.colspan]="isAdmin ? 8 : 7" class="py-12 text-center text-text-muted">
                  No attendance records found matching the active filters.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Check-In Modal -->
      <app-modal
        [isOpen]="isCheckInModalOpen"
        title="Check-In Shift"
        subtitle="Confirm location and time entry"
        (close)="isCheckInModalOpen = false"
      >
        <div class="space-y-4 text-xs">
          <div>
            <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
              Working Location
            </label>
            <select [(ngModel)]="checkInLocation" class="input-field">
              <option value="Studio / On-Site">Studio / On-Site (HQ Suite)</option>
              <option value="Work From Home">Work From Home (Remote GPU/3D)</option>
              <option value="Client Location">Client Location / Shoot Set</option>
            </select>
          </div>

          <div>
            <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
              Notes (Optional)
            </label>
            <input
              type="text"
              [(ngModel)]="checkInNote"
              placeholder="e.g. Editing sprint for Nike campaign"
              class="input-field"
            />
          </div>

          <div class="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              (click)="isCheckInModalOpen = false"
              class="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              (click)="confirmCheckIn()"
              class="btn-primary text-xs"
            >
              Confirm Check-In
            </button>
          </div>
        </div>
      </app-modal>

      <!-- HR Attendance Correction Modal -->
      <app-modal
        [isOpen]="isCorrectionModalOpen"
        title="HR Attendance Correction"
        subtitle="Audit-logged record adjustment for compliance"
        (close)="isCorrectionModalOpen = false"
      >
        <div *ngIf="selectedRecordForCorrection" class="space-y-4 text-xs">
          <div class="p-3 rounded-xl bg-surface-secondary/70 border border-surface-border">
            <div class="font-bold text-white text-sm">{{ selectedRecordForCorrection.employeeName }}</div>
            <div class="text-[11px] text-text-muted font-mono">Date: {{ selectedRecordForCorrection.date }}</div>
          </div>

          <div>
            <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
              Attendance Status
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
              Adjusted Working Hours
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
              Correction Reason (Mandatory for HR Audit Log)
            </label>
            <textarea
              [(ngModel)]="correctionReason"
              rows="3"
              placeholder="e.g. Employee was on client set shoot during morning cutoff..."
              class="input-field"
            ></textarea>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2">
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
              Save & Audit Log
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
  attendanceRecords: AttendanceRecord[] = [];
  filteredAttendance: AttendanceRecord[] = [];
  myTodayRecord: AttendanceRecord | undefined;

  liveClock = '';
  liveWorkingHours = 0;
  currentDateStr = '';

  // Filters
  searchQuery = '';
  selectedStatusFilter = 'ALL';
  selectedDateFilter = '';

  // Modals
  isCheckInModalOpen = false;
  checkInLocation: WorkLocation = 'Studio / On-Site';
  checkInNote = '';

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
    private dataService: DataService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.updateClock();
    this.timerInterval = setInterval(() => this.updateClock(), 1000);

    const now = new Date();
    this.currentDateStr = now.toLocaleDateString([], {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    this.subs.push(
      this.authService.currentUser$.subscribe(u => {
        this.currentUser = u;
        this.isAdmin = u?.role === 'admin';
        if (u) {
          this.loadAttendanceData();
        }
      }),
      this.attendanceService.getAllAttendance().subscribe(list => {
        this.attendanceRecords = list;
        this.applyFilters();
        if (this.currentUser) {
          const today = getTodayDateString();
          this.myTodayRecord = list.find(r => r.userId === this.currentUser!.id && r.date === today);
          this.updateWorkingHours();
        }
      })
    );
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.subs.forEach(s => s.unsubscribe());
  }

  private loadAttendanceData(): void {
    this.attendanceRecords = this.dataService.getAttendanceSnapshot();
    this.applyFilters();
  }

  private updateClock(): void {
    const now = new Date();
    this.liveClock = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    this.updateWorkingHours();
  }

  private updateWorkingHours(): void {
    if (this.myTodayRecord?.checkInTime) {
      this.liveWorkingHours = this.attendanceService.calculateLiveHours(
        this.myTodayRecord.checkInTime,
        this.myTodayRecord.checkOutTime
      );
    } else {
      this.liveWorkingHours = 0;
    }
  }

  applyFilters(): void {
    let list = [...this.attendanceRecords];

    // If regular employee, only show their own attendance records as required
    if (!this.isAdmin && this.currentUser) {
      list = list.filter(r => r.userId === this.currentUser!.id);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(
        r => r.employeeName.toLowerCase().includes(q) || r.employeeId.toLowerCase().includes(q)
      );
    }

    if (this.selectedStatusFilter !== 'ALL') {
      list = list.filter(r => r.status === this.selectedStatusFilter);
    }

    if (this.selectedDateFilter) {
      list = list.filter(r => r.date === this.selectedDateFilter);
    }

    this.filteredAttendance = list;
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedStatusFilter = 'ALL';
    this.selectedDateFilter = '';
    this.applyFilters();
  }

  confirmCheckIn(): void {
    if (!this.currentUser) return;
    try {
      this.attendanceService.checkIn(
        this.currentUser,
        this.checkInLocation,
        this.checkInNote
      );
      this.isCheckInModalOpen = false;
      this.toastService.success(`Checked in successfully at ${this.checkInLocation}`);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch (err: any) {
      this.toastService.error(err.message || 'Check-in failed');
    }
  }

  handleCheckOut(): void {
    if (!this.myTodayRecord) return;
    if (confirm('Complete today’s shift and log check-out?')) {
      try {
        this.attendanceService.checkOut(this.myTodayRecord.id);
        this.toastService.success('Check-out recorded successfully.');
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
      } catch (err: any) {
        this.toastService.error(err.message || 'Check-out failed');
      }
    }
  }

  openCorrectionModal(record: AttendanceRecord): void {
    this.selectedRecordForCorrection = record;
    this.correctedStatus = record.status;
    this.correctedHours = record.workingHours;
    this.correctionReason = '';
    this.isCorrectionModalOpen = true;
  }

  saveAttendanceCorrection(): void {
    if (!this.selectedRecordForCorrection || !this.currentUser) return;
    if (!this.correctionReason.trim()) {
      this.toastService.error('Please enter a correction reason for the audit trail.');
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
      this.toastService.error(err.message || 'Failed to update record');
    }
  }

  exportAttendanceCsv(): void {
    const rows = this.filteredAttendance.map(r => ({
      'Employee ID': r.employeeId,
      'Name': r.employeeName,
      'Date': r.date,
      'Check-In': r.checkInTime || '',
      'Check-Out': r.checkOutTime || '',
      'Working Hours': r.workingHours,
      'Location': r.workLocation,
      'Status': r.status,
      'Modified by HR': r.isCorrected ? 'Yes' : 'No',
      'Reason': r.correctionReason || ''
    }));

    const csvContent = [
      Object.keys(rows[0] || {}).join(','),
      ...rows.map(row => Object.values(row).map(v => `"${v}"`).join(','))
    ].join('\r\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `7clouds_attendance_${getTodayDateString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.toastService.success('Attendance records exported to CSV.');
  }

  formatTime(isoStr: string): string {
    return new Date(isoStr).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
