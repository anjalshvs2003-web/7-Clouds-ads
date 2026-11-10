import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';
import { ToastService } from '../../../core/services/toast.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { User } from '../../../core/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IconComponent],
  template: `
    <div class="min-h-screen bg-background relative flex items-center justify-center p-4 overflow-hidden">
      <!-- Ambient Glow Effects -->
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-electric/20 rounded-full blur-[128px] pointer-events-none animate-pulse-glow"></div>
      <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-violet/20 rounded-full blur-[128px] pointer-events-none animate-pulse-glow" style="animation-delay: 2s;"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-electric/5 rounded-full blur-[160px] pointer-events-none"></div>

      <!-- Main Container -->
      <div class="relative w-full max-w-lg z-10 my-8">
        <!-- Logo & Branding Header -->
        <div class="text-center mb-6">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-electric via-violet to-lavender shadow-glow-electric mb-3 ring-2 ring-electric/30">
            <app-icon name="cloud" [size]="28" extraClass="text-white drop-shadow"></app-icon>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            7 CLOUDS <span class="gradient-brand-text">WORKSPACE</span>
          </h1>
          <p class="text-xs sm:text-sm text-text-muted mt-1 font-medium">
            Creative Agency Employee Attendance & Task Management
          </p>
        </div>

        <!-- Auth Card Container -->
        <div class="glass-panel p-6 sm:p-8 shadow-surface-elevated relative overflow-hidden">
          <div class="glow-border-blue"></div>

          <!-- Two Primary Public Options: LOGIN & CREATE ACCOUNT -->
          <div class="grid grid-cols-2 p-1 bg-surface-secondary/70 rounded-xl mb-6 border border-surface-border">
            <button
              type="button"
              (click)="activeTab = 'login'; errorMessage = ''; successMessage = ''"
              class="py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              [ngClass]="activeTab === 'login' ? 'bg-gradient-to-r from-electric to-violet text-white shadow-glow-electric' : 'text-text-muted hover:text-white'"
            >
              <app-icon name="log-in" [size]="14"></app-icon>
              <span>Login</span>
            </button>

            <button
              type="button"
              (click)="activeTab = 'register'; errorMessage = ''; successMessage = ''"
              class="py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              [ngClass]="activeTab === 'register' ? 'bg-gradient-to-r from-electric to-violet text-white shadow-glow-electric' : 'text-text-muted hover:text-white'"
            >
              <app-icon name="user-plus" [size]="14"></app-icon>
              <span>Create Account</span>
            </button>
          </div>

          <!-- Success Banner / Modal Notification -->
          <div *ngIf="successMessage" class="mb-5 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs animate-fadeIn space-y-2">
            <div class="flex items-center gap-2 font-bold text-emerald-400">
              <app-icon name="check-circle" [size]="16" extraClass="shrink-0"></app-icon>
              <span>Registration Submitted Successfully!</span>
            </div>
            <p class="text-[11px] text-text-secondary leading-relaxed">
              {{ successMessage }}
            </p>
            <div class="pt-2">
              <button
                type="button"
                (click)="activeTab = 'login'; successMessage = ''"
                class="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-bold text-[11px] transition-colors cursor-pointer"
              >
                Proceed to Login →
              </button>
            </div>
          </div>

          <!-- Error Banner -->
          <div *ngIf="errorMessage" class="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-fadeIn">
            <app-icon name="alert-triangle" [size]="16" extraClass="shrink-0 text-rose-400"></app-icon>
            <span class="leading-relaxed">{{ errorMessage }}</span>
          </div>

          <!-- ================= TAB 1: LOGIN ================= -->
          <div *ngIf="activeTab === 'login'" class="space-y-4">
            <div class="mb-2">
              <div class="flex items-center justify-between">
                <h2 class="text-sm font-bold text-white">Employee Workspace Access</h2>
                <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active Staff
                </span>
              </div>
              <p class="text-[11px] text-text-muted mt-0.5">Instant passwordless access configured for 7 Clouds Video Editor.</p>
            </div>

            <!-- 1-Click Instant Login Card for Adithya Kumar (Password & Username Removed) -->
            <div class="p-4 rounded-2xl bg-gradient-to-br from-surface-secondary to-surface-tertiary border border-electric/30 shadow-glow-electric/10 space-y-4">
              <div class="flex items-center gap-3.5">
                <div class="relative w-13 h-13 rounded-2xl overflow-hidden bg-electric/10 border-2 border-electric/40 shrink-0">
                  <img
                    [src]="adithyaUser?.avatar"
                    [alt]="adithyaUser?.name"
                    class="w-full h-full object-cover"
                  />
                  <span class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-surface-secondary rounded-full"></span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <h3 class="text-sm font-bold text-white truncate">{{ adithyaUser?.name }}</h3>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-electric/15 text-electric border border-electric/30">Staff</span>
                  </div>
                  <p class="text-xs text-electric font-semibold">{{ adithyaUser?.designation }}</p>
                  <p class="text-[11px] text-text-muted font-mono truncate">{{ adithyaUser?.email }}</p>
                </div>
              </div>

              <button
                type="button"
                (click)="handleQuickAdithyaLogin()"
                [disabled]="loading"
                class="w-full btn-primary py-3.5 text-xs font-bold tracking-wide cursor-pointer flex items-center justify-center gap-2 shadow-glow-electric hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                <app-icon name="zap" [size]="16" extraClass="text-amber-300"></app-icon>
                <span *ngIf="!loading">Enter Workspace as Adithya</span>
                <span *ngIf="loading" class="flex items-center justify-center gap-2">
                  <span class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  <span>Entering Workspace...</span>
                </span>
              </button>

              <div class="flex items-center justify-center gap-2 text-[10px] text-text-muted text-center">
                <app-icon name="check-circle" [size]="12" extraClass="text-emerald-400"></app-icon>
                <span>No username or password required • Instant 1-click workspace entry</span>
              </div>
            </div>

            <!-- Optional Collapsible Manual Form for other accounts -->
            <div class="pt-2 text-center">
              <button
                type="button"
                (click)="showManualLogin = !showManualLogin"
                class="text-[11px] text-text-muted hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-surface-secondary/70 border border-transparent hover:border-surface-border"
              >
                <app-icon [name]="showManualLogin ? 'chevron-up' : 'chevron-down'" [size]="14"></app-icon>
                <span>{{ showManualLogin ? 'Hide manual sign-in fields' : 'Sign in with another User ID / password' }}</span>
              </button>
            </div>

            <!-- Manual Sign In Form (Hidden by default so main page has no username/password inputs) -->
            <div *ngIf="showManualLogin" class="pt-3 border-t border-surface-border space-y-3.5 animate-fadeIn">
              <form (ngSubmit)="handleLogin()" class="space-y-3 text-xs">
                <div>
                  <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5 font-mono text-[10px]">
                    User ID, Email or Phone
                  </label>
                  <div class="relative">
                    <input
                      type="text"
                      [(ngModel)]="loginIdentifier"
                      name="loginIdentifier"
                      placeholder="Enter ID, email or phone..."
                      class="input-field pl-10 text-xs font-mono"
                    />
                    <app-icon name="user" [size]="16" extraClass="absolute left-3.5 top-3 text-text-muted"></app-icon>
                  </div>
                </div>

                <div>
                  <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5 font-mono text-[10px]">
                    Password
                  </label>
                  <div class="relative">
                    <input
                      type="password"
                      [(ngModel)]="loginPassword"
                      name="loginPassword"
                      placeholder="••••••••••••"
                      class="input-field pl-10 text-xs"
                    />
                    <app-icon name="shield" [size]="16" extraClass="absolute left-3.5 top-3 text-text-muted"></app-icon>
                  </div>
                </div>

                <button
                  type="submit"
                  [disabled]="loading"
                  class="w-full btn-secondary py-2.5 text-xs font-bold tracking-wide cursor-pointer"
                >
                  <span *ngIf="!loading">Verify & Sign In</span>
                  <span *ngIf="loading" class="flex items-center justify-center gap-2">
                    <span class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                    <span>Verifying...</span>
                  </span>
                </button>
              </form>
            </div>

            <div class="mt-4 p-3 rounded-xl bg-surface-secondary/40 border border-surface-border text-center text-[11px] text-text-muted">
              New employee joining 7 Clouds?
              <button
                type="button"
                (click)="activeTab = 'register'; errorMessage = ''"
                class="text-electric hover:underline font-bold ml-1 cursor-pointer"
              >
                Create Account
              </button>
            </div>
          </div>

          <!-- ================= TAB 2: CREATE ACCOUNT (REGISTRATION) ================= -->
          <div *ngIf="activeTab === 'register'">
            <div class="mb-4">
              <h2 class="text-sm font-bold text-white">Create Employee Account</h2>
              <p class="text-[11px] text-text-muted mt-0.5">
                Set up your personal User ID, password, and profile photo. Requires Host approval before login.
              </p>
            </div>

            <form (ngSubmit)="handleRegister()" class="space-y-3.5 text-xs">
              <!-- Profile Photo Upload -->
              <div>
                <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-2 font-mono text-[10px]">
                  Profile Photo (Optional)
                </label>
                <div class="flex items-center gap-4 p-3 rounded-2xl bg-surface-secondary/50 border border-surface-border">
                  <div class="relative w-14 h-14 rounded-2xl overflow-hidden bg-surface-tertiary border-2 border-surface-border flex items-center justify-center shrink-0">
                    <img
                      *ngIf="regForm.avatarPreview"
                      [src]="regForm.avatarPreview"
                      alt="Avatar Preview"
                      class="w-full h-full object-cover"
                    />
                    <app-icon *ngIf="!regForm.avatarPreview" name="user" [size]="24" extraClass="text-text-muted"></app-icon>
                  </div>

                  <div class="flex-1">
                    <label class="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-tertiary hover:bg-electric/20 border border-surface-border hover:border-electric/40 text-white text-[11px] font-semibold transition-colors">
                      <app-icon name="camera" [size]="14"></app-icon>
                      <span>{{ regForm.avatarPreview ? 'Change Photo' : 'Upload Photo' }}</span>
                      <input
                        type="file"
                        accept="image/*"
                        (change)="onPhotoSelected($event)"
                        class="hidden"
                      />
                    </label>
                    <button
                      *ngIf="regForm.avatarPreview"
                      type="button"
                      (click)="regForm.avatarPreview = ''"
                      class="ml-2 text-[10px] text-rose-400 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                    <p class="text-[10px] text-text-muted mt-1">PNG, JPG or WEBP under 5MB</p>
                  </div>
                </div>
              </div>

              <!-- Full Name -->
              <div>
                <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5 font-mono text-[10px]">
                  1. Full Name *
                </label>
                <div class="relative">
                  <input
                    type="text"
                    [(ngModel)]="regForm.name"
                    name="name"
                    required
                    placeholder="e.g. Rahul Sharma"
                    class="input-field pl-10 text-xs"
                  />
                  <app-icon name="user" [size]="16" extraClass="absolute left-3.5 top-3 text-text-muted"></app-icon>
                </div>
              </div>

              <!-- Custom User ID -->
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <label class="block text-text-secondary font-semibold uppercase tracking-wider font-mono text-[10px]">
                    2. Choose User ID *
                  </label>
                  <span class="text-[10px] text-text-muted">Unique username for login</span>
                </div>
                <div class="relative">
                  <input
                    type="text"
                    [(ngModel)]="regForm.username"
                    name="username"
                    required
                    placeholder="e.g. rahul.editor or 7C-001"
                    class="input-field pl-10 text-xs font-mono"
                  />
                  <app-icon name="hash" [size]="16" extraClass="absolute left-3.5 top-3 text-text-muted"></app-icon>
                </div>
              </div>

              <!-- Phone Number -->
              <div>
                <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5 font-mono text-[10px]">
                  3. Phone Number *
                </label>
                <div class="relative">
                  <input
                    type="tel"
                    [(ngModel)]="regForm.phone"
                    name="phone"
                    required
                    placeholder="e.g. 9847123456"
                    class="input-field pl-10 text-xs font-mono"
                  />
                  <app-icon name="phone" [size]="16" extraClass="absolute left-3.5 top-3 text-text-muted"></app-icon>
                </div>
              </div>

              <!-- Designation -->
              <div>
                <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5 font-mono text-[10px]">
                  4. Designation *
                </label>
                <div class="relative">
                  <select
                    [(ngModel)]="regForm.designation"
                    name="designation"
                    required
                    class="input-field pl-10 text-xs bg-surface-secondary text-white appearance-none cursor-pointer"
                  >
                    <option value="" disabled selected>Select your designation...</option>
                    <option value="Senior Video Editor">Senior Video Editor</option>
                    <option value="Video Editor">Video Editor</option>
                    <option value="Junior Video Editor">Junior Video Editor</option>
                    <option value="Graphics Designer">Graphics Designer</option>
                    <option value="Motion Designer">Motion Designer</option>
                    <option value="Digital Marketer">Digital Marketer</option>
                    <option value="Photographer / Cinematographer">Photographer / Cinematographer</option>
                    <option value="Content Creator">Content Creator</option>
                    <option value="Creative Director">Creative Director</option>
                  </select>
                  <app-icon name="briefcase" [size]="16" extraClass="absolute left-3.5 top-3 text-text-muted"></app-icon>
                </div>
              </div>

              <!-- Email Address -->
              <div>
                <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5 font-mono text-[10px]">
                  5. Company Email Address *
                </label>
                <div class="relative">
                  <input
                    type="email"
                    [(ngModel)]="regForm.email"
                    name="email"
                    required
                    placeholder="e.g. rahul@7clouds.studio"
                    class="input-field pl-10 text-xs font-mono"
                  />
                  <app-icon name="mail" [size]="16" extraClass="absolute left-3.5 top-3 text-text-muted"></app-icon>
                </div>
              </div>

              <!-- Password & Confirm Password Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5 font-mono text-[10px]">
                    6. Create Password *
                  </label>
                  <div class="relative">
                    <input
                      type="password"
                      [(ngModel)]="regForm.password"
                      name="password"
                      required
                      placeholder="Min 6 chars"
                      class="input-field pl-10 text-xs"
                    />
                    <app-icon name="lock" [size]="16" extraClass="absolute left-3.5 top-3 text-text-muted"></app-icon>
                  </div>
                </div>

                <div>
                  <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5 font-mono text-[10px]">
                    7. Confirm Password *
                  </label>
                  <div class="relative">
                    <input
                      type="password"
                      [(ngModel)]="regForm.confirmPassword"
                      name="confirmPassword"
                      required
                      placeholder="Repeat password"
                      class="input-field pl-10 text-xs"
                    />
                    <app-icon name="check-circle" [size]="16" extraClass="absolute left-3.5 top-3 text-text-muted"></app-icon>
                  </div>
                </div>
              </div>

              <!-- Approval Notice -->
              <div class="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-[11px] text-text-secondary flex items-start gap-2.5">
                <app-icon name="info" [size]="16" extraClass="text-violet-400 shrink-0 mt-0.5"></app-icon>
                <div>
                  <span class="text-violet-300 font-bold">Host Approval Protocol:</span>
                  Your account status is set to <strong class="text-amber-300 font-mono">PENDING APPROVAL</strong>. The Host must approve your User ID before you can log in.
                </div>
              </div>

              <button
                type="submit"
                [disabled]="loading"
                class="w-full btn-primary py-3 text-xs font-bold tracking-wide mt-2 cursor-pointer flex items-center justify-center gap-2"
              >
                <span *ngIf="!loading">Submit Registration Request</span>
                <span *ngIf="loading" class="flex items-center justify-center gap-2">
                  <span class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  <span>Creating Account...</span>
                </span>
              </button>
            </form>
          </div>
        </div>

        <!-- Subtle Footer with Discreet Host Portal Access -->
        <div class="mt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted px-2 gap-2">
          <span>© 2026 7 Clouds Studio. All rights reserved.</span>
          <a
            routerLink="/host-portal"
            class="text-[11px] text-text-muted/60 hover:text-violet-400 transition-colors flex items-center gap-1.5 font-mono"
            title="Private Administrative Gateway"
          >
            <app-icon name="shield" [size]="12"></app-icon>
            <span>Host Portal</span>
          </a>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  activeTab: 'login' | 'register' = 'login';
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Passwordless quick access for Adithya Kumar
  adithyaUser: User | null = null;
  showManualLogin: boolean = false;

  // Login form state
  loginIdentifier: string = '';
  loginPassword: string = '';

  // Registration form state
  regForm = {
    name: '',
    username: '',
    phone: '',
    designation: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatarPreview: ''
  };

  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.adithyaUser = this.dataService.getAdithyaUser();
  }

  handleQuickAdithyaLogin(): void {
    this.loading = true;
    this.errorMessage = '';

    setTimeout(() => {
      const res = this.authService.quickLoginAdithya();
      this.loading = false;

      if (res.success) {
        const user = this.authService.getCurrentUser();
        this.toastService.success(`Welcome back, ${user?.name || 'Adithya'}!`);
        this.navigateByUserRole(user);
      } else {
        this.errorMessage = res.message || 'Quick login failed.';
      }
    }, 300);
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Profile photo must be under 5MB.';
        return;
      }
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.regForm.avatarPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  handleLogin(): void {
    if (!this.loginIdentifier.trim()) {
      this.errorMessage = 'Please enter your User ID, company email or phone number.';
      return;
    }

    const clean = this.loginIdentifier.trim().toLowerCase();
    const isAdithya =
      clean === 'adithya@7clouds.studio' ||
      clean === '7c-emp001' ||
      clean === 'adithya' ||
      clean === '8078415501';

    if (!isAdithya && !this.loginPassword.trim()) {
      this.errorMessage = 'Please enter your password.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    setTimeout(() => {
      const res = this.authService.loginEmployee(this.loginIdentifier, this.loginPassword);
      this.loading = false;

      if (res.success) {
        const user = this.authService.getCurrentUser();
        this.toastService.success(`Welcome back, ${user?.name}!`);
        this.navigateByUserRole(user);
      } else {
        this.errorMessage = res.message || 'Login failed. Please verify credentials.';
      }
    }, 350);
  }

  handleRegister(): void {
    const { name, username, phone, designation, email, password, confirmPassword, avatarPreview } = this.regForm;

    if (!name.trim()) {
      this.errorMessage = 'Please enter your full name.';
      return;
    }
    if (!username.trim()) {
      this.errorMessage = 'Please choose a User ID.';
      return;
    }
    if (username.trim().length < 3) {
      this.errorMessage = 'User ID must be at least 3 characters long.';
      return;
    }
    if (!phone.trim()) {
      this.errorMessage = 'Please enter your phone number.';
      return;
    }
    if (!designation) {
      this.errorMessage = 'Please select your designation.';
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      this.errorMessage = 'Please enter a valid company email address.';
      return;
    }
    if (!password || password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long.';
      return;
    }
    if (password !== confirmPassword) {
      this.errorMessage = 'Passwords do not match. Please re-enter.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    setTimeout(() => {
      try {
        const newUser = this.dataService.registerEmployee({
          name,
          username: username.trim(),
          phone,
          designation,
          email,
          password,
          avatar: avatarPreview || undefined
        });

        this.loading = false;
        this.successMessage = `Your account request for ${newUser.name} with User ID "${newUser.employeeId}" has been registered and is waiting for Host approval. Once approved by the Host, you will be able to log in with this User ID and your password.`;
        this.toastService.success(`Account submitted! User ID: ${newUser.employeeId} is pending Host approval.`);

        // Reset registration form
        this.regForm = {
          name: '',
          username: '',
          phone: '',
          designation: '',
          email: '',
          password: '',
          confirmPassword: '',
          avatarPreview: ''
        };
      } catch (err: any) {
        this.loading = false;
        this.errorMessage = err.message || 'Registration failed.';
      }
    }, 450);
  }

  private navigateByUserRole(user: User | null): void {
    if (user?.role === 'HOST' || (user?.role as string) === 'super_admin' || user?.role === 'HR ADMIN' || (user?.role as string) === 'hr_admin') {
      this.router.navigate(['/hr-dashboard']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
