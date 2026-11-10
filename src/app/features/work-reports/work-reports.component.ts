import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { WorkReportService } from '../../core/services/work-report.service';
import { DataService } from '../../core/services/data.service';
import { ToastService } from '../../core/services/toast.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import {
  User,
  DailyWorkReport,
  WorkCategory
} from '../../core/models';
import { getTodayDateString } from '../../core/services/mock-data';
import { Subscription } from 'rxjs';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-work-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, BadgeComponent, ModalComponent],
  template: `
    <div class="space-y-6">
      <!-- Title Bar -->
      <div class="glass-panel p-6 sm:p-8 relative overflow-hidden">
        <div class="absolute -right-20 -top-20 w-80 h-80 bg-electric/15 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="px-2.5 py-0.5 rounded-full bg-electric/20 text-electric-light font-mono text-[10px] font-bold uppercase tracking-wider">
                Creative Production Logs
              </span>
              <span class="text-text-muted">•</span>
              <span class="text-xs font-mono text-text-muted">Daily Deliverable Ledger</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Daily Work Reports
            </h1>
            <p class="text-xs sm:text-sm text-text-secondary mt-1">
              Submit daily work updates, track deliverables by project & category, and review studio velocity.
            </p>
          </div>

          <button
            (click)="openSubmitModal()"
            class="btn-primary py-2.5 px-4 text-xs font-semibold self-start sm:self-auto cursor-pointer"
          >
            <app-icon name="plus" [size]="16"></app-icon>
            <span>Submit Today's Report</span>
          </button>
        </div>
      </div>

      <!-- Filters Bar -->
      <div class="glass-panel p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-3 flex-wrap flex-1">
          <!-- Search project or text -->
          <div class="relative min-w-[200px]">
            <app-icon name="search" [size]="14" extraClass="absolute left-3 top-2.5 text-text-muted"></app-icon>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Search project or description..."
              class="input-field pl-8 py-1.5 text-xs"
            />
          </div>

          <!-- Employee Filter (HR only) -->
          <select
            *ngIf="isAdmin"
            [(ngModel)]="selectedUserFilter"
            class="input-field py-1.5 text-xs w-auto"
          >
            <option value="ALL">All Creatives</option>
            <option *ngFor="let u of allUsers" [value]="u.id">{{ u.name }}</option>
          </select>

          <!-- Category Filter -->
          <select [(ngModel)]="selectedCategoryFilter" class="input-field py-1.5 text-xs w-auto">
            <option value="ALL">All Categories</option>
            <option value="Video Editing">Video Editing</option>
            <option value="Graphic Design">Graphic Design</option>
            <option value="Motion & 3D">Motion & 3D</option>
            <option value="Digital Marketing">Digital Marketing</option>
            <option value="Photography">Photography</option>
            <option value="Content Creation">Content Creation</option>
            <option value="Strategy & Review">Strategy & Review</option>
          </select>

          <!-- Date Filter -->
          <input
            type="date"
            [(ngModel)]="selectedDateFilter"
            class="input-field py-1.5 text-xs w-auto font-mono"
          />

          <button
            *ngIf="searchQuery || selectedUserFilter !== 'ALL' || selectedCategoryFilter !== 'ALL' || selectedDateFilter"
            (click)="resetFilters()"
            class="btn-ghost text-xs text-text-muted hover:text-white"
          >
            Reset
          </button>
        </div>

        <button
          (click)="exportCsv()"
          class="btn-secondary text-xs shrink-0 cursor-pointer"
        >
          <app-icon name="download" [size]="14"></app-icon>
          <span>Export Reports CSV</span>
        </button>
      </div>

      <!-- Reports List -->
      <div class="space-y-4">
        <div
          *ngFor="let rep of displayedReports"
          class="glass-panel p-5 sm:p-6 hover:border-surface-border-bright transition-all"
        >
          <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
            <div class="flex items-center gap-3">
              <img
                [src]="rep.employeeAvatar"
                [alt]="rep.employeeName"
                class="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-electric/30"
              />
              <div>
                <div class="font-bold text-white text-sm flex items-center gap-2">
                  <span>{{ rep.employeeName }}</span>
                  <span class="text-[10px] text-text-muted font-mono font-normal">({{ rep.employeeId }})</span>
                </div>
                <div class="flex items-center gap-2 text-xs text-text-secondary mt-0.5">
                  <span class="text-electric font-semibold">{{ rep.projectName }}</span>
                  <span>•</span>
                  <span class="text-text-muted">{{ rep.category }}</span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3 self-end sm:self-auto">
              <span class="font-mono text-emerald-400 font-extrabold text-sm px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                {{ rep.timeSpentHours }} hrs
              </span>
              <app-badge [label]="rep.taskStatus" [variant]="rep.taskStatus"></app-badge>
            </div>
          </div>

          <p class="text-xs sm:text-sm text-text-secondary leading-relaxed bg-surface-secondary/40 p-4 rounded-xl border border-surface-border/50">
            {{ rep.workDescription }}
          </p>

          <div class="mt-3 flex items-center justify-between text-[11px] text-text-muted font-mono">
            <span>Date: {{ rep.date }}</span>
            <div *ngIf="rep.referenceUrl">
              <a
                [href]="rep.referenceUrl"
                target="_blank"
                rel="noopener"
                class="text-electric hover:underline flex items-center gap-1"
              >
                <span>Preview Deliverable</span>
                <app-icon name="arrow-right" [size]="12"></app-icon>
              </a>
            </div>
          </div>
        </div>

        <div *ngIf="displayedReports.length === 0" class="glass-panel py-16 text-center text-xs text-text-muted">
          No work reports match your search criteria.
        </div>
      </div>

      <!-- Submit Report Modal -->
      <app-modal
        [isOpen]="isSubmitModalOpen"
        title="Submit Daily Work Report"
        subtitle="Log project milestones, hours spent and deliverable status"
        (close)="isSubmitModalOpen = false"
      >
        <form (ngSubmit)="saveReportForm()" class="space-y-4 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
                Report Date *
              </label>
              <input
                type="date"
                [(ngModel)]="reportFormData.date"
                name="date"
                required
                class="input-field font-mono"
              />
            </div>

            <div>
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
                Creative Category *
              </label>
              <select [(ngModel)]="reportFormData.category" name="category" class="input-field">
                <option value="Video Editing">Video Editing</option>
                <option value="Graphic Design">Graphic Design</option>
                <option value="Motion & 3D">Motion & 3D</option>
                <option value="Digital Marketing">Digital Marketing</option>
                <option value="Photography">Photography</option>
                <option value="Content Creation">Content Creation</option>
                <option value="Strategy & Review">Strategy & Review</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
              Project Name *
            </label>
            <input
              type="text"
              [(ngModel)]="reportFormData.projectName"
              name="projectName"
              required
              placeholder="e.g. Nike Cyber Campaign 60s Cut"
              class="input-field"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
                Time Spent (Hours) *
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="24"
                [(ngModel)]="reportFormData.timeSpentHours"
                name="timeSpentHours"
                required
                class="input-field font-mono"
              />
            </div>

            <div>
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
                Task Milestone Status *
              </label>
              <select [(ngModel)]="reportFormData.taskStatus" name="taskStatus" class="input-field">
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending Review">Pending Review</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
              Detailed Work Description *
            </label>
            <textarea
              [(ngModel)]="reportFormData.workDescription"
              name="workDescription"
              rows="4"
              required
              placeholder="Describe deliverables completed, assets touched, render iterations, client feedback addressed..."
              class="input-field"
            ></textarea>
          </div>

          <div>
            <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
              Reference Asset / Preview Link (Optional)
            </label>
            <input
              type="url"
              [(ngModel)]="reportFormData.referenceUrl"
              name="referenceUrl"
              placeholder="https://frame.io/... or https://figma.com/..."
              class="input-field"
            />
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-surface-border">
            <button
              type="button"
              (click)="isSubmitModalOpen = false"
              class="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn-primary text-xs"
            >
              Submit Report
            </button>
          </div>
        </form>
      </app-modal>
    </div>
  `
})
export class WorkReportsComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isAdmin = false;
  allReports: DailyWorkReport[] = [];
  allUsers: User[] = [];

  // Filters
  searchQuery = '';
  selectedUserFilter = 'ALL';
  selectedCategoryFilter = 'ALL';
  selectedDateFilter = '';

  // Modal
  isSubmitModalOpen = false;
  reportFormData = {
    date: getTodayDateString(),
    projectName: '',
    category: 'Video Editing' as WorkCategory,
    timeSpentHours: 6,
    taskStatus: 'In Progress' as DailyWorkReport['taskStatus'],
    workDescription: '',
    referenceUrl: ''
  };

  private subs: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private workReportService: WorkReportService,
    private dataService: DataService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.subs.push(
      this.authService.currentUser$.subscribe(u => {
        this.currentUser = u;
        this.isAdmin = u?.role === 'admin';
      }),
      this.dataService.getUsers().subscribe(users => {
        this.allUsers = users.filter(u => u.status === 'active');
      }),
      this.workReportService.getAllReports().subscribe(reps => {
        this.allReports = reps;
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  get displayedReports(): DailyWorkReport[] {
    let list = [...this.allReports];

    // If regular employee, show own reports
    if (!this.isAdmin && this.currentUser) {
      list = list.filter(r => r.userId === this.currentUser!.id);
    } else if (this.selectedUserFilter !== 'ALL') {
      list = list.filter(r => r.userId === this.selectedUserFilter);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(
        r =>
          r.projectName.toLowerCase().includes(q) ||
          r.workDescription.toLowerCase().includes(q) ||
          r.employeeName.toLowerCase().includes(q)
      );
    }

    if (this.selectedCategoryFilter !== 'ALL') {
      list = list.filter(r => r.category === this.selectedCategoryFilter);
    }

    if (this.selectedDateFilter) {
      list = list.filter(r => r.date === this.selectedDateFilter);
    }

    return list;
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedUserFilter = 'ALL';
    this.selectedCategoryFilter = 'ALL';
    this.selectedDateFilter = '';
  }

  openSubmitModal(): void {
    this.reportFormData = {
      date: getTodayDateString(),
      projectName: '',
      category: 'Video Editing',
      timeSpentHours: 6,
      taskStatus: 'In Progress',
      workDescription: '',
      referenceUrl: ''
    };
    this.isSubmitModalOpen = true;
  }

  saveReportForm(): void {
    if (!this.currentUser) return;
    if (!this.reportFormData.projectName.trim() || !this.reportFormData.workDescription.trim()) {
      this.toastService.error('Please enter project name and work description.');
      return;
    }

    try {
      this.workReportService.submitReport(this.currentUser, {
        date: this.reportFormData.date,
        projectName: this.reportFormData.projectName,
        category: this.reportFormData.category,
        timeSpentHours: this.reportFormData.timeSpentHours,
        taskStatus: this.reportFormData.taskStatus,
        workDescription: this.reportFormData.workDescription,
        referenceUrl: this.reportFormData.referenceUrl || undefined
      });
      this.isSubmitModalOpen = false;
      this.toastService.success('Daily work report submitted successfully!');
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    } catch (err: any) {
      this.toastService.error(err.message || 'Failed to submit report');
    }
  }

  exportCsv(): void {
    const rows = this.displayedReports.map(r => ({
      'Employee ID': r.employeeId,
      'Name': r.employeeName,
      'Date': r.date,
      'Project': r.projectName,
      'Category': r.category,
      'Hours Spent': r.timeSpentHours,
      'Status': r.taskStatus,
      'Description': r.workDescription,
      'Reference URL': r.referenceUrl || ''
    }));

    const csvContent = [
      Object.keys(rows[0] || {}).join(','),
      ...rows.map(row => Object.values(row).map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    ].join('\r\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `7clouds_work_reports_${getTodayDateString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.toastService.success('Work reports exported to CSV.');
  }
}
