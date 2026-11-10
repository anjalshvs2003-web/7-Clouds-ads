import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { TaskService } from '../../core/services/task.service';
import { DataService } from '../../core/services/data.service';
import { ToastService } from '../../core/services/toast.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import {
  User,
  TaskItem,
  TaskPriority,
  TaskStatus
} from '../../core/models';
import { getTodayDateStringIST, formatDateTimeIST } from '../../core/services/ist-date.utils';
import { Subscription } from 'rxjs';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, BadgeComponent, ModalComponent],
  template: `
    <div class="space-y-6 max-w-6xl mx-auto">
      <!-- Title & Create Bar -->
      <div class="glass-panel p-6 sm:p-8 relative overflow-hidden">
        <div class="absolute -right-20 -top-20 w-80 h-80 bg-electric/15 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="px-2.5 py-0.5 rounded-full bg-electric/20 text-electric-light font-mono text-[10px] font-bold uppercase tracking-wider">
                Simplified Task System
              </span>
              <span class="text-text-muted">•</span>
              <span class="text-xs font-mono text-text-muted">{{ displayedTasks.length }} Tasks</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Task Management
            </h1>
            <p class="text-xs sm:text-sm text-text-secondary mt-1">
              Clickable status buttons for instant deliverable updates without complex menus.
            </p>
          </div>

          <button
            *ngIf="isAdmin"
            (click)="openCreateTaskModal()"
            class="btn-primary py-2.5 px-4 text-xs font-semibold self-start sm:self-auto cursor-pointer"
          >
            <app-icon name="plus" [size]="16"></app-icon>
            <span>Assign New Task</span>
          </button>
        </div>
      </div>

      <!-- Quick Filter Tabs -->
      <div class="glass-panel p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            (click)="activeTab = 'ALL'"
            class="px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap"
            [ngClass]="activeTab === 'ALL' ? 'bg-electric text-white shadow-glow-sm' : 'text-text-muted hover:text-white hover:bg-white/5'"
          >
            All Tasks
          </button>
          <button
            type="button"
            (click)="activeTab = 'IN_PROGRESS'"
            class="px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap"
            [ngClass]="activeTab === 'IN_PROGRESS' ? 'bg-blue-600 text-white shadow-glow-sm' : 'text-text-muted hover:text-white hover:bg-white/5'"
          >
            In Progress
          </button>
          <button
            type="button"
            (click)="activeTab = 'COMPLETED'"
            class="px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap"
            [ngClass]="activeTab === 'COMPLETED' ? 'bg-emerald-600 text-white shadow-glow-sm' : 'text-text-muted hover:text-white hover:bg-white/5'"
          >
            Completed
          </button>
          <button
            type="button"
            (click)="activeTab = 'NOT_STARTED'"
            class="px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap"
            [ngClass]="activeTab === 'NOT_STARTED' ? 'bg-slate-700 text-white shadow-glow-sm' : 'text-text-muted hover:text-white hover:bg-white/5'"
          >
            Not Started
          </button>
        </div>

        <div class="flex items-center gap-2">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search task title, project..."
            class="input-field py-1.5 px-3 text-xs w-48 sm:w-60"
          />
        </div>
      </div>

      <!-- TASKS LIST: With [ Not Started ] [ In Progress ] [ Completed ] Clickable Buttons -->
      <div class="space-y-4">
        <div
          *ngFor="let task of displayedTasks"
          class="glass-panel p-5 sm:p-6 hover:border-surface-border-bright transition-all space-y-4"
          [ngClass]="{
            'border-emerald-500/30': task.status === 'Completed',
            'border-blue-500/30': task.status === 'In Progress'
          }"
        >
          <!-- Task Header -->
          <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div class="space-y-1 min-w-0 flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surface-secondary text-text-muted">
                  {{ task.projectName }}
                </span>
                <app-badge [label]="task.priority" [variant]="task.priority"></app-badge>
                <span class="text-[10px] font-mono text-text-muted">Assigned: {{ task.createdDate }}</span>
                <span class="text-[10px] font-mono font-bold" [ngClass]="isOverdue(task) ? 'text-rose-400' : 'text-text-muted'">
                  Deadline: {{ task.dueDate }}
                </span>
              </div>

              <h2 class="text-base sm:text-lg font-bold text-white leading-snug">
                {{ task.title }}
              </h2>
            </div>

            <!-- Assigned Employee Avatar & Name -->
            <div class="flex items-center gap-2 shrink-0 bg-surface-secondary/60 px-3 py-1.5 rounded-xl border border-surface-border">
              <img
                [src]="task.assignedToAvatar"
                [alt]="task.assignedToName"
                class="w-6 h-6 rounded-full object-cover shrink-0"
              />
              <span class="text-xs font-semibold text-white">{{ task.assignedToName }}</span>
            </div>
          </div>

          <!-- Description -->
          <p *ngIf="task.description" class="text-xs text-text-secondary leading-relaxed bg-surface-secondary/40 p-3 rounded-xl border border-surface-border/50">
            {{ task.description }}
          </p>

          <!-- SIMPLIFIED CLICKABLE STATUS BUTTONS -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-surface-border/60">
            <!-- 3 Simple Status Buttons -->
            <div class="space-y-1.5">
              <span class="text-[10px] font-mono uppercase font-bold text-text-muted tracking-wider block">
                Update Status:
              </span>
              <div class="inline-flex items-center gap-2 bg-surface-secondary/80 p-1.5 rounded-2xl border border-surface-border">
                <!-- 1. NOT STARTED BUTTON -->
                <button
                  type="button"
                  (click)="changeTaskStatus(task, 'Not Started')"
                  [disabled]="!canUpdateTask(task)"
                  class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  [ngClass]="task.status === 'Not Started' || task.status === 'Pending' ? 'bg-slate-700 text-white shadow-sm ring-1 ring-slate-500' : 'text-text-muted hover:text-white hover:bg-white/5'"
                  title="Mark Not Started"
                >
                  <span class="w-2 h-2 rounded-full bg-slate-400"></span>
                  <span>Not Started</span>
                </button>

                <!-- 2. IN PROGRESS BUTTON -->
                <button
                  type="button"
                  (click)="changeTaskStatus(task, 'In Progress')"
                  [disabled]="!canUpdateTask(task)"
                  class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  [ngClass]="task.status === 'In Progress' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] ring-1 ring-blue-400' : 'text-text-muted hover:text-white hover:bg-white/5'"
                  title="Mark In Progress"
                >
                  <span class="w-2 h-2 rounded-full bg-blue-300 animate-pulse"></span>
                  <span>In Progress</span>
                </button>

                <!-- 3. COMPLETED BUTTON -->
                <button
                  type="button"
                  (click)="changeTaskStatus(task, 'Completed')"
                  [disabled]="!canUpdateTask(task)"
                  class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  [ngClass]="task.status === 'Completed' ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] ring-1 ring-emerald-400' : 'text-text-muted hover:text-white hover:bg-white/5'"
                  title="Mark Completed"
                >
                  <app-icon name="check" [size]="13"></app-icon>
                  <span>Completed</span>
                </button>
              </div>
            </div>

            <!-- Completion Date & Admin Actions -->
            <div class="flex items-center gap-3 self-end sm:self-center">
              <div *ngIf="task.completedAt" class="text-right text-[11px] font-mono text-emerald-400">
                <span class="text-text-muted block text-[10px]">Completed On:</span>
                <span>{{ formatCompletedDate(task.completedAt) }}</span>
              </div>

              <!-- Host / HR Delete Option -->
              <button
                *ngIf="isAdmin"
                type="button"
                (click)="deleteTask(task.id)"
                class="p-2 rounded-xl text-text-muted hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
                title="Delete Task"
              >
                <app-icon name="trash-2" [size]="14"></app-icon>
              </button>
            </div>
          </div>
        </div>

        <div *ngIf="displayedTasks.length === 0" class="glass-panel py-16 text-center text-xs text-text-muted">
          No tasks found under this filter view.
        </div>
      </div>

      <!-- Assign New Task Modal (Host & HR Admin) -->
      <app-modal
        [isOpen]="isTaskModalOpen"
        title="Assign New Task"
        subtitle="Specify deliverable title, assignee, priority and deadline"
        (close)="isTaskModalOpen = false"
      >
        <form (ngSubmit)="saveNewTask()" class="space-y-4 text-xs">
          <div>
            <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              [(ngModel)]="taskForm.title"
              name="title"
              required
              placeholder="e.g. Rough Cut Assembly for Commercial Spot"
              class="input-field"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
                Project Name *
              </label>
              <input
                type="text"
                [(ngModel)]="taskForm.projectName"
                name="projectName"
                required
                placeholder="e.g. 7 Clouds Ads"
                class="input-field"
              />
            </div>

            <div>
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
                Assign To Employee *
              </label>
              <select [(ngModel)]="taskForm.assignedTo" name="assignedTo" required class="input-field">
                <option *ngFor="let staff of staffList" [value]="staff.id">
                  {{ staff.name }} ({{ staff.designation }})
                </option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
              Short Description
            </label>
            <textarea
              [(ngModel)]="taskForm.description"
              name="description"
              rows="3"
              placeholder="Specify requirements, dimensions, LUTs, sound sync..."
              class="input-field"
            ></textarea>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select [(ngModel)]="taskForm.priority" name="priority" class="input-field">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
                Deadline Date *
              </label>
              <input
                type="date"
                [(ngModel)]="taskForm.dueDate"
                name="dueDate"
                required
                class="input-field font-mono"
              />
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-surface-border">
            <button
              type="button"
              (click)="isTaskModalOpen = false"
              class="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn-primary text-xs"
            >
              Assign Task
            </button>
          </div>
        </form>
      </app-modal>
    </div>
  `
})
export class TasksComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isAdmin = false;
  allTasks: TaskItem[] = [];
  staffList: User[] = [];

  activeTab: 'ALL' | 'IN_PROGRESS' | 'COMPLETED' | 'NOT_STARTED' = 'ALL';
  searchQuery = '';

  isTaskModalOpen = false;
  taskForm = {
    title: '',
    projectName: '7 Clouds Ads',
    description: '',
    assignedTo: '',
    dueDate: getTodayDateStringIST(),
    priority: 'Medium' as TaskPriority
  };

  private subs: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private taskService: TaskService,
    private dataService: DataService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.subs.push(
      this.authService.currentUser$.subscribe(u => {
        this.currentUser = u;
        this.isAdmin = this.authService.isAdmin();
      }),
      this.dataService.getUsers().subscribe(users => {
        this.staffList = users.filter(u => u.status === 'active');
      }),
      this.taskService.getAllTasks().subscribe(tasks => {
        this.allTasks = tasks;
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  get displayedTasks(): TaskItem[] {
    let list = [...this.allTasks];

    // If regular employee, only show tasks assigned to them
    if (!this.isAdmin && this.currentUser) {
      list = list.filter(t => t.assignedTo === this.currentUser!.id);
    }

    if (this.activeTab === 'IN_PROGRESS') {
      list = list.filter(t => t.status === 'In Progress');
    } else if (this.activeTab === 'COMPLETED') {
      list = list.filter(t => t.status === 'Completed');
    } else if (this.activeTab === 'NOT_STARTED') {
      list = list.filter(t => t.status === 'Not Started' || t.status === 'Pending');
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(
        t => t.title.toLowerCase().includes(q) || t.projectName.toLowerCase().includes(q)
      );
    }

    return list;
  }

  canUpdateTask(task: TaskItem): boolean {
    if (this.isAdmin) return true;
    return task.assignedTo === this.currentUser?.id;
  }

  isOverdue(task: TaskItem): boolean {
    const today = getTodayDateStringIST();
    return task.dueDate < today && task.status !== 'Completed';
  }

  changeTaskStatus(task: TaskItem, newStatus: 'Not Started' | 'In Progress' | 'Completed'): void {
    if (!this.currentUser) return;

    try {
      this.taskService.setTaskStatus(task.id, newStatus, this.currentUser);
      this.toastService.success(`Task status updated to [ ${newStatus} ]`);

      if (newStatus === 'Completed') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      }
    } catch (err: any) {
      this.toastService.error(err.message || 'Cannot update task');
    }
  }

  openCreateTaskModal(): void {
    this.taskForm = {
      title: '',
      projectName: '7 Clouds Ads',
      description: '',
      assignedTo: this.staffList[0]?.id || '',
      dueDate: getTodayDateStringIST(),
      priority: 'Medium'
    };
    this.isTaskModalOpen = true;
  }

  saveNewTask(): void {
    if (!this.currentUser) return;
    if (!this.taskForm.title.trim() || !this.taskForm.assignedTo) {
      this.toastService.error('Please enter a task title and assign to an employee.');
      return;
    }

    const assigned = this.staffList.find(s => s.id === this.taskForm.assignedTo);
    if (!assigned) return;

    this.taskService.createTask(this.currentUser, {
      title: this.taskForm.title,
      projectName: this.taskForm.projectName,
      description: this.taskForm.description,
      assignedTo: assigned.id,
      assignedToName: assigned.name,
      assignedToAvatar: assigned.avatar,
      dueDate: this.taskForm.dueDate,
      estimatedHours: 4,
      priority: this.taskForm.priority
    });

    this.isTaskModalOpen = false;
    this.toastService.success(`Task assigned to ${assigned.name}.`);
  }

  deleteTask(taskId: string): void {
    if (confirm('Delete this task?')) {
      this.taskService.deleteTask(taskId);
      this.toastService.info('Task deleted.');
    }
  }

  formatCompletedDate(isoStr?: string): string {
    return formatDateTimeIST(isoStr);
  }
}
