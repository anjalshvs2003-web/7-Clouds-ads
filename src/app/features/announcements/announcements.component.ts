import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { AnnouncementService } from '../../core/services/announcement.service';
import { ToastService } from '../../core/services/toast.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { User, Announcement } from '../../core/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, BadgeComponent, ModalComponent],
  template: `
    <div class="space-y-6">
      <!-- Title Bar -->
      <div class="glass-panel p-6 sm:p-8 relative overflow-hidden">
        <div class="absolute -right-20 -top-20 w-80 h-80 bg-violet/15 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                Studio Broadcast Channel
              </span>
              <span class="text-text-muted">•</span>
              <span class="text-xs font-mono text-text-muted">Agency-Wide Transmissions</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Company Announcements
            </h1>
            <p class="text-xs sm:text-sm text-text-secondary mt-1">
              Official studio directives, infrastructure upgrades, policy notices and creative showcase briefings.
            </p>
          </div>

          <button
            *ngIf="isAdmin"
            (click)="isPublishModalOpen = true"
            class="btn-primary py-2.5 px-4 text-xs font-semibold self-start sm:self-auto cursor-pointer"
          >
            <app-icon name="plus" [size]="16"></app-icon>
            <span>Publish Announcement</span>
          </button>
        </div>
      </div>

      <!-- Announcements Stream -->
      <div class="space-y-4">
        <div
          *ngFor="let ann of announcements"
          class="glass-panel p-6 hover:border-surface-border-bright transition-all relative overflow-hidden group"
          [ngClass]="ann.pinned ? 'border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.08)]' : ''"
        >
          <!-- Pinned Indicator Bar -->
          <div *ngIf="ann.pinned" class="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-400 to-amber-600"></div>

          <div class="flex items-start justify-between gap-4 mb-3">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <span *ngIf="ann.pinned" class="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  <app-icon name="pin" [size]="12"></app-icon>
                  PINNED DIRECTIVE
                </span>
                <app-badge [label]="ann.priority" [variant]="ann.priority"></app-badge>
                <span class="text-[10px] font-mono text-text-muted uppercase">Audience: {{ ann.targetAudience }}</span>
              </div>
              <h2 class="text-base sm:text-lg font-bold text-white group-hover:text-electric-light transition-colors">
                {{ ann.title }}
              </h2>
            </div>

            <!-- HR Delete Action -->
            <div *ngIf="isAdmin" class="shrink-0">
              <button
                type="button"
                (click)="deleteAnnouncement(ann.id)"
                class="p-2 rounded-lg text-text-muted hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
                title="Delete Announcement"
              >
                <app-icon name="trash-2" [size]="16"></app-icon>
              </button>
            </div>
          </div>

          <!-- Content Body -->
          <p class="text-xs sm:text-sm text-text-secondary leading-relaxed bg-surface-secondary/40 p-4 rounded-xl border border-surface-border/50">
            {{ ann.content }}
          </p>

          <!-- Footer Metadata -->
          <div class="mt-4 pt-3 border-t border-surface-border/50 flex items-center justify-between text-[11px] text-text-muted font-mono">
            <span>Posted by {{ ann.publishedByName }}</span>
            <span>{{ ann.publishedAt | date:'mediumDate' }} at {{ ann.publishedAt | date:'shortTime' }}</span>
          </div>
        </div>

        <div *ngIf="announcements.length === 0" class="glass-panel py-16 text-center text-xs text-text-muted">
          No announcements published yet.
        </div>
      </div>

      <!-- Publish Announcement Modal (HR Only) -->
      <app-modal
        [isOpen]="isPublishModalOpen"
        title="Broadcast Announcement"
        subtitle="Post an official directive with push notification dispatch"
        (close)="isPublishModalOpen = false"
      >
        <form (ngSubmit)="publishForm()" class="space-y-4 text-xs">
          <div>
            <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
              Announcement Title *
            </label>
            <input
              type="text"
              [(ngModel)]="formData.title"
              name="title"
              required
              placeholder="e.g. Q4 Studio Showcase & Client Red Carpet"
              class="input-field"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select [(ngModel)]="formData.priority" name="priority" class="input-field">
                <option value="Normal">Normal Notice</option>
                <option value="Important">Important Update</option>
                <option value="Urgent">Urgent Action Required</option>
              </select>
            </div>

            <div>
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
                Target Team
              </label>
              <select [(ngModel)]="formData.targetAudience" name="targetAudience" class="input-field">
                <option value="all">All Studio Team Members</option>
                <option value="creative">Creative Suites (Video/3D/Design)</option>
                <option value="marketing">Marketing & Production</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
              Announcement Body *
            </label>
            <textarea
              [(ngModel)]="formData.content"
              name="content"
              rows="5"
              required
              placeholder="Write the full studio briefing..."
              class="input-field"
            ></textarea>
          </div>

          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              id="pinned"
              [(ngModel)]="formData.pinned"
              name="pinned"
              class="rounded bg-surface-secondary border-surface-border text-electric focus:ring-0 cursor-pointer"
            />
            <label for="pinned" class="text-text-secondary font-medium cursor-pointer">
              Pin to top of employee dashboard
            </label>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-surface-border">
            <button
              type="button"
              (click)="isPublishModalOpen = false"
              class="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn-primary text-xs"
            >
              Publish & Broadcast
            </button>
          </div>
        </form>
      </app-modal>
    </div>
  `
})
export class AnnouncementsComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isAdmin = false;
  announcements: Announcement[] = [];

  isPublishModalOpen = false;
  formData = {
    title: '',
    content: '',
    priority: 'Normal' as Announcement['priority'],
    pinned: false,
    targetAudience: 'all' as Announcement['targetAudience']
  };

  private subs: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private announcementService: AnnouncementService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.subs.push(
      this.authService.currentUser$.subscribe(u => {
        this.currentUser = u;
        this.isAdmin = u?.role === 'admin';
      }),
      this.announcementService.getAnnouncements().subscribe(list => {
        this.announcements = [...list].sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        });
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  publishForm(): void {
    if (!this.currentUser) return;
    if (!this.formData.title.trim() || !this.formData.content.trim()) {
      this.toastService.error('Please enter announcement title and content.');
      return;
    }

    this.announcementService.publishAnnouncement(this.currentUser, {
      title: this.formData.title,
      content: this.formData.content,
      priority: this.formData.priority,
      pinned: this.formData.pinned,
      targetAudience: this.formData.targetAudience
    });

    this.isPublishModalOpen = false;
    this.formData = {
      title: '',
      content: '',
      priority: 'Normal',
      pinned: false,
      targetAudience: 'all'
    };
    this.toastService.success('Announcement broadcasted to studio team!');
  }

  deleteAnnouncement(id: string): void {
    if (confirm('Delete this announcement?')) {
      this.announcementService.deleteAnnouncement(id);
      this.toastService.info('Announcement deleted.');
    }
  }
}
