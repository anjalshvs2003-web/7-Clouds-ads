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
    <div class="space-y-6 max-w-4xl">
      <!-- Title & Profile Header Card -->
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
                  <app-badge [label]="currentUser?.role === 'admin' ? 'HR ADMIN' : 'EMPLOYEE'" [variant]="currentUser?.role || 'employee'"></app-badge>
                </h1>
                <p class="text-xs sm:text-sm text-electric font-semibold mt-0.5">{{ currentUser?.designation }}</p>
              </div>

              <div class="font-mono text-xs text-text-muted bg-surface-secondary/80 px-3 py-1.5 rounded-xl border border-surface-border inline-block self-center sm:self-auto">
                ID: {{ currentUser?.employeeId }}
              </div>
            </div>

            <p class="text-xs text-text-secondary mt-3 leading-relaxed max-w-2xl">
              {{ currentUser?.bio || 'Creative practitioner pushing modern visual aesthetics and storytelling at 7 Clouds Studio.' }}
            </p>

            <div class="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-text-muted font-mono">
              <span>Department: {{ currentUser?.department }}</span>
              <span>•</span>
              <span>Joined: {{ currentUser?.joiningDate }}</span>
              <span>•</span>
              <span class="text-emerald-400 font-semibold">Account Status: Active</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Profile Details Form -->
      <form (ngSubmit)="saveProfile()" class="glass-panel p-6 sm:p-8 space-y-6 text-xs">
        <div class="border-b border-surface-border pb-3">
          <h2 class="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <app-icon name="user" [size]="16" extraClass="text-electric"></app-icon>
            <span>Personal & Contact Details</span>
          </h2>
          <p class="text-[11px] text-text-muted mt-0.5">Keep your emergency contact and creative skills up to date.</p>
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
            Creative Bio / Mission Statement
          </label>
          <textarea
            [(ngModel)]="profileData.bio"
            name="bio"
            rows="3"
            class="input-field"
            placeholder="Tell us about your creative craft, tools of choice and visual focus..."
          ></textarea>
        </div>

        <div>
          <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
            Key Software & Skills (comma separated)
          </label>
          <input
            type="text"
            [(ngModel)]="skillsString"
            name="skills"
            class="input-field"
            placeholder="Premiere Pro, DaVinci Resolve, Cinema 4D, Figma..."
          />
        </div>

        <!-- Emergency Contact Section -->
        <div class="pt-4 border-t border-surface-border space-y-4">
          <h3 class="text-xs font-bold text-text-primary uppercase tracking-wider font-mono">
            Emergency Contact Information
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
                Contact Name
              </label>
              <input
                type="text"
                [(ngModel)]="profileData.emergencyName"
                name="emergencyName"
                placeholder="Jane Vance"
                class="input-field"
              />
            </div>

            <div>
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
                Relationship
              </label>
              <input
                type="text"
                [(ngModel)]="profileData.emergencyRelationship"
                name="emergencyRelationship"
                placeholder="Spouse / Parent / Sibling"
                class="input-field"
              />
            </div>

            <div>
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
                Contact Phone
              </label>
              <input
                type="tel"
                [(ngModel)]="profileData.emergencyPhone"
                name="emergencyPhone"
                placeholder="+1 (555) 999-0000"
                class="input-field font-mono"
              />
            </div>
          </div>
        </div>

        <div class="pt-4 flex justify-end">
          <button type="submit" class="btn-primary py-2.5 px-6 font-semibold cursor-pointer">
            Save Profile Changes
          </button>
        </div>
      </form>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  skillsString = '';

  profileData = {
    phone: '',
    avatar: '',
    bio: '',
    emergencyName: 'Alex Vance',
    emergencyRelationship: 'Spouse',
    emergencyPhone: '+1 (555) 911-2233'
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
        this.skillsString = (u.skills || []).join(', ');
        if (u.emergencyContact) {
          this.profileData.emergencyName = u.emergencyContact.name;
          this.profileData.emergencyRelationship = u.emergencyContact.relationship;
          this.profileData.emergencyPhone = u.emergencyContact.phone;
        }
      }
    });
  }

  saveProfile(): void {
    if (!this.currentUser) return;

    const skills = this.skillsString.split(',').map(s => s.trim()).filter(Boolean);

    this.authService.updateCurrentUserProfile({
      phone: this.profileData.phone,
      avatar: this.profileData.avatar,
      bio: this.profileData.bio,
      skills,
      emergencyContact: {
        name: this.profileData.emergencyName,
        relationship: this.profileData.emergencyRelationship,
        phone: this.profileData.emergencyPhone
      }
    });

    this.toastService.success('Profile details updated successfully.');
  }
}
