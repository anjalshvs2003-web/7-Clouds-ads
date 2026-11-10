import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { LeaveService } from '../../core/services/leave.service';
import { DataService } from '../../core/services/data.service';
import { ToastService } from '../../core/services/toast.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import {
  User,
  LeaveRequest,
  LeaveType,
  LeaveStatus
} from '../../core/models';
import { getTodayDateString, getDateOffset } from '../../core/services/mock-data';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-leave',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, BadgeComponent, ModalComponent],
  template: `
    <div class="space-y-6">
      <!-- Title & Leave Balance Bar -->
      <div class="glass-panel p-6 sm:p-8 relative overflow-hidden">
        <div class="absolute -right-20 -top-20 w-80 h-80 bg-violet/15 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                Studio Absence & Recharge System
              </span>
              <span class="text-text-muted">•</span>
              <span class="text-xs font-mono text-text-muted">Strict Overlap & Balance Verification</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Leave & Time-Off Management
            </h1>
            <p class="text-xs sm:text-sm text-text-secondary mt-1">
              Submit advance requests, manage creative recharge quotas and review team absence schedules.
            </p>
          </div>

          <button
            (click)="openRequestModal()"
            class="btn-primary py-2.5 px-4 text-xs font-semibold self-start lg:self-auto cursor-pointer"
          >
            <app-icon name="plus" [size]="16"></app-icon>
            <span>Request Time Off</span>
          </button>
        </div>
      </div>

      <!-- Leave Balances Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="glass-panel p-4">
          <div class="text-[10px] font-mono uppercase text-text-muted">Casual Leave</div>
          <div class="text-2xl font-bold text-white font-mono mt-1">
            {{ currentUser?.leaveBalances?.casual || 0 }} <span class="text-xs text-text-muted font-normal">days left</span>
          </div>
          <div class="text-[10px] text-text-secondary mt-0.5">Vacation & personal time</div>
        </div>

        <div class="glass-panel p-4">
          <div class="text-[10px] font-mono uppercase text-electric">Sick Leave</div>
          <div class="text-2xl font-bold text-electric font-mono mt-1">
            {{ currentUser?.leaveBalances?.sick || 0 }} <span class="text-xs text-text-muted font-normal">days left</span>
          </div>
          <div class="text-[10px] text-text-secondary mt-0.5">Health & recovery</div>
        </div>

        <div class="glass-panel p-4">
          <div class="text-[10px] font-mono uppercase text-amber-400">Emergency Leave</div>
          <div class="text-2xl font-bold text-amber-400 font-mono mt-1">
            {{ currentUser?.leaveBalances?.emergency || 0 }} <span class="text-xs text-text-muted font-normal">days left</span>
          </div>
          <div class="text-[10px] text-text-secondary mt-0.5">Unforeseen circumstances</div>
        </div>

        <div class="glass-panel p-4">
          <div class="text-[10px] font-mono uppercase text-violet-400">Total Studio Balance</div>
          <div class="text-2xl font-bold text-white font-mono mt-1">
            {{ currentUser?.leaveBalances?.total || 0 }} <span class="text-xs text-text-muted font-normal">days</span>
          </div>
          <div class="text-[10px] text-text-secondary mt-0.5">Annual quota available</div>
        </div>
      </div>

      <!-- Filter Controls Bar -->
      <div class="glass-panel p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <!-- Status Filter Tabs -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          <button
            type="button"
            (click)="statusFilter = 'ALL'"
            class="px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap"
            [ngClass]="statusFilter === 'ALL' ? 'bg-electric text-white shadow-glow-sm' : 'text-text-muted hover:text-white hover:bg-white/5'"
          >
            All Requests ({{ allFilteredLeaves.length }})
          </button>

          <button
            type="button"
            (click)="statusFilter = 'Pending'"
            class="px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap"
            [ngClass]="statusFilter === 'Pending' ? 'bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'text-text-muted hover:text-white hover:bg-white/5'"
          >
            Pending Review ({{ pendingCount }})
          </button>

          <button
            type="button"
            (click)="statusFilter = 'Approved'"
            class="px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap"
            [ngClass]="statusFilter === 'Approved' ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'text-text-muted hover:text-white hover:bg-white/5'"
          >
            Approved
          </button>

          <button
            type="button"
            (click)="statusFilter = 'Rejected'"
            class="px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap"
            [ngClass]="statusFilter === 'Rejected' ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 'text-text-muted hover:text-white hover:bg-white/5'"
          >
            Rejected
          </button>
        </div>

        <div class="text-xs text-text-muted font-mono">
          Showing {{ displayedLeaves.length }} request{{ displayedLeaves.length === 1 ? '' : 's' }}
        </div>
      </div>

      <!-- Leaves Table / List -->
      <div class="glass-panel overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-surface-secondary/70 text-text-muted font-mono uppercase text-[10px] border-b border-surface-border">
              <tr>
                <th class="py-3.5 px-4 font-semibold">Employee</th>
                <th class="py-3.5 px-4 font-semibold">Leave Type</th>
                <th class="py-3.5 px-4 font-semibold">Duration & Dates</th>
                <th class="py-3.5 px-4 font-semibold">Days</th>
                <th class="py-3.5 px-4 font-semibold">Reason</th>
                <th class="py-3.5 px-4 font-semibold">Status</th>
                <th class="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-border">
              <tr
                *ngFor="let leave of displayedLeaves"
                class="hover:bg-surface-secondary/40 transition-colors"
              >
                <!-- Employee -->
                <td class="py-3.5 px-4">
                  <div class="flex items-center gap-2.5">
                    <img
                      *ngIf="leave.employeeAvatar"
                      [src]="leave.employeeAvatar"
                      [alt]="leave.employeeName"
                      class="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                    <div>
                      <div class="font-semibold text-white">{{ leave.employeeName }}</div>
                      <div class="text-[10px] text-text-muted font-mono">{{ leave.employeeId }}</div>
                    </div>
                  </div>
                </td>

                <!-- Leave Type -->
                <td class="py-3.5 px-4">
                  <span class="font-medium text-text-primary">{{ leave.leaveType }}</span>
                  <div *ngIf="leave.halfDayPeriod" class="text-[10px] text-amber-300 font-mono">
                    {{ leave.halfDayPeriod }}
                  </div>
                </td>

                <!-- Dates -->
                <td class="py-3.5 px-4 font-mono text-text-secondary whitespace-nowrap">
                  <div>{{ leave.startDate }} <span class="text-text-muted">to</span> {{ leave.endDate }}</div>
                  <div class="text-[10px] text-text-muted">Submitted {{ leave.submittedAt | date:'mediumDate' }}</div>
                </td>

                <!-- Days Count -->
                <td class="py-3.5 px-4 font-mono font-bold text-white">
                  {{ leave.daysCount }} day{{ leave.daysCount > 1 ? 's' : '' }}
                </td>

                <!-- Reason -->
                <td class="py-3.5 px-4 max-w-xs">
                  <p class="text-text-secondary truncate" [title]="leave.reason">{{ leave.reason }}</p>
                  <p *ngIf="leave.reviewNotes" class="text-[11px] text-text-muted italic mt-0.5 truncate">
                    HR note: {{ leave.reviewNotes }}
                  </p>
                </td>

                <!-- Status Badge -->
                <td class="py-3.5 px-4">
                  <app-badge [label]="leave.status" [variant]="leave.status"></app-badge>
                </td>

                <!-- Actions -->
                <td class="py-3.5 px-4 text-right whitespace-nowrap">
                  <!-- HR Approval Controls -->
                  <div *ngIf="isAdmin && leave.status === 'Pending'" class="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      (click)="approveRequest(leave)"
                      class="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white font-semibold transition-all text-xs cursor-pointer"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      (click)="rejectRequest(leave)"
                      class="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white font-semibold transition-all text-xs cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>

                  <!-- Employee Cancel Control -->
                  <div *ngIf="!isAdmin && leave.userId === currentUser?.id && leave.status === 'Pending'">
                    <button
                      type="button"
                      (click)="cancelRequest(leave)"
                      class="text-rose-400 hover:text-rose-300 hover:underline text-xs cursor-pointer"
                    >
                      Cancel Request
                    </button>
                  </div>

                  <div *ngIf="leave.status !== 'Pending'" class="text-[11px] text-text-muted font-mono">
                    {{ leave.reviewedBy ? 'Reviewed by ' + leave.reviewedBy : 'Finalized' }}
                  </div>
                </td>
              </tr>

              <tr *ngIf="displayedLeaves.length === 0">
                <td colspan="7" class="py-12 text-center text-text-muted">
                  No leave requests found for the selected view.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Request Leave Modal -->
      <app-modal
        [isOpen]="isRequestModalOpen"
        title="Submit Time-Off Request"
        subtitle="Advance, casual or emergency absence notice"
        (close)="isRequestModalOpen = false"
      >
        <form (ngSubmit)="submitLeaveForm()" class="space-y-4 text-xs">
          <div>
            <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
              Leave Type *
            </label>
            <select [(ngModel)]="leaveFormData.leaveType" name="leaveType" class="input-field">
              <option value="Full Day Leave">Full Day Leave</option>
              <option value="Half Day Leave">Half Day Leave</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Casual Leave">Casual Leave</option>
              <option value="Emergency Leave">Emergency Leave</option>
              <option value="Other Leave">Other Leave</option>
            </select>
          </div>

          <!-- Half Day Period if applicable -->
          <div *ngIf="leaveFormData.leaveType === 'Half Day Leave'">
            <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
              Half-Day Period
            </label>
            <select [(ngModel)]="leaveFormData.halfDayPeriod" name="halfDayPeriod" class="input-field">
              <option value="First Half">First Half (Morning Session)</option>
              <option value="Second Half">Second Half (Afternoon Session)</option>
            </select>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
                Start Date *
              </label>
              <input
                type="date"
                [(ngModel)]="leaveFormData.startDate"
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
                [(ngModel)]="leaveFormData.endDate"
                name="endDate"
                required
                class="input-field font-mono"
              />
            </div>
          </div>

          <div>
            <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
              Reason / Purpose *
            </label>
            <textarea
              [(ngModel)]="leaveFormData.reason"
              name="reason"
              rows="3"
              required
              placeholder="e.g. Attending Design Conference / Medical recovery..."
              class="input-field"
            ></textarea>
          </div>

          <div>
            <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
              Optional Supporting Attachment / Note URL
            </label>
            <input
              type="url"
              [(ngModel)]="leaveFormData.attachmentUrl"
              name="attachmentUrl"
              placeholder="https://drive.google.com/..."
              class="input-field"
            />
          </div>

          <div class="p-3 rounded-xl bg-surface-secondary border border-surface-border text-text-muted text-[11px]">
            ℹ️ Overlapping dates with existing requests are automatically checked and blocked. Approvals update your quota balance.
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-surface-border">
            <button
              type="button"
              (click)="isRequestModalOpen = false"
              class="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn-primary text-xs"
            >
              Submit Request
            </button>
          </div>
        </form>
      </app-modal>
    </div>
  `
})
export class LeaveComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isAdmin = false;
  allLeaves: LeaveRequest[] = [];
  statusFilter = 'ALL';
  pendingCount = 0;

  isRequestModalOpen = false;
  leaveFormData = {
    leaveType: 'Casual Leave' as LeaveType,
    startDate: getDateOffset(2),
    endDate: getDateOffset(2),
    halfDayPeriod: 'First Half' as 'First Half' | 'Second Half',
    reason: '',
    attachmentUrl: ''
  };

  private subs: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private leaveService: LeaveService,
    private dataService: DataService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.subs.push(
      this.authService.currentUser$.subscribe(u => {
        this.currentUser = u;
        this.isAdmin = u?.role === 'admin';
      }),
      this.leaveService.getAllLeaves().subscribe(leaves => {
        this.allLeaves = leaves;
        this.pendingCount = leaves.filter(l => l.status === 'Pending').length;
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  get allFilteredLeaves(): LeaveRequest[] {
    let list = [...this.allLeaves];
    if (!this.isAdmin && this.currentUser) {
      list = list.filter(l => l.userId === this.currentUser!.id);
    }
    return list;
  }

  get displayedLeaves(): LeaveRequest[] {
    let list = this.allFilteredLeaves;
    if (this.statusFilter !== 'ALL') {
      list = list.filter(l => l.status === this.statusFilter);
    }
    return list;
  }

  openRequestModal(): void {
    this.leaveFormData = {
      leaveType: 'Casual Leave',
      startDate: getDateOffset(2),
      endDate: getDateOffset(2),
      halfDayPeriod: 'First Half',
      reason: '',
      attachmentUrl: ''
    };
    this.isRequestModalOpen = true;
  }

  submitLeaveForm(): void {
    if (!this.currentUser) return;
    if (!this.leaveFormData.startDate || !this.leaveFormData.endDate) {
      this.toastService.error('Please specify start and end dates.');
      return;
    }
    if (!this.leaveFormData.reason.trim()) {
      this.toastService.error('Please enter a reason for the leave.');
      return;
    }

    try {
      this.leaveService.submitLeaveRequest(this.currentUser, {
        leaveType: this.leaveFormData.leaveType,
        startDate: this.leaveFormData.startDate,
        endDate: this.leaveFormData.endDate,
        halfDayPeriod: this.leaveFormData.leaveType === 'Half Day Leave' ? this.leaveFormData.halfDayPeriod : undefined,
        reason: this.leaveFormData.reason,
        attachmentUrl: this.leaveFormData.attachmentUrl || undefined
      });
      this.isRequestModalOpen = false;
      this.toastService.success('Leave request submitted to Studio HR.');
    } catch (err: any) {
      this.toastService.error(err.message || 'Failed to submit leave request');
    }
  }

  approveRequest(leave: LeaveRequest): void {
    if (!this.currentUser) return;
    const note = prompt('Optional approval note for employee:', 'Approved for studio schedule.') || 'Approved';
    this.leaveService.reviewLeaveRequest(leave.id, 'Approved', note, this.currentUser);
    this.toastService.success(`Approved leave for ${leave.employeeName}`);
  }

  rejectRequest(leave: LeaveRequest): void {
    if (!this.currentUser) return;
    const reason = prompt('Rejection reason (required):', 'Scheduling conflicts with active client shoot.');
    if (!reason) return;
    this.leaveService.reviewLeaveRequest(leave.id, 'Rejected', reason, this.currentUser);
    this.toastService.warning(`Rejected leave for ${leave.employeeName}`);
  }

  cancelRequest(leave: LeaveRequest): void {
    if (!this.currentUser) return;
    if (confirm('Cancel this pending leave request?')) {
      this.leaveService.cancelLeaveRequest(leave.id, this.currentUser.id);
      this.toastService.info('Leave request cancelled.');
    }
  }
}
