import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { ToastService } from '../../core/services/toast.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { User, UserRole, AccountStatus } from '../../core/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, BadgeComponent, ModalComponent],
  template: `
    <div class="space-y-6">
      <!-- Title & Action Bar -->
      <div class="glass-panel p-6 sm:p-8 relative overflow-hidden">
        <div class="absolute -right-20 -top-20 w-80 h-80 bg-violet/15 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                Creative Talent Directory
              </span>
              <span class="text-text-muted">•</span>
              <span class="text-xs font-mono text-text-muted">{{ users.length }} Studio Accounts</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Team & Employee Management
            </h1>
            <p class="text-xs sm:text-sm text-text-secondary mt-1">
              Add new studio talent, assign roles & designations, configure leave quotas and manage account security status.
            </p>
          </div>

          <button
            *ngIf="isAdmin"
            (click)="openAddModal()"
            class="btn-primary py-2.5 px-4 text-xs font-semibold self-start sm:self-auto cursor-pointer"
          >
            <app-icon name="plus" [size]="16"></app-icon>
            <span>Onboard New Employee</span>
          </button>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="glass-panel p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3 flex-wrap flex-1">
          <div class="relative min-w-[220px]">
            <app-icon name="search" [size]="14" extraClass="absolute left-3 top-2.5 text-text-muted"></app-icon>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Search by name, role, email..."
              class="input-field pl-8 py-1.5 text-xs"
            />
          </div>

          <select [(ngModel)]="departmentFilter" class="input-field py-1.5 text-xs w-auto">
            <option value="ALL">All Departments</option>
            <option value="Creative Post-Production">Post-Production</option>
            <option value="Visual Design">Visual Design</option>
            <option value="Motion & VFX">Motion & VFX</option>
            <option value="Growth & Marketing">Growth & Marketing</option>
            <option value="Media Production">Media Production</option>
            <option value="Content & Strategy">Content & Strategy</option>
            <option value="Management / HR">Management / HR</option>
          </select>

          <select [(ngModel)]="statusFilter" class="input-field py-1.5 text-xs w-auto">
            <option value="ALL">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Deactivated</option>
          </select>
        </div>
      </div>

      <!-- Employees Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          *ngFor="let emp of displayedUsers"
          class="glass-panel p-6 flex flex-col justify-between hover:border-surface-border-bright transition-all group relative overflow-hidden"
        >
          <!-- Status Banner if Deactivated -->
          <div *ngIf="emp.status === 'inactive'" class="absolute top-0 left-0 right-0 py-1 bg-rose-500/20 text-rose-300 text-[10px] font-mono text-center font-bold tracking-wider">
            ACCOUNT DEACTIVATED
          </div>

          <div>
            <!-- Header Profile Row -->
            <div class="flex items-start gap-4 mb-4">
              <img
                [src]="emp.avatar"
                [alt]="emp.name"
                class="w-14 h-14 rounded-2xl object-cover ring-2 ring-surface-border group-hover:ring-electric/50 transition-all shrink-0"
              />
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between gap-1">
                  <h3 class="font-bold text-white text-base truncate group-hover:text-electric-light transition-colors">
                    {{ emp.name }}
                  </h3>
                  <app-badge [label]="emp.role === 'admin' ? 'HR ADMIN' : 'EMPLOYEE'" [variant]="emp.role"></app-badge>
                </div>
                <div class="text-xs font-semibold text-text-secondary mt-0.5 truncate">{{ emp.designation }}</div>
                <div class="text-[10px] font-mono text-text-muted mt-1">{{ emp.employeeId }} · {{ emp.department }}</div>
              </div>
            </div>

            <!-- Contact & Bio Details -->
            <div class="space-y-2 py-3 border-y border-surface-border/50 text-xs">
              <div class="flex items-center justify-between text-text-secondary">
                <span class="text-text-muted">Email</span>
                <span class="font-mono text-white truncate max-w-[170px]">{{ emp.email }}</span>
              </div>
              <div class="flex items-center justify-between text-text-secondary">
                <span class="text-text-muted">Phone</span>
                <span class="font-mono text-white">{{ emp.phone }}</span>
              </div>
              <div class="flex items-center justify-between text-text-secondary">
                <span class="text-text-muted">Joined</span>
                <span class="font-mono text-white">{{ emp.joiningDate }}</span>
              </div>
            </div>

            <!-- Skills Chips -->
            <div *ngIf="emp.skills && emp.skills.length > 0" class="mt-3 flex flex-wrap gap-1">
              <span
                *ngFor="let s of emp.skills.slice(0, 3)"
                class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-secondary text-text-secondary border border-surface-border/40"
              >
                {{ s }}
              </span>
              <span *ngIf="emp.skills.length > 3" class="text-[10px] text-text-muted px-1">
                +{{ emp.skills.length - 3 }}
              </span>
            </div>
          </div>

          <!-- Bottom Action Buttons (HR Controls) -->
          <div *ngIf="isAdmin" class="mt-4 pt-3 border-t border-surface-border/60 flex items-center justify-between gap-2">
            <!-- Toggle Active / Inactive -->
            <button
              type="button"
              (click)="toggleStatus(emp)"
              class="text-xs transition-colors cursor-pointer"
              [ngClass]="emp.status === 'active' ? 'text-text-muted hover:text-rose-400' : 'text-emerald-400 hover:text-emerald-300 font-semibold'"
            >
              {{ emp.status === 'active' ? 'Deactivate' : 'Reactivate' }}
            </button>

            <div class="flex items-center gap-1.5">
              <button
                type="button"
                (click)="openEditModal(emp)"
                class="p-2 rounded-xl bg-surface-secondary hover:bg-surface-tertiary text-text-secondary hover:text-white transition-colors cursor-pointer"
                title="Edit Employee"
              >
                <app-icon name="edit" [size]="14"></app-icon>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Add / Edit Employee Modal -->
      <app-modal
        [isOpen]="isModalOpen"
        [title]="editingUserId ? 'Edit Employee Profile' : 'Onboard New Studio Creative'"
        subtitle="Manage designation, contact info, leave quotas and access permissions"
        (close)="isModalOpen = false"
      >
        <form (ngSubmit)="saveEmployeeForm()" class="space-y-4 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                [(ngModel)]="formData.name"
                name="name"
                required
                placeholder="e.g. Leo Vance"
                class="input-field"
              />
            </div>

            <div>
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                [(ngModel)]="formData.email"
                name="email"
                required
                placeholder="name@7clouds.studio"
                class="input-field font-mono"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
                Designation *
              </label>
              <input
                type="text"
                [(ngModel)]="formData.designation"
                name="designation"
                required
                placeholder="e.g. Lead Video Editor"
                class="input-field"
              />
            </div>

            <div>
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
                Department *
              </label>
              <select [(ngModel)]="formData.department" name="department" class="input-field">
                <option value="Creative Post-Production">Creative Post-Production</option>
                <option value="Visual Design">Visual Design</option>
                <option value="Motion & VFX">Motion & VFX</option>
                <option value="Growth & Marketing">Growth & Marketing</option>
                <option value="Media Production">Media Production</option>
                <option value="Content & Strategy">Content & Strategy</option>
                <option value="Management / HR">Management / HR</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                [(ngModel)]="formData.phone"
                name="phone"
                placeholder="+1 (555) 000-0000"
                class="input-field font-mono"
              />
            </div>

            <div>
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
                Role & Access Level
              </label>
              <select [(ngModel)]="formData.role" name="role" class="input-field">
                <option value="employee">Creative Employee</option>
                <option value="admin">Studio Director / HR Admin</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
              Profile Avatar Image URL
            </label>
            <input
              type="url"
              [(ngModel)]="formData.avatar"
              name="avatar"
              placeholder="https://images.unsplash.com/..."
              class="input-field font-mono"
            />
          </div>

          <div>
            <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
              Creative Skills (comma separated)
            </label>
            <input
              type="text"
              [(ngModel)]="skillsString"
              name="skills"
              placeholder="DaVinci Resolve, Cinema 4D, Color Grading, Typography"
              class="input-field"
            />
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-surface-border">
            <button
              type="button"
              (click)="isModalOpen = false"
              class="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn-primary text-xs"
            >
              {{ editingUserId ? 'Save Profile' : 'Onboard Employee' }}
            </button>
          </div>
        </form>
      </app-modal>
    </div>
  `
})
export class EmployeesComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isAdmin = false;
  users: User[] = [];

  searchQuery = '';
  departmentFilter = 'ALL';
  statusFilter = 'ALL';

  isModalOpen = false;
  editingUserId: string | null = null;
  skillsString = '';
  formData = {
    name: '',
    email: '',
    phone: '',
    designation: '',
    department: 'Creative Post-Production',
    role: 'employee' as UserRole,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    joiningDate: '2026-01-01'
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
      this.dataService.getUsers().subscribe(users => {
        this.users = users;
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  get displayedUsers(): User[] {
    let list = [...this.users];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(
        u =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.designation.toLowerCase().includes(q) ||
          u.employeeId.toLowerCase().includes(q)
      );
    }

    if (this.departmentFilter !== 'ALL') {
      list = list.filter(u => u.department === this.departmentFilter);
    }

    if (this.statusFilter !== 'ALL') {
      list = list.filter(u => u.status === this.statusFilter);
    }

    return list;
  }

  openAddModal(): void {
    this.editingUserId = null;
    this.skillsString = 'Creative Suite, Art Direction, Visual Storytelling';
    this.formData = {
      name: '',
      email: '',
      phone: '+1 (555) 000-0000',
      designation: '',
      department: 'Creative Post-Production',
      role: 'employee',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      joiningDate: new Date().toISOString().split('T')[0]
    };
    this.isModalOpen = true;
  }

  openEditModal(user: User): void {
    this.editingUserId = user.id;
    this.skillsString = (user.skills || []).join(', ');
    this.formData = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      designation: user.designation,
      department: user.department,
      role: user.role,
      avatar: user.avatar,
      joiningDate: user.joiningDate
    };
    this.isModalOpen = true;
  }

  saveEmployeeForm(): void {
    if (!this.formData.name || !this.formData.email || !this.formData.designation) {
      this.toastService.error('Please fill in all required fields.');
      return;
    }

    const skills = this.skillsString.split(',').map(s => s.trim()).filter(Boolean);

    if (this.editingUserId) {
      const existing = this.users.find(u => u.id === this.editingUserId);
      if (existing) {
        const updated: User = {
          ...existing,
          name: this.formData.name,
          email: this.formData.email,
          phone: this.formData.phone,
          designation: this.formData.designation,
          department: this.formData.department,
          role: this.formData.role,
          avatar: this.formData.avatar,
          skills
        };
        this.dataService.updateUser(updated);
        this.toastService.success(`Updated details for ${updated.name}.`);
      }
    } else {
      const nextNum = String(this.users.length + 1).padStart(3, '0');
      const prefix = this.formData.role === 'admin' ? '7C-HR' : '7C-CR';
      const newId = `user-${Date.now()}`;
      const newUser: User = {
        id: newId,
        employeeId: `${prefix}${nextNum}`,
        name: this.formData.name,
        email: this.formData.email,
        avatar: this.formData.avatar,
        phone: this.formData.phone,
        designation: this.formData.designation,
        department: this.formData.department,
        joiningDate: this.formData.joiningDate,
        status: 'active',
        role: this.formData.role,
        leaveBalances: { casual: 12, sick: 10, emergency: 5, total: 27 },
        skills
      };
      this.dataService.addUser(newUser);
      this.toastService.success(`Successfully onboarded ${newUser.name} to 7 Clouds Studio!`);
    }

    this.isModalOpen = false;
  }

  toggleStatus(user: User): void {
    const newStatus: AccountStatus = user.status === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'Reactivate' : 'Deactivate';

    if (confirm(`${action} account for ${user.name}?`)) {
      this.dataService.updateUser({ ...user, status: newStatus });
      this.toastService.info(`Account ${user.name} is now ${newStatus}.`);
    }
  }
}
