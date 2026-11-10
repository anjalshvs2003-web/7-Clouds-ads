import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { ToastService } from '../../core/services/toast.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import {
  User,
  CompanyHoliday,
  LeaveRequest,
  TaskItem,
  Announcement
} from '../../core/models';
import { getTodayDateString } from '../../core/services/mock-data';
import { Subscription } from 'rxjs';

interface CalendarDay {
  date: Date;
  dateStr: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: {
    type: 'holiday' | 'leave' | 'task' | 'announcement';
    title: string;
    details?: string;
  }[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, ModalComponent],
  template: `
    <div class="space-y-6">
      <!-- Title & Month Switcher Bar -->
      <div class="glass-panel p-6 sm:p-8 relative overflow-hidden">
        <div class="absolute -right-20 -top-20 w-80 h-80 bg-electric/15 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="px-2.5 py-0.5 rounded-full bg-electric/20 text-electric-light font-mono text-[10px] font-bold uppercase tracking-wider">
                Studio Timeline
              </span>
              <span class="text-text-muted">•</span>
              <span class="text-xs font-mono text-text-muted">Master Production & Absence Schedule</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Company Calendar
            </h1>
            <p class="text-xs sm:text-sm text-text-secondary mt-1">
              Synchronized view of approved creative leaves, task deadlines, studio holidays and milestones.
            </p>
          </div>

          <!-- Month Controls & Add Holiday (HR) -->
          <div class="flex items-center gap-3 flex-wrap">
            <div class="flex items-center bg-surface-secondary rounded-xl border border-surface-border p-1">
              <button
                type="button"
                (click)="prevMonth()"
                class="p-2 rounded-lg hover:bg-white/5 text-text-muted hover:text-white transition-colors cursor-pointer"
              >
                <app-icon name="arrow-left" [size]="14"></app-icon>
              </button>
              <span class="px-4 py-1 text-xs font-bold text-white font-mono min-w-[130px] text-center">
                {{ currentMonthName }} {{ currentYear }}
              </span>
              <button
                type="button"
                (click)="nextMonth()"
                class="p-2 rounded-lg hover:bg-white/5 text-text-muted hover:text-white transition-colors cursor-pointer"
              >
                <app-icon name="arrow-right" [size]="14"></app-icon>
              </button>
            </div>

            <button
              *ngIf="isAdmin"
              (click)="isHolidayModalOpen = true"
              class="btn-primary py-2 px-3 text-xs font-semibold cursor-pointer"
            >
              <app-icon name="plus" [size]="14"></app-icon>
              <span>Add Holiday</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Calendar Legend & Filter Keys -->
      <div class="glass-panel p-3.5 flex items-center justify-between text-xs overflow-x-auto gap-4">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-violet-400"></span>
            <span class="text-text-secondary font-mono text-[11px]">Studio Holiday</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span class="text-text-secondary font-mono text-[11px]">Approved Leave</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-electric"></span>
            <span class="text-text-secondary font-mono text-[11px]">Task Deadline</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span class="text-text-secondary font-mono text-[11px]">Announcement</span>
          </div>
        </div>

        <button
          type="button"
          (click)="goToToday()"
          class="btn-ghost text-xs text-electric hover:underline font-mono"
        >
          Jump to Today
        </button>
      </div>

      <!-- Calendar Grid -->
      <div class="glass-panel overflow-hidden">
        <!-- Weekday Headers -->
        <div class="grid grid-cols-7 bg-surface-secondary/70 border-b border-surface-border text-center text-[11px] font-mono font-bold text-text-muted uppercase py-3">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        <!-- Days Grid -->
        <div class="grid grid-cols-7 divide-x divide-y divide-surface-border">
          <div
            *ngFor="let day of calendarDays"
            class="min-h-[110px] p-2 transition-colors relative flex flex-col justify-between"
            [ngClass]="{
              'bg-surface/30 text-text-muted': !day.isCurrentMonth,
              'bg-surface/90 hover:bg-surface-secondary/40': day.isCurrentMonth,
              'ring-1 ring-inset ring-electric bg-electric/5': day.isToday
            }"
          >
            <!-- Day Number -->
            <div class="flex items-center justify-between">
              <span
                class="font-mono text-xs font-semibold px-1.5 py-0.5 rounded-md"
                [ngClass]="day.isToday ? 'bg-electric text-white font-bold shadow-glow-sm' : 'text-text-secondary'"
              >
                {{ day.dayNumber }}
              </span>
              <span *ngIf="day.isToday" class="text-[9px] font-mono text-electric font-bold uppercase">Today</span>
            </div>

            <!-- Event Chips -->
            <div class="space-y-1 mt-1 flex-1 overflow-y-auto max-h-[80px]">
              <div
                *ngFor="let ev of day.events"
                class="px-1.5 py-0.5 rounded text-[10px] truncate cursor-pointer font-medium transition-all"
                [ngClass]="getEventChipClass(ev.type)"
                [title]="ev.title + (ev.details ? ' - ' + ev.details : '')"
              >
                {{ ev.title }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Company Holiday Modal (HR Only) -->
      <app-modal
        [isOpen]="isHolidayModalOpen"
        title="Add Company Studio Holiday"
        subtitle="Manage official non-working studio days"
        (close)="isHolidayModalOpen = false"
      >
        <form (ngSubmit)="saveHolidayForm()" class="space-y-4 text-xs">
          <div>
            <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
              Holiday Title *
            </label>
            <input
              type="text"
              [(ngModel)]="holidayForm.title"
              name="title"
              required
              placeholder="e.g. Mid-Summer Creative Retreat"
              class="input-field"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
                Date *
              </label>
              <input
                type="date"
                [(ngModel)]="holidayForm.date"
                name="date"
                required
                class="input-field font-mono"
              />
            </div>

            <div>
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
                Holiday Type
              </label>
              <select [(ngModel)]="holidayForm.type" name="type" class="input-field">
                <option value="Studio Holiday">Studio Holiday</option>
                <option value="National">National Holiday</option>
                <option value="Special Event">Special Studio Event</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
              Description / Notes
            </label>
            <textarea
              [(ngModel)]="holidayForm.description"
              name="description"
              rows="3"
              placeholder="Details on studio closure, lab experiments or off-site schedule..."
              class="input-field"
            ></textarea>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-surface-border">
            <button
              type="button"
              (click)="isHolidayModalOpen = false"
              class="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn-primary text-xs"
            >
              Save Holiday
            </button>
          </div>
        </form>
      </app-modal>
    </div>
  `
})
export class CalendarComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isAdmin = false;

  currentDate = new Date();
  currentMonthName = '';
  currentYear = 2026;
  calendarDays: CalendarDay[] = [];

  holidays: CompanyHoliday[] = [];
  leaves: LeaveRequest[] = [];
  tasks: TaskItem[] = [];
  announcements: Announcement[] = [];

  isHolidayModalOpen = false;
  holidayForm = {
    title: '',
    date: getTodayDateString(),
    type: 'Studio Holiday' as CompanyHoliday['type'],
    description: ''
  };

  private subs: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.subs.push(
      this.authService.currentUser$.subscribe(u => {
        this.currentUser = u;
        this.isAdmin = u?.role === 'admin';
      }),
      this.dataService.getHolidays().subscribe(h => {
        this.holidays = h;
        this.buildCalendar();
      }),
      this.dataService.getLeaves().subscribe(l => {
        this.leaves = l.filter(req => req.status === 'Approved');
        this.buildCalendar();
      }),
      this.dataService.getTasks().subscribe(t => {
        this.tasks = t;
        this.buildCalendar();
      }),
      this.dataService.getAnnouncements().subscribe(a => {
        this.announcements = a;
        this.buildCalendar();
      })
    );

    this.updateMonthLabels();
    this.buildCalendar();
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  updateMonthLabels(): void {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    this.currentMonthName = monthNames[this.currentDate.getMonth()];
    this.currentYear = this.currentDate.getFullYear();
  }

  prevMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.updateMonthLabels();
    this.buildCalendar();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.updateMonthLabels();
    this.buildCalendar();
  }

  goToToday(): void {
    this.currentDate = new Date();
    this.updateMonthLabels();
    this.buildCalendar();
  }

  buildCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const todayStr = getTodayDateString();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    const lastDayOfPrevMonth = new Date(year, month, 0).getDate();

    const days: CalendarDay[] = [];

    // Previous month tail days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = lastDayOfPrevMonth - i;
      const d = new Date(year, month - 1, dayNum);
      const dateStr = this.formatDate(d);
      days.push({
        date: d,
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        events: this.getEventsForDate(dateStr)
      });
    }

    // Current month days
    for (let i = 1; i <= lastDayOfMonth; i++) {
      const d = new Date(year, month, i);
      const dateStr = this.formatDate(d);
      days.push({
        date: d,
        dateStr,
        dayNumber: i,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        events: this.getEventsForDate(dateStr)
      });
    }

    // Next month head days (fill 35 or 42 grid cells)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      const dateStr = this.formatDate(d);
      days.push({
        date: d,
        dateStr,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        events: this.getEventsForDate(dateStr)
      });
    }

    this.calendarDays = days;
  }

  private formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getEventsForDate(dateStr: string) {
    const events: CalendarDay['events'] = [];

    // Holidays
    this.holidays.forEach(h => {
      if (h.date === dateStr) {
        events.push({ type: 'holiday', title: `🎉 ${h.title}`, details: h.description });
      }
    });

    // Approved Leaves
    this.leaves.forEach(l => {
      if (dateStr >= l.startDate && dateStr <= l.endDate) {
        events.push({
          type: 'leave',
          title: `🌴 ${l.employeeName} (${l.leaveType})`,
          details: l.reason
        });
      }
    });

    // Task Deadlines
    this.tasks.forEach(t => {
      if (t.dueDate === dateStr) {
        events.push({
          type: 'task',
          title: `⚡ Due: ${t.title}`,
          details: `${t.projectName} (${t.assignedToName})`
        });
      }
    });

    return events;
  }

  getEventChipClass(type: CalendarDay['events'][0]['type']): string {
    switch (type) {
      case 'holiday':
        return 'bg-violet-500/20 text-violet-300 border border-violet-500/30';
      case 'leave':
        return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
      case 'task':
        return 'bg-electric/20 text-electric-light border border-electric/30';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
    }
  }

  saveHolidayForm(): void {
    if (!this.holidayForm.title.trim()) {
      this.toastService.error('Please enter a holiday title.');
      return;
    }

    const newHoliday: CompanyHoliday = {
      id: `hol-${Date.now()}`,
      title: this.holidayForm.title,
      date: this.holidayForm.date,
      type: this.holidayForm.type,
      description: this.holidayForm.description
    };

    this.dataService.saveHoliday(newHoliday);
    this.isHolidayModalOpen = false;
    this.toastService.success(`Added holiday "${newHoliday.title}" to studio calendar.`);
  }
}
