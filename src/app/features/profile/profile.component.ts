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
      <!-- Hidden file input for photo upload -->
      <input
        type="file"
        #photoFileInput
        accept="image/*"
        (change)="onPhotoFileChange($event)"
        class="hidden"
      />

      <!-- Profile Header Card -->
      <div class="glass-panel p-6 sm:p-8 relative overflow-hidden">
        <div class="absolute -right-20 -top-20 w-80 h-80 bg-electric/15 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <!-- Avatar with Camera Upload Trigger -->
          <div class="relative group shrink-0">
            <img
              [src]="currentUser?.avatar"
              [alt]="currentUser?.name"
              class="w-28 h-28 rounded-3xl object-cover ring-4 ring-surface-border shadow-glow-sm group-hover:ring-electric transition-all"
            />
            <button
              type="button"
              (click)="photoFileInput.click()"
              class="absolute -bottom-1 -right-1 p-2.5 rounded-2xl bg-gradient-to-tr from-electric to-violet text-white shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer border border-white/20"
              title="Upload new profile photo"
            >
              <app-icon name="camera" [size]="16"></app-icon>
            </button>
          </div>

          <div class="text-center sm:text-left flex-1 min-w-0">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 class="text-2xl font-extrabold text-white tracking-tight flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <span>{{ currentUser?.name }}</span>
                  <app-badge
                    [label]="getUserRoleBadgeLabel()"
                    [variant]="currentUser?.role || 'employee'"
                  ></app-badge>
                </h1>
                <p class="text-xs sm:text-sm text-electric font-semibold mt-0.5">{{ currentUser?.designation }}</p>
              </div>

              <div class="font-mono text-xs text-text-muted bg-surface-secondary/80 px-3.5 py-1.5 rounded-xl border border-surface-border inline-block self-center sm:self-auto">
                User ID: <span class="text-white font-bold">{{ currentUser?.employeeId }}</span>
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

      <!-- Photo Upload & Profile Edit Section -->
      <form (ngSubmit)="saveProfile()" class="glass-panel p-6 sm:p-8 space-y-6 text-xs">
        <div class="border-b border-surface-border pb-3 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 class="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <app-icon name="user" [size]="16" extraClass="text-electric"></app-icon>
              <span>Edit Profile & Photo</span>
            </h2>
            <p class="text-[11px] text-text-muted mt-0.5">Upload a custom profile photo and update contact info.</p>
          </div>

          <button
            type="button"
            (click)="photoFileInput.click()"
            class="px-3.5 py-1.5 rounded-xl bg-electric/20 hover:bg-electric text-electric-light hover:text-white border border-electric/40 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <app-icon name="camera" [size]="14"></app-icon>
            <span>Upload New Photo</span>
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5 font-mono text-[10px]">
              Full Name
            </label>
            <input
              type="text"
              [(ngModel)]="profileData.name"
              name="name"
              required
              class="input-field"
            />
          </div>

          <div>
            <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5 font-mono text-[10px]">
              Phone Number
            </label>
            <input
              type="tel"
              [(ngModel)]="profileData.phone"
              name="phone"
              required
              class="input-field font-mono"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5 font-mono text-[10px]">
              Designation
            </label>
            <input
              type="text"
              [(ngModel)]="profileData.designation"
              name="designation"
              required
              class="input-field"
            />
          </div>

          <div>
            <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5 font-mono text-[10px]">
              Department
            </label>
            <input
              type="text"
              [(ngModel)]="profileData.department"
              name="department"
              class="input-field"
            />
          </div>
        </div>

        <div>
          <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5 font-mono text-[10px]">
            Bio & Creative Craft
          </label>
          <textarea
            [(ngModel)]="profileData.bio"
            name="bio"
            rows="3"
            class="input-field"
            placeholder="Tell us about your creative focus, equipment, and production craft..."
          ></textarea>
        </div>

        <div class="pt-2 flex justify-end">
          <button type="submit" class="btn-primary py-2.5 px-6 font-semibold cursor-pointer">
            Save Profile Changes
          </button>
        </div>
      </form>

      <!-- Password Setup / Change Section -->
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
            <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5 font-mono text-[10px]">
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
            <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5 font-mono text-[10px]">
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
    </div>
  `
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;

  newPassword = '';
  confirmPassword = '';

  profileData = {
    name: '',
    phone: '',
    designation: '',
    department: '',
    avatar: '',
    bio: ''
  };

  getUserRoleBadgeLabel(): string {
    const role = this.currentUser?.role;
    if (role === 'HOST' || (role as string) === 'super_admin') return 'HOST';
    if (role === 'HR ADMIN' || (role as string) === 'hr_admin') return 'HR ADMIN';
    return 'EMPLOYEE';
  }

  constructor(
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(u => {
      this.currentUser = u;
      if (u) {
        this.profileData.name = u.name || '';
        this.profileData.phone = u.phone || '';
        this.profileData.designation = u.designation || '';
        this.profileData.department = u.department || 'Creative Studio';
        this.profileData.avatar = u.avatar || '';
        this.profileData.bio = u.bio || '';
      }
    });
  }

  onPhotoFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 5 * 1024 * 1024) {
        this.toastService.error('Photo must be under 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const photoDataUrl = e.target.result;
        this.profileData.avatar = photoDataUrl;
        this.authService.updateCurrentUserProfile({ avatar: photoDataUrl });
        this.toastService.success('Profile photo updated successfully!');
      };
      reader.readAsDataURL(file);
    }
  }

  handlePasswordChange(): void {
    if (!this.newPassword || this.newPassword.length < 6) {
      this.toastService.error('Password must be at least 6 characters long.');
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

    if (!this.profileData.name.trim() || !this.profileData.phone.trim()) {
      this.toastService.error('Please enter name and phone number.');
      return;
    }

    this.authService.updateCurrentUserProfile({
      name: this.profileData.name.trim(),
      phone: this.profileData.phone.trim(),
      designation: this.profileData.designation.trim(),
      department: this.profileData.department.trim(),
      avatar: this.profileData.avatar,
      bio: this.profileData.bio
    });

    this.toastService.success('Profile details saved successfully.');
  }
}
