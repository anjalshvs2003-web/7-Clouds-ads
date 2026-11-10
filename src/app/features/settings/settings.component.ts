import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import { ToastService } from '../../core/services/toast.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { StudioSettings } from '../../core/models';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6 max-w-4xl">
      <!-- Title Bar -->
      <div class="glass-panel p-6 sm:p-8 relative overflow-hidden">
        <div class="absolute -right-20 -top-20 w-80 h-80 bg-violet/15 rounded-full blur-3xl pointer-events-none"></div>

        <div>
          <div class="flex items-center gap-2 mb-1.5">
            <span class="px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-mono text-[10px] font-bold uppercase tracking-wider">
              Studio Configuration
            </span>
            <span class="text-text-muted">•</span>
            <span class="text-xs font-mono text-text-muted">Master Rules & Policies</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Studio Policies & Settings
          </h1>
          <p class="text-xs sm:text-sm text-text-secondary mt-1">
            Configure attendance cutoff hours, work schedules, notifications and sandbox environment rules.
          </p>
        </div>
      </div>

      <!-- Settings Form -->
      <form (ngSubmit)="saveSettings()" class="glass-panel p-6 sm:p-8 space-y-6 text-xs">
        <!-- Studio Identity -->
        <div class="space-y-4">
          <h2 class="text-sm font-bold text-white uppercase tracking-wider font-mono border-b border-surface-border pb-2 flex items-center gap-2">
            <app-icon name="cloud" [size]="16" extraClass="text-electric"></app-icon>
            <span>Studio Identity</span>
          </h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
                Studio Name
              </label>
              <input
                type="text"
                [(ngModel)]="settings.studioName"
                name="studioName"
                required
                class="input-field"
              />
            </div>

            <div>
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
                Attendance Morning Cutoff Time (24h)
              </label>
              <input
                type="time"
                [(ngModel)]="settings.attendanceCutoffTime"
                name="attendanceCutoffTime"
                required
                class="input-field font-mono"
              />
              <p class="text-[10px] text-text-muted mt-1">
                Employees checking in after this time are flagged with late notification.
              </p>
            </div>
          </div>
        </div>

        <!-- Shift & Hours Thresholds -->
        <div class="space-y-4 pt-4 border-t border-surface-border">
          <h2 class="text-sm font-bold text-white uppercase tracking-wider font-mono border-b border-surface-border pb-2 flex items-center gap-2">
            <app-icon name="clock" [size]="16" extraClass="text-emerald-400"></app-icon>
            <span>Working Hours & Thresholds</span>
          </h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
                Standard Full Day Hours
              </label>
              <input
                type="number"
                step="0.5"
                min="4"
                max="12"
                [(ngModel)]="settings.standardWorkingHours"
                name="standardWorkingHours"
                class="input-field font-mono"
              />
            </div>

            <div>
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
                Half Day Threshold Hours
              </label>
              <input
                type="number"
                step="0.5"
                min="2"
                max="6"
                [(ngModel)]="settings.halfDayThresholdHours"
                name="halfDayThresholdHours"
                class="input-field font-mono"
              />
            </div>
          </div>
        </div>

        <!-- System Toggles -->
        <div class="space-y-4 pt-4 border-t border-surface-border">
          <h2 class="text-sm font-bold text-white uppercase tracking-wider font-mono border-b border-surface-border pb-2 flex items-center gap-2">
            <app-icon name="shield" [size]="16" extraClass="text-violet-400"></app-icon>
            <span>Automation & Notification Policies</span>
          </h2>

          <div class="space-y-3">
            <label class="flex items-center gap-3 p-3 rounded-xl bg-surface-secondary/40 border border-surface-border cursor-pointer">
              <input
                type="checkbox"
                [(ngModel)]="settings.allowSelfCheckIn"
                name="allowSelfCheckIn"
                class="rounded bg-surface-secondary border-surface-border text-electric"
              />
              <div>
                <div class="font-semibold text-white">Allow Employee Self-Service Check-In</div>
                <div class="text-[11px] text-text-muted">Permit employees to log their check-in from their authenticated terminal.</div>
              </div>
            </label>

            <label class="flex items-center gap-3 p-3 rounded-xl bg-surface-secondary/40 border border-surface-border cursor-pointer">
              <input
                type="checkbox"
                [(ngModel)]="settings.fcmEnabled"
                name="fcmEnabled"
                class="rounded bg-surface-secondary border-surface-border text-electric"
              />
              <div>
                <div class="font-semibold text-white">Firebase Cloud Messaging (FCM) Push Sync</div>
                <div class="text-[11px] text-text-muted">Dispatch browser notifications for task assignments and approvals.</div>
              </div>
            </label>
          </div>
        </div>

        <!-- Danger Zone / Demo Data -->
        <div class="space-y-4 pt-4 border-t border-surface-border">
          <h2 class="text-sm font-bold text-rose-400 uppercase tracking-wider font-mono border-b border-surface-border pb-2 flex items-center gap-2">
            <app-icon name="alert-circle" [size]="16" extraClass="text-rose-400"></app-icon>
            <span>Development & Demo Mode</span>
          </h2>

          <div class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div class="font-bold text-white">Reset Workspace To Factory Demo Data</div>
              <div class="text-[11px] text-text-muted mt-0.5">
                Restores the 6 creative employees, attendance records, sample tasks, reports and announcements.
              </div>
            </div>

            <button
              type="button"
              (click)="resetDemoData()"
              class="px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold transition-all shrink-0 cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.3)]"
            >
              Reset All Seed Data
            </button>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="pt-4 flex justify-end">
          <button type="submit" class="btn-primary py-2.5 px-6 font-semibold">
            Save Studio Settings
          </button>
        </div>
      </form>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  settings: StudioSettings = {
    studioName: '7 Clouds Creative Studio',
    attendanceCutoffTime: '10:30',
    standardWorkingHours: 8,
    halfDayThresholdHours: 4,
    allowSelfCheckIn: true,
    fcmEnabled: true,
    demoMode: true
  };

  constructor(
    private dataService: DataService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.settings = { ...this.dataService.getSettingsSnapshot() };
  }

  saveSettings(): void {
    this.dataService.updateSettings(this.settings);
    this.toastService.success('Studio configuration saved successfully.');
  }

  resetDemoData(): void {
    if (confirm('Are you sure you want to reset all records to the original demo seed data?')) {
      this.dataService.resetToDefaults();
      this.toastService.info('All demo data restored.');
      setTimeout(() => window.location.reload(), 500);
    }
  }
}
