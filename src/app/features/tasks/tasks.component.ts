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
import { getTodayDateString } from '../../core/services/mock-data';
import { Subscription } from 'rxjs';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, BadgeComponent, ModalComponent],
  template: `
    <div class="space-y-6">
      <!-- Top Title & Quick Actions -->
      <div class="glass-panel p-6 sm:p-8 relative overflow-hidden">
        <div class="absolute -right-20 -top-20 w-80 h-80 bg-electric/15 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="px-2.5 py-0.5 rounded-full bg-electric/20 text-electric-light font-mono text-[10px] font-bold uppercase tracking-wider">
                Linear-Grade Velocity
              </span>
              <span class="text-text-muted">•</span>
              <span class="text-xs font-mono text-text-muted">{{ currentDateStr }}</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Creative Task Board & Timer
            </h1>
            <p class="text-xs sm:text-sm text-text-secondary mt-1">
              Precision deadline tracking, integrated live task timers and estimated vs actual work allocation.
            </p>
          </div>

          <button
            (click)="openCreateTaskModal()"
            class="btn-primary py-2.5 px-4 text-xs font-semibold self-start sm:self-auto cursor-pointer"
          >
            <app-icon name="plus" [size]="16"></app-icon>
            <span>Create New Task</span>
          </button>
        </div>
      </div>

      <!-- Task Metrics Row -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="glass-panel p-4">
          <div class="text-[10px] font-mono uppercase text-text-muted">Due Today</div>
          <div class="text-2xl font-bold text-white font-mono mt-1">{{ categorizedStats.todayTasks.length }}</div>
          <div class="text-[10px] text-text-secondary mt-0.5">High focus priorities</div>
        </div>

        <div class="glass-panel p-4">
          <div class="text-[10px] font-mono uppercase text-rose-400">Overdue</div>
          <div class="text-2xl font-bold text-rose-400 font-mono mt-1">{{ categorizedStats.overdueTasks.length }}</div>
          <div class="text-[10px] text-text-muted mt-0.5">Needs immediate push</div>
        </div>

        <div class="glass-panel p-4">
          <div class="text-[10px] font-mono uppercase text-emerald-400">Completed</div>
          <div class="text-2xl font-bold text-emerald-400 font-mono mt-1">{{ categorizedStats.completedTasks.length }}</div>
          <div class="text-[10px] text-text-muted mt-0.5">{{ categorizedStats.completionRate }}% sprint rate</div>
        </div>

        <div class="glass-panel p-4">
          <div class="text-[10px] font-mono uppercase text-electric">Hours (Est vs Act)</div>
          <div class="text-xl font-bold text-white font-mono mt-1">
            {{ categorizedStats.totalAct }}h <span class="text-text-muted text-sm font-normal">/ {{ categorizedStats.totalEst }}h</span>
          </div>
          <div class="text-[10px] text-text-muted mt-0.5">Studio production time</div>
        </div>
      </div>

      <!-- Filters & View Switcher -->
      <div class="glass-panel p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <!-- Filter Tabs -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
          <button
            type="button"
            (click)="activeTab = 'ALL'"
            class="px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap"
            [ngClass]="activeTab === 'ALL' ? 'bg-electric text-white shadow-glow-sm' : 'text-text-muted hover:text-white hover:bg-white/5'"
          >
            All ({{ allFilteredTasks.length }})
          </button>

          <button
            type="button"
            (click)="activeTab = 'TODAY'"
            class="px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap"
            [ngClass]="activeTab === 'TODAY' ? 'bg-electric text-white shadow-glow-sm' : 'text-text-muted hover:text-white hover:bg-white/5'"
          >
            Due Today ({{ categorizedStats.todayTasks.length }})
          </button>

          <button
            type="button"
            (click)="activeTab = 'OVERDUE'"
            class="px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap"
            [ngClass]="activeTab === 'OVERDUE' ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 'text-text-muted hover:text-white hover:bg-white/5'"
          >
            Overdue ({{ categorizedStats.overdueTasks.length }})
          </button>

          <button
            type="button"
            (click)="activeTab = 'COMPLETED'"
            class="px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap"
            [ngClass]="activeTab === 'COMPLETED' ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'text-text-muted hover:text-white hover:bg-white/5'"
          >
            Completed ({{ categorizedStats.completedTasks.length }})
          </button>
        </div>

        <!-- Search & Priority filter -->
        <div class="flex items-center gap-2">
          <div class="relative">
            <app-icon name="search" [size]="14" extraClass="absolute left-3 top-2.5 text-text-muted"></app-icon>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Search title, project..."
              class="input-field pl-8 py-1.5 text-xs w-48 sm:w-60"
            />
          </div>

          <select [(ngModel)]="priorityFilter" class="input-field py-1.5 text-xs w-auto">
            <option value="ALL">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      <!-- Tasks Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          *ngFor="let task of displayedTasks"
          class="glass-panel p-5 flex flex-col justify-between hover:border-surface-border-bright transition-all group relative overflow-hidden"
          [ngClass]="task.timerRunning ? 'ring-1 ring-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]' : ''"
        >
          <!-- Active Timer Glow bar on top -->
          <div *ngIf="task.timerRunning" class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-electric animate-pulse"></div>

          <div>
            <!-- Top Tags & Priority -->
            <div class="flex items-center justify-between gap-2 mb-2.5">
              <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surface-secondary text-text-muted truncate max-w-[150px]">
                {{ task.projectName }}
              </span>
              <div class="flex items-center gap-1.5 shrink-0">
                <app-badge [label]="task.priority" [variant]="task.priority"></app-badge>
                <app-badge [label]="task.status" [variant]="task.status"></app-badge>
              </div>
            </div>

            <!-- Task Title -->
            <h3 class="text-sm font-bold text-white group-hover:text-electric-light transition-colors mb-1.5">
              {{ task.title }}
            </h3>

            <!-- Task Description -->
            <p class="text-xs text-text-secondary line-clamp-2 leading-relaxed mb-4">
              {{ task.description }}
            </p>

            <!-- Reference Link if any -->
            <div *ngIf="task.referenceUrl" class="mb-4">
              <a
                [href]="task.referenceUrl"
                target="_blank"
                rel="noopener"
                class="inline-flex items-center gap-1 text-[11px] text-electric hover:underline font-mono truncate max-w-full"
              >
                <span>🔗 {{ task.referenceUrl }}</span>
              </a>
            </div>
          </div>

          <!-- Bottom Meta & Actions -->
          <div class="pt-3 border-t border-surface-border/60 space-y-3">
            <!-- Progress Slider / Bar -->
            <div>
              <div class="flex items-center justify-between text-[11px] mb-1 font-mono">
                <span class="text-text-muted">Completion</span>
                <span class="text-white font-semibold">{{ task.completionPercentage }}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                [ngModel]="task.completionPercentage"
                (ngModelChange)="updateProgress(task, $event)"
                class="w-full h-1.5 bg-surface-secondary rounded-lg appearance-none cursor-pointer accent-electric"
              />
            </div>

            <!-- Assigned Employee & Timer Action -->
            <div class="flex items-center justify-between gap-2 text-xs">
              <div class="flex items-center gap-2 min-w-0">
                <img
                  [src]="task.assignedToAvatar"
                  [alt]="task.assignedToName"
                  class="w-6 h-6 rounded-full object-cover shrink-0"
                  [title]="task.assignedToName"
                />
                <span class="text-[11px] text-text-secondary truncate">{{ task.assignedToName }}</span>
              </div>

              <!-- Action Controls -->
              <div class="flex items-center gap-1.5 shrink-0">
                <!-- Task Timer Button -->
                <button
                  *ngIf="task.status !== 'Completed'"
                  type="button"
                  (click)="toggleTimer(task)"
                  class="p-2 rounded-xl text-xs font-mono transition-all flex items-center gap-1 cursor-pointer"
                  [ngClass]="task.timerRunning ? 'bg-amber-500 text-black font-bold animate-pulse' : 'bg-surface-secondary hover:bg-electric text-text-muted hover:text-white'"
                  [title]="task.timerRunning ? 'Pause Task Timer' : 'Start Task Timer'"
                >
                  <app-icon [name]="task.timerRunning ? 'pause' : 'play'" [size]="13"></app-icon>
                  <span>{{ task.actualHours }}h</span>
                </button>

                <!-- Mark Complete -->
                <button
                  *ngIf="task.status !== 'Completed'"
                  type="button"
                  (click)="markCompleted(task)"
                  class="p-2 rounded-xl bg-surface-secondary hover:bg-emerald-500 text-text-muted hover:text-white transition-all cursor-pointer"
                  title="Mark Completed"
                >
                  <app-icon name="check" [size]="14"></app-icon>
                </button>

                <!-- Edit Task Modal Trigger -->
                <button
                  type="button"
                  (click)="openEditModal(task)"
                  class="p-2 rounded-xl bg-surface-secondary hover:bg-surface-tertiary text-text-muted hover:text-white transition-all cursor-pointer"
                  title="Edit Task Details"
                >
                  <app-icon name="edit" [size]="13"></app-icon>
                </button>
              </div>
            </div>

            <!-- Due Date Badge -->
            <div class="flex items-center justify-between text-[10px] text-text-muted font-mono pt-1">
              <span>Est: {{ task.estimatedHours }} hrs</span>
              <span [ngClass]="isTaskOverdue(task) ? 'text-rose-400 font-bold' : 'text-text-muted'">
                Due: {{ task.dueDate }}
              </span>
            </div>
          </div>
        </div>

        <div *ngIf="displayedTasks.length === 0" class="col-span-full py-16 text-center text-xs text-text-muted glass-panel">
          No tasks found matching this criteria. Create a new task or adjust filters.
        </div>
      </div>

      <!-- Create / Edit Task Modal -->
      <app-modal
        [isOpen]="isTaskModalOpen"
        [title]="editingTaskId ? 'Edit Creative Task' : 'Create New Creative Task'"
        subtitle="Set deliverables, estimated hours, deadlines and assignments"
        (close)="isTaskModalOpen = false"
      >
        <form (ngSubmit)="saveTaskForm()" class="space-y-4 text-xs">
          <div>
            <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              [(ngModel)]="taskFormData.title"
              name="title"
              required
              placeholder="e.g. Master Grade & Export 4K ProRes"
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
                [(ngModel)]="taskFormData.projectName"
                name="projectName"
                required
                placeholder="e.g. Nike Cyber Campaign"
                class="input-field"
              />
            </div>

            <div>
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
                Assign To Creative *
              </label>
              <select
                [(ngModel)]="taskFormData.assignedTo"
                name="assignedTo"
                required
                class="input-field"
              >
                <option *ngFor="let u of allUsers" [value]="u.id">
                  {{ u.name }} ({{ u.designation }})
                </option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
              Deliverable Description
            </label>
            <textarea
              [(ngModel)]="taskFormData.description"
              name="description"
              rows="3"
              placeholder="Specify requirements, dimensions, LUTs, render passes..."
              class="input-field"
            ></textarea>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select [(ngModel)]="taskFormData.priority" name="priority" class="input-field">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
                Estimated Hours
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                [(ngModel)]="taskFormData.estimatedHours"
                name="estimatedHours"
                class="input-field font-mono"
              />
            </div>

            <div>
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
                Deadline Date
              </label>
              <input
                type="date"
                [(ngModel)]="taskFormData.dueDate"
                name="dueDate"
                required
                class="input-field font-mono"
              />
            </div>
          </div>

          <div>
            <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
              Reference Asset URL (Frame.io, Figma, Drive)
            </label>
            <input
              type="url"
              [(ngModel)]="taskFormData.referenceUrl"
              name="referenceUrl"
              placeholder="https://figma.com/file/..."
              class="input-field"
            />
          </div>

          <div class="flex items-center justify-between pt-3 border-t border-surface-border">
            <button
              *ngIf="editingTaskId"
              type="button"
              (click)="deleteTask()"
              class="text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1 cursor-pointer"
            >
              <app-icon name="trash-2" [size]="14"></app-icon>
              <span>Delete Task</span>
            </button>
            <div *ngIf="!editingTaskId"></div>

            <div class="flex items-center gap-2">
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
                {{ editingTaskId ? 'Update Task' : 'Create Task' }}
              </button>
            </div>
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
  allUsers: User[] = [];
  currentDateStr = '';

  activeTab: 'ALL' | 'TODAY' | 'OVERDUE' | 'COMPLETED' = 'ALL';
  searchQuery = '';
  priorityFilter = 'ALL';

  categorizedStats = {
    todayTasks: [] as TaskItem[],
    overdueTasks: [] as TaskItem[],
    upcomingTasks: [] as TaskItem[],
    completedTasks: [] as TaskItem[],
    totalEst: 0,
    totalAct: 0,
    completionRate: 0
  };

  // Modal State
  isTaskModalOpen = false;
  editingTaskId: string | null = null;
  taskFormData = {
    title: '',
    projectName: '',
    description: '',
    assignedTo: '',
    dueDate: getTodayDateString(),
    estimatedHours: 4,
    priority: 'Medium' as TaskPriority,
    referenceUrl: ''
  };

  private subs: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private taskService: TaskService,
    private dataService: DataService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const now = new Date();
    this.currentDateStr = now.toLocaleDateString([], {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    this.subs.push(
      this.authService.currentUser$.subscribe(u => {
        this.currentUser = u;
        this.isAdmin = u?.role === 'admin';
      }),
      this.dataService.getUsers().subscribe(users => {
        this.allUsers = users.filter(u => u.status === 'active');
      }),
      this.taskService.getAllTasks().subscribe(tasks => {
        this.allTasks = tasks;
        this.categorizedStats = this.taskService.categorizeTasks(tasks);
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  get allFilteredTasks(): TaskItem[] {
    let list = [...this.allTasks];

    // If regular employee, show tasks assigned to them
    if (!this.isAdmin && this.currentUser) {
      list = list.filter(t => t.assignedTo === this.currentUser!.id);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(
        t => t.title.toLowerCase().includes(q) || t.projectName.toLowerCase().includes(q)
      );
    }

    if (this.priorityFilter !== 'ALL') {
      list = list.filter(t => t.priority === this.priorityFilter);
    }

    return list;
  }

  get displayedTasks(): TaskItem[] {
    const today = getTodayDateString();
    let list = this.allFilteredTasks;

    if (this.activeTab === 'TODAY') {
      list = list.filter(t => t.dueDate === today && t.status !== 'Completed');
    } else if (this.activeTab === 'OVERDUE') {
      list = list.filter(t => t.dueDate < today && t.status !== 'Completed');
    } else if (this.activeTab === 'COMPLETED') {
      list = list.filter(t => t.status === 'Completed');
    }

    return list;
  }

  isTaskOverdue(task: TaskItem): boolean {
    const today = getTodayDateString();
    return task.dueDate < today && task.status !== 'Completed';
  }

  toggleTimer(task: TaskItem): void {
    if (task.timerRunning) {
      this.taskService.pauseTimer(task.id);
      this.toastService.info(`Timer paused (${task.actualHours} hrs logged)`);
    } else {
      this.taskService.startTimer(task.id);
      this.toastService.success(`Live task timer running for "${task.title}"`);
    }
  }

  markCompleted(task: TaskItem): void {
    this.taskService.updateTask(task.id, {
      status: 'Completed',
      completionPercentage: 100
    });
    this.toastService.success(`Task "${task.title}" completed!`);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
  }

  updateProgress(task: TaskItem, percentage: number): void {
    const status: TaskStatus = percentage === 100 ? 'Completed' : (percentage > 0 ? 'In Progress' : 'Pending');
    this.taskService.updateTask(task.id, {
      completionPercentage: percentage,
      status: status
    });
  }

  openCreateTaskModal(): void {
    this.editingTaskId = null;
    this.taskFormData = {
      title: '',
      projectName: '',
      description: '',
      assignedTo: this.allUsers[0]?.id || '',
      dueDate: getTodayDateString(),
      estimatedHours: 4,
      priority: 'Medium',
      referenceUrl: ''
    };
    this.isTaskModalOpen = true;
  }

  openEditModal(task: TaskItem): void {
    this.editingTaskId = task.id;
    this.taskFormData = {
      title: task.title,
      projectName: task.projectName,
      description: task.description,
      assignedTo: task.assignedTo,
      dueDate: task.dueDate,
      estimatedHours: task.estimatedHours,
      priority: task.priority,
      referenceUrl: task.referenceUrl || ''
    };
    this.isTaskModalOpen = true;
  }

  saveTaskForm(): void {
    if (!this.currentUser) return;
    if (!this.taskFormData.title || !this.taskFormData.projectName) {
      this.toastService.error('Please enter a task title and project name.');
      return;
    }

    const assignedUser = this.allUsers.find(u => u.id === this.taskFormData.assignedTo);
    if (!assignedUser) {
      this.toastService.error('Please select an assigned creative.');
      return;
    }

    if (this.editingTaskId) {
      this.taskService.updateTask(this.editingTaskId, {
        title: this.taskFormData.title,
        projectName: this.taskFormData.projectName,
        description: this.taskFormData.description,
        assignedTo: assignedUser.id,
        assignedToName: assignedUser.name,
        assignedToAvatar: assignedUser.avatar,
        dueDate: this.taskFormData.dueDate,
        estimatedHours: this.taskFormData.estimatedHours,
        priority: this.taskFormData.priority,
        referenceUrl: this.taskFormData.referenceUrl
      });
      this.toastService.success('Task details updated.');
    } else {
      this.taskService.createTask(this.currentUser, {
        title: this.taskFormData.title,
        projectName: this.taskFormData.projectName,
        description: this.taskFormData.description,
        assignedTo: assignedUser.id,
        assignedToName: assignedUser.name,
        assignedToAvatar: assignedUser.avatar,
        dueDate: this.taskFormData.dueDate,
        estimatedHours: this.taskFormData.estimatedHours,
        priority: this.taskFormData.priority,
        referenceUrl: this.taskFormData.referenceUrl
      });
      this.toastService.success(`Created task and assigned to ${assignedUser.name}.`);
    }

    this.isTaskModalOpen = false;
  }

  deleteTask(): void {
    if (!this.editingTaskId) return;
    if (confirm('Are you sure you want to remove this task?')) {
      this.taskService.deleteTask(this.editingTaskId);
      this.isTaskModalOpen = false;
      this.toastService.info('Task removed.');
    }
  }
}
