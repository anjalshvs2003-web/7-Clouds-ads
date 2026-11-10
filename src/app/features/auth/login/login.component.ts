import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';
import { ToastService } from '../../../core/services/toast.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { User } from '../../../core/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="min-h-screen bg-background relative flex items-center justify-center p-4 overflow-hidden">
      <!-- Futuristic Ambient Glow Circles -->
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-electric/20 rounded-full blur-[128px] pointer-events-none animate-pulse-glow"></div>
      <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-violet/20 rounded-full blur-[128px] pointer-events-none animate-pulse-glow" style="animation-delay: 2s;"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-electric/5 rounded-full blur-[160px] pointer-events-none"></div>

      <!-- Main Login Card -->
      <div class="relative w-full max-w-lg z-10">
        <!-- Logo & Branding Header -->
        <div class="text-center mb-6">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-electric via-violet to-lavender shadow-glow-electric mb-3">
            <app-icon name="cloud" [size]="28" extraClass="text-white drop-shadow"></app-icon>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            7 CLOUDS <span class="gradient-brand-text">WORKSPACE</span>
          </h1>
          <p class="text-xs sm:text-sm text-text-muted mt-1 font-medium">
            Staff Attendance & Daily Task Management Terminal
          </p>
        </div>

        <!-- Card Container -->
        <div class="glass-panel p-6 sm:p-8 shadow-surface-elevated relative overflow-hidden">
          <div class="glow-border-blue"></div>

          <form (ngSubmit)="handleLogin()" class="space-y-4 text-xs">
            <div>
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-2">
                Company Email or Phone Number
              </label>
              <div class="relative">
                <input
                  type="text"
                  [(ngModel)]="identifier"
                  name="identifier"
                  required
                  placeholder="e.g. anjalsh@7clouds.studio or 8086351883"
                  class="input-field pl-10 text-xs font-mono"
                />
                <app-icon name="user" [size]="16" extraClass="absolute left-3.5 top-3 text-text-muted"></app-icon>
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-text-secondary font-semibold uppercase tracking-wider">
                  Password
                </label>
                <span class="text-[11px] text-text-muted">Enter registered password or PIN</span>
              </div>
              <div class="relative">
                <input
                  type="password"
                  [(ngModel)]="password"
                  name="password"
                  required
                  placeholder="••••••••••••"
                  class="input-field pl-10 text-xs"
                />
                <app-icon name="shield" [size]="16" extraClass="absolute left-3.5 top-3 text-text-muted"></app-icon>
              </div>
            </div>

            <button
              type="submit"
              [disabled]="loading"
              class="w-full btn-primary py-3 text-xs font-bold tracking-wide mt-2 cursor-pointer"
            >
              <span *ngIf="!loading">Sign In to Workspace</span>
              <span *ngIf="loading" class="flex items-center gap-2">
                <span class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                <span>Authenticating...</span>
              </span>
            </button>
          </form>

          <!-- 1-Click Official Staff Quick Sign-In -->
          <div class="mt-6 pt-5 border-t border-surface-border">
            <div class="flex items-center justify-between mb-3">
              <span class="text-[11px] font-bold text-text-muted uppercase tracking-wider font-mono">
                Staff Directory Quick-Access
              </span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-medium">
                5 Official Staff
              </span>
            </div>

            <div class="space-y-1.5">
              <button
                *ngFor="let member of staffList"
                type="button"
                (click)="quickLogin(member)"
                class="w-full flex items-center justify-between p-2.5 rounded-xl bg-surface-secondary/50 hover:bg-surface-secondary border border-surface-border hover:border-electric/40 text-left transition-all cursor-pointer group"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <img
                    [src]="member.avatar"
                    [alt]="member.name"
                    class="w-8 h-8 rounded-full object-cover shrink-0 border border-surface-border group-hover:border-electric transition-colors"
                  />
                  <div class="min-w-0">
                    <div class="text-xs font-bold text-white group-hover:text-electric-light truncate flex items-center gap-1.5">
                      <span>{{ member.name }}</span>
                      <span class="text-[10px] font-mono text-text-muted font-normal">({{ member.phone }})</span>
                    </div>
                    <div class="text-[10px] text-text-muted truncate">{{ member.designation }}</div>
                  </div>
                </div>

                <div class="shrink-0 text-right">
                  <span
                    class="text-[9px] uppercase px-2 py-0.5 rounded font-bold"
                    [ngClass]="member.role === 'super_admin' ? 'bg-gradient-to-r from-violet-600 to-electric text-white' : (member.role === 'hr_admin' ? 'bg-violet-500/20 text-violet-300' : 'bg-blue-500/20 text-blue-300')"
                  >
                    {{ member.role === 'super_admin' ? 'HOST' : (member.role === 'hr_admin' ? 'HR ADMIN' : 'EMPLOYEE') }}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div class="mt-4 text-center text-xs text-text-muted">
          <p>© 2026 7 Clouds Studio. Host: Anjalsh V.S | HR Admin: Athira Girish</p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  identifier: string = 'anjalsh@7clouds.studio';
  password: string = 'password123';
  loading: boolean = false;
  staffList: User[] = [];

  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.staffList = this.dataService.getUsersSnapshot();
  }

  handleLogin(): void {
    if (!this.identifier.trim()) {
      this.toastService.error('Please enter your email or phone number.');
      return;
    }

    this.loading = true;
    try {
      const ok = this.authService.login(this.identifier, this.password);
      if (ok) {
        const user = this.authService.getCurrentUser();
        this.toastService.success(`Welcome, ${user?.name}!`);
        this.navigateByUserRole(user);
      } else {
        this.toastService.error('Staff account not found. Check email/phone or contact Host.');
      }
    } catch (err: any) {
      this.toastService.error(err.message || 'Login failed.');
    } finally {
      this.loading = false;
    }
  }

  quickLogin(user: User): void {
    this.authService.switchUser(user.id);
    this.toastService.success(`Logged in as ${user.name} (${user.designation})`);
    this.navigateByUserRole(user);
  }

  private navigateByUserRole(user: User | null): void {
    if (user?.role === 'super_admin' || user?.role === 'hr_admin' || user?.role === 'admin') {
      this.router.navigate(['/hr-dashboard']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
