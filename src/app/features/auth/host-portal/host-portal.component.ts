import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-host-portal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="min-h-screen bg-background relative flex items-center justify-center p-4 overflow-hidden">
      <!-- Ambient Cyber Glows -->
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-violet/25 rounded-full blur-[140px] pointer-events-none animate-pulse-glow"></div>
      <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-electric/25 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" style="animation-delay: 2s;"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-electric/10 rounded-full blur-[180px] pointer-events-none"></div>

      <div class="relative w-full max-w-md z-10">
        <!-- Header -->
        <div class="text-center mb-6">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 via-electric to-lavender shadow-glow-electric mb-3 ring-2 ring-violet-400/40">
            <app-icon name="shield" [size]="32" extraClass="text-white drop-shadow"></app-icon>
          </div>
          <div class="inline-block px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 font-mono text-[10px] font-bold uppercase tracking-wider mb-2 border border-violet-500/30">
            RESTRICTED • HOST / SUPER ADMIN
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            HOST <span class="gradient-brand-text">CONSOLE</span>
          </h1>
          <p class="text-xs text-text-muted mt-1 font-medium">
            Master Administrative Access & Staff Governance Terminal
          </p>
        </div>

        <!-- Terminal Card -->
        <div class="glass-panel p-6 sm:p-8 shadow-surface-elevated relative overflow-hidden border border-violet-500/30">
          <div class="glow-border-blue"></div>

          <div class="mb-5 p-3 rounded-xl bg-surface-secondary/70 border border-violet-500/20 text-[11px] text-text-secondary leading-relaxed">
            <div class="flex items-center gap-2 font-bold text-violet-300 mb-1">
              <app-icon name="check-circle" [size]="14"></app-icon>
              <span>Private Environment Gateway</span>
            </div>
            This portal is strictly segregated from public employee directories. Provisioned Host keys grant full authority over employee registrations, HR delegations, attendance and tasks.
          </div>

          <form (ngSubmit)="handleHostLogin()" class="space-y-4 text-xs">
            <div>
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-2 font-mono text-[10px]">
                Host Master Access Key
              </label>
              <div class="relative">
                <input
                  type="password"
                  [(ngModel)]="accessKey"
                  name="accessKey"
                  required
                  placeholder="Enter secret Host access key..."
                  class="input-field pl-10 text-xs font-mono tracking-wider focus:border-violet-500"
                />
                <app-icon name="shield" [size]="16" extraClass="absolute left-3.5 top-3 text-violet-400"></app-icon>
              </div>
            </div>

            <!-- Error Banner -->
            <div *ngIf="errorMessage" class="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
              <app-icon name="alert-triangle" [size]="16" extraClass="shrink-0 text-rose-400"></app-icon>
              <span>{{ errorMessage }}</span>
            </div>

            <button
              type="submit"
              [disabled]="loading"
              class="w-full py-3 px-4 rounded-xl font-bold text-xs tracking-wider uppercase text-white bg-gradient-to-r from-violet-600 via-electric to-lavender hover:opacity-95 shadow-glow-electric transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span *ngIf="!loading" class="flex items-center gap-2">
                <app-icon name="check-circle" [size]="16"></app-icon>
                <span>Authenticate Master Console</span>
              </span>
              <span *ngIf="loading" class="flex items-center gap-2">
                <span class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                <span>Verifying Secure Key...</span>
              </span>
            </button>
          </form>

          <div class="mt-6 pt-4 border-t border-surface-border/50 text-center">
            <button
              type="button"
              (click)="returnToPublic()"
              class="text-xs text-text-muted hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <app-icon name="arrow-left" [size]="14"></app-icon>
              <span>Back to Employee Workspace</span>
            </button>
          </div>
        </div>

        <div class="mt-4 text-center text-[10px] text-text-muted font-mono">
          7 Clouds Security Architecture • Protected RBAC Protocol
        </div>
      </div>
    </div>
  `
})
export class HostPortalComponent {
  accessKey: string = '';
  loading: boolean = false;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}

  handleHostLogin(): void {
    if (!this.accessKey.trim()) {
      this.errorMessage = 'Please enter your Host Access Key.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      const res = this.authService.loginHost(this.accessKey);
      this.loading = false;

      if (res.success) {
        this.toastService.success('Host Master Console Activated! Full Administrative Access Granted.');
        this.router.navigate(['/hr-dashboard']);
      } else {
        this.errorMessage = res.message || 'Invalid Host credentials. Access denied.';
        this.toastService.error('Host Authentication Failed.');
      }
    } catch (err: any) {
      this.loading = false;
      this.errorMessage = err.message || 'Host authentication error.';
    }
  }

  returnToPublic(): void {
    this.router.navigate(['/login']);
  }
}
