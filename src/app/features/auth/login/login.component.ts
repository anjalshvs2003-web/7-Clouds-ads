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
      <div class="relative w-full max-w-md z-10">
        <!-- Logo & Branding Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-electric via-violet to-lavender shadow-glow-electric mb-4">
            <app-icon name="cloud" [size]="28" extraClass="text-white drop-shadow"></app-icon>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            7 CLOUDS <span class="gradient-brand-text">STUDIO</span>
          </h1>
          <p class="text-xs sm:text-sm text-text-muted mt-1.5 font-medium">
            Futuristic Creative Workspace & Employee Hub
          </p>
        </div>

        <!-- Card Container -->
        <div class="glass-panel p-6 sm:p-8 shadow-surface-elevated relative overflow-hidden">
          <div class="glow-border-blue"></div>

          <form (ngSubmit)="handleLogin()" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                Studio Email Address
              </label>
              <div class="relative">
                <input
                  type="email"
                  [(ngModel)]="email"
                  name="email"
                  required
                  placeholder="name@7clouds.studio"
                  class="input-field pl-10"
                />
                <app-icon name="user" [size]="16" extraClass="absolute left-3.5 top-3 text-text-muted"></app-icon>
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Password
                </label>
                <span class="text-[11px] text-text-muted">Any password in demo mode</span>
              </div>
              <div class="relative">
                <input
                  type="password"
                  [(ngModel)]="password"
                  name="password"
                  required
                  placeholder="••••••••••••"
                  class="input-field pl-10"
                />
                <app-icon name="shield" [size]="16" extraClass="absolute left-3.5 top-3 text-text-muted"></app-icon>
              </div>
            </div>

            <button
              type="submit"
              [disabled]="loading"
              class="w-full btn-primary py-3 text-sm font-semibold tracking-wide mt-2"
            >
              <span *ngIf="!loading">Enter Studio Workspace</span>
              <span *ngIf="loading" class="flex items-center gap-2">
                <span class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                <span>Authenticating...</span>
              </span>
            </button>
          </form>

          <!-- 1-Click Demo Profiles Section -->
          <div class="mt-8 pt-6 border-t border-surface-border">
            <div class="flex items-center justify-between mb-3">
              <span class="text-[11px] font-bold text-text-muted uppercase tracking-wider font-mono">
                1-Click Demo Switcher
              </span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-medium">
                7 Pre-loaded Accounts
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                *ngFor="let user of demoUsers"
                type="button"
                (click)="quickLoginAs(user)"
                class="flex items-center gap-2.5 p-2 rounded-xl bg-surface-secondary/50 hover:bg-surface-secondary border border-surface-border hover:border-electric/40 text-left transition-all cursor-pointer group"
              >
                <img
                  [src]="user.avatar"
                  [alt]="user.name"
                  class="w-7 h-7 rounded-full object-cover shrink-0 border border-surface-border group-hover:border-electric transition-colors"
                />
                <div class="min-w-0 flex-1">
                  <div class="text-xs font-semibold text-text-primary group-hover:text-white truncate flex items-center justify-between">
                    <span class="truncate">{{ user.name }}</span>
                    <span
                      class="text-[9px] px-1 rounded uppercase font-bold shrink-0 ml-1"
                      [ngClass]="user.role === 'admin' ? 'bg-violet-500/20 text-violet-300' : 'bg-blue-500/20 text-blue-300'"
                    >
                      {{ user.role === 'admin' ? 'HR' : 'EMP' }}
                    </span>
                  </div>
                  <div class="text-[10px] text-text-muted truncate">{{ user.designation }}</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Footer Info -->
        <div class="mt-6 text-center text-xs text-text-muted">
          <p>© 2026 7 Clouds Creative Studio. Protected by Role-Based Access & Firestore.</p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  email: string = 'elena@7clouds.studio';
  password: string = 'password123';
  loading: boolean = false;
  demoUsers: User[] = [];

  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.demoUsers = this.dataService.getUsersSnapshot();
  }

  handleLogin(): void {
    if (!this.email) {
      this.toastService.error('Please enter an email address.');
      return;
    }

    this.loading = true;
    try {
      const ok = this.authService.login(this.email, this.password);
      if (ok) {
        const user = this.authService.getCurrentUser();
        this.toastService.success(`Welcome back to 7 Clouds, ${user?.name}!`);
        if (user?.role === 'admin') {
          this.router.navigate(['/hr-dashboard']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      } else {
        this.toastService.error('Invalid email or account not found in studio directory.');
      }
    } catch (err: any) {
      this.toastService.error(err.message || 'Login failed.');
    } finally {
      this.loading = false;
    }
  }

  quickLoginAs(user: User): void {
    this.authService.switchUser(user.id);
    this.toastService.success(`Logged in as ${user.name} (${user.designation})`);
    if (user.role === 'admin') {
      this.router.navigate(['/hr-dashboard']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
