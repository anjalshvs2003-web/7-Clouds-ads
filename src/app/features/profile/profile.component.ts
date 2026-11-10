import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { User } from '../../core/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, BadgeComponent],
  template: `
    <div class="space-y-6 max-w-4xl mx-auto">
      <!-- Profile Header Card -->
      <div class="glass-panel p-6 sm:p-8 relative overflow-hidden">
        <div class="absolute -right-20 -top-20 w-80 h-80 bg-electric/15 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img
            [src]="currentUser?.avatar"
            [alt]="currentUser?.name"
            class="w-24 h-24 rounded-3xl object-cover ring-4 ring-surface-border shadow-glow-sm shrink-0"
          />

          <div class="text-center sm:text-left flex-1 min-w-0">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 class="text-2xl font-extrabold text-white tracking-tight flex items-center justify-center sm:justify-start gap-2">
                  <span>{{ currentUser?.name }}</span>
                  <app-badge
                    [label]="currentUser?.role === 'super_admin' ? 'HOST / OWNER' : (currentUser?.role === 'hr_admin' ? 'HR ADMIN' : 'STAFF')"
                    [variant]="currentUser?.role || 'employee'"
                  ></app-badge>
                </h1>
                <p class="text-xs sm:text-sm text-electric font-semibold mt-0.5">{{ currentUser?.designation }}</p>
              </div>

              <div class="font-mono text-xs text-text-muted bg-surface-secondary/80 px-3 py-1.5 rounded-xl border border-surface-border inline-block self-center sm:self-auto">
                ID: {{ currentUser?.employeeId }}
              </div>
            </div>

            <p class="text-xs text-text-secondary mt-3 leading-relaxed max-w-2xl">
              {{ currentUser?.bio || 'Creative practitioner at 7 Clouds Studio.' }}
            </p>

            <div class="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-text-muted font-mono">
              <span>Phone: {{ currentUser?.phone }}</span>
              <span>•</span>
              <span>Email: {{ currentUser?.email }}</span>
              <span>•</span>
              <span class="text-emerald-400 font-semibold">Status: Active</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Password Setup / Change Section (As requested in user prompt) -->
      <div class="glass-panel p-6 sm:p-8 space-y-4">
        <div class="border-b border-surface-border pb-3">
          <h2 class="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <app-icon name="shield" [size]="16" extraClass="text-violet-400"></app-icon>
            <span>Account Security & Password</span>
          </h2>
          <p class="text-[11px] text-text-muted mt-0.5">
            Set or update your secure account password. Passwords are never exposed in the staff directory.
          </p>
        </div>

        <form (ngSubmit)="handlePasswordChange()" class="space-y-4 text-xs max-w-lg">
          <div>
            <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
              New Password
            </label>
            <input
              type="password"
              [(ngModel)]="newPassword"
              name="newPassword"
              required
              placeholder="Minimum 6 characters"
              class="input-field"
            />
          </div>

          <div>
            <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              [(ngModel)]="confirmPassword"
              name="confirmPassword"
              required
              placeholder="Re-enter password"
              class="input-field"
            />
          </div>

          <button
            type="submit"
            class="btn-primary py-2 px-5 text-xs font-semibold cursor-pointer"
          >
            Update Password
          </button>
        </form>
      </div>

      <!-- Edit Contact & Profile Details Form -->
      <form (ngSubmit)="saveProfile()" class="glass-panel p-6 sm:p-8 space-y-6 text-xs">
        <div class="border-b border-surface-border pb-3">
          <h2 class="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <app-icon name="user" [size]="16" extraClass="text-electric"></app-icon>
            <span>Personal & Contact Information</span>
          </h2>
          <p class="text-[11px] text-text-muted mt-0.5">Update phone number, bio and avatar image URL.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              [(ngModel)]="profileData.phone"
              name="phone"
              class="input-field font-mono"
            />
          </div>

          <div>
            <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
              Avatar Image URL
            </label>
            <input
              type="url"
              [(ngModel)]="profileData.avatar"
              name="avatar"
              class="input-field font-mono"
            />
          </div>
        </div>

        <div>
          <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
            Bio
          </label>
          <textarea
            [(ngModel)]="profileData.bio"
            name="bio"
            rows="3"
            class="input-field"
            placeholder="Tell us about your creative focus and production craft..."
          ></textarea>
        </div>

        <div class="pt-2 flex justify-end">
          <button type="submit" class="btn-primary py-2 px-6 font-semibold cursor-pointer">
            Save Profile Details
          </button>
        </div>
      </form>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;

  newPassword = '';
  confirmPassword = '';

  profileData = {
    phone: '',
    avatar: '',
    bio: ''
  };

  constructor(
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(u => {
      this.currentUser = u;
      if (u) {
        this.profileData.phone = u.phone || '';
        this.profileData.avatar = u.avatar || '';
        this.profileData.bio = u.bio || '';
      }
    });
  }

  handlePasswordChange(): void {
    if (!this.newPassword || this.newPassword.length < 4) {
      this.toastService.error('Password must be at least 4 characters long.');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.toastService.error('Passwords do not match.');
      return;
    }

    this.authService.changePassword(this.newPassword);
    this.newPassword = '';
    this.confirmPassword = '';
    this.toastService.success('Your password has been successfully updated.');
  }

  saveProfile(): void {
    if (!this.currentUser) return;

    this.authService.updateCurrentUserProfile({
      phone: this.profileData.phone,
      avatar: this.profileData.avatar,
      bio: this.profileData.bio
    });

    this.toastService.success('Profile details saved.');
  }
}
