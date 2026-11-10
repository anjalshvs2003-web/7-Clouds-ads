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
    <div class="space-y-8 max-w-6xl mx-auto">
      <!-- Title & Onboard Button -->
      <div class="glass-panel p-6 sm:p-8 relative overflow-hidden">
        <div class="absolute -right-20 -top-20 w-80 h-80 bg-violet/15 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                Staff Governance & Directory
              </span>
              <span class="text-text-muted">•</span>
              <span class="text-xs font-mono text-text-muted">{{ approvedStaff.length }} Approved Staff</span>
              <span *ngIf="pendingRegistrations.length > 0" class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                {{ pendingRegistrations.length }} Pending
              </span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Employee Management
            </h1>
            <p class="text-xs sm:text-sm text-text-secondary mt-1">
              Public employee registrations, account approvals, HR role delegation and staff contact details.
            </p>
          </div>

          <button
            *ngIf="isAdmin"
            (click)="openAddModal()"
            class="btn-primary py-2.5 px-4 text-xs font-semibold self-start sm:self-auto cursor-pointer flex items-center gap-2"
          >
            <app-icon name="plus" [size]="16"></app-icon>
            <span>Onboard New Staff</span>
          </button>
        </div>
      </div>

      <!-- ================= SECTION 1: PENDING REGISTRATIONS (HOST APPROVAL SYSTEM) ================= -->
      <div *ngIf="isHost" class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></div>
            <h2 class="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Pending Registrations</span>
              <span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold">
                {{ pendingRegistrations.length }}
              </span>
            </h2>
          </div>
          <span class="text-xs text-text-muted">Host Approval Required Before Employee Login</span>
        </div>

        <!-- Empty state when no pending -->
        <div *ngIf="pendingRegistrations.length === 0" class="glass-panel p-6 text-center text-xs text-text-muted border border-surface-border">
          <app-icon name="check-circle" [size]="24" extraClass="text-emerald-400 mx-auto mb-2"></app-icon>
          <div class="font-medium text-white">All Applications Processed</div>
          <p class="text-[11px] text-text-secondary mt-0.5">There are currently no employee registrations awaiting Host approval.</p>
        </div>

        <!-- Pending Cards Grid -->
        <div *ngIf="pendingRegistrations.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            *ngFor="let applicant of pendingRegistrations"
            class="glass-panel p-5 relative overflow-hidden border border-amber-500/30 flex flex-col justify-between"
          >
            <div class="absolute top-0 right-0 py-1 px-3 bg-amber-500/20 text-amber-300 text-[9px] font-mono font-bold uppercase tracking-wider rounded-bl-xl border-l border-b border-amber-500/30">
              PENDING APPROVAL
            </div>

            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <img
                  [src]="applicant.avatar"
                  [alt]="applicant.name"
                  class="w-12 h-12 rounded-2xl object-cover ring-2 ring-amber-500/30 shrink-0"
                />
                <div class="min-w-0 flex-1 pr-16">
                  <h3 class="font-bold text-white text-sm truncate">{{ applicant.name }}</h3>
                  <div class="text-xs font-semibold text-amber-300 mt-0.5 truncate">{{ applicant.designation }}</div>
                  <div class="text-[10px] text-text-muted font-mono mt-0.5">ID: {{ applicant.employeeId }}</div>
                </div>
              </div>

              <!-- Details -->
              <div class="space-y-1.5 py-2.5 border-y border-surface-border/60 text-xs font-mono">
                <div class="flex items-center justify-between text-[11px]">
                  <span class="text-text-muted">Phone:</span>
                  <span class="text-white">{{ applicant.phone }}</span>
                </div>
                <div class="flex items-center justify-between text-[11px]">
                  <span class="text-text-muted">Email:</span>
                  <span class="text-text-secondary truncate max-w-[170px]">{{ applicant.email }}</span>
                </div>
                <div class="flex items-center justify-between text-[11px]">
                  <span class="text-text-muted">Registered:</span>
                  <span class="text-text-secondary text-[10px]">{{ applicant.registeredAt || 'Today' }}</span>
                </div>
              </div>
            </div>

            <!-- Host Approval Actions -->
            <div class="mt-4 pt-3 border-t border-surface-border/60 flex items-center justify-between gap-2">
              <button
                type="button"
                (click)="approve(applicant)"
                class="flex-1 py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <app-icon name="check-circle" [size]="14"></app-icon>
                <span>Approve</span>
              </button>

              <button
                type="button"
                (click)="reject(applicant)"
                class="py-2 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1"
                title="Reject Registration"
              >
                <app-icon name="x-circle" [size]="14"></app-icon>
                <span>Reject</span>
              </button>

              <button
                type="button"
                (click)="openEditModal(applicant)"
                class="p-2 rounded-xl bg-surface-secondary hover:bg-surface-tertiary text-text-secondary hover:text-white transition-colors cursor-pointer"
                title="Edit Details Before Approving"
              >
                <app-icon name="edit" [size]="14"></app-icon>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ================= SECTION 2: APPROVED STAFF DIRECTORY ================= -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>Staff Directory</span>
            <span class="text-xs text-text-muted font-normal">({{ approvedStaff.length }} active & registered employees)</span>
          </h2>
          <span class="text-xs text-text-muted font-mono">Host Account Strictly Isolated</span>
        </div>

        <div *ngIf="approvedStaff.length === 0" class="glass-panel p-8 text-center text-xs text-text-muted border border-surface-border">
          <app-icon name="users" [size]="28" extraClass="text-text-muted mx-auto mb-2"></app-icon>
          <div class="font-medium text-white">No Approved Staff Yet</div>
          <p class="text-[11px] text-text-secondary mt-0.5">Use the public registration form or click 'Onboard New Staff' above.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div
            *ngFor="let member of approvedStaff"
            class="glass-panel p-5 sm:p-6 flex flex-col justify-between hover:border-surface-border-bright transition-all relative overflow-hidden group"
            [ngClass]="{
              'opacity-65': member.status === 'inactive'
            }"
          >
            <div *ngIf="member.status === 'inactive'" class="absolute top-0 left-0 right-0 py-0.5 bg-rose-500 text-white text-[10px] font-mono font-bold text-center">
              DEACTIVATED
            </div>

            <div class="space-y-4">
              <!-- Avatar & Name Header -->
              <div class="flex items-center gap-3.5">
                <img
                  [src]="member.avatar"
                  [alt]="member.name"
                  class="w-12 h-12 rounded-2xl object-cover ring-2 ring-surface-border group-hover:ring-electric/40 transition-all shrink-0"
                />
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <h3 class="font-bold text-white text-sm truncate group-hover:text-electric-light transition-colors">
                      {{ member.name }}
                    </h3>
                  </div>
                  <div class="text-xs font-semibold text-text-secondary mt-0.5 truncate">
                    {{ member.designation }}
                  </div>
                  <div class="text-[10px] text-text-muted font-mono mt-0.5">
                    ID: {{ member.employeeId }}
                  </div>
                </div>
              </div>

              <!-- Details List -->
              <div class="space-y-2 py-3 border-y border-surface-border/50 text-xs">
                <div class="flex items-center justify-between">
                  <span class="text-text-muted">Phone Number</span>
                  <span class="font-mono text-white font-medium">{{ member.phone }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-text-muted">Company Email</span>
                  <span class="font-mono text-text-secondary truncate max-w-[170px]">{{ member.email }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-text-muted">System Role</span>
                  <span
                    class="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full"
                    [ngClass]="isHrRole(member.role) ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'bg-blue-500/20 text-blue-300'"
                  >
                    {{ isHrRole(member.role) ? 'HR ADMIN' : 'EMPLOYEE' }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-text-muted">Account Status</span>
                  <app-badge
                    [label]="member.status === 'active' ? 'Active' : (member.status === 'rejected' ? 'Rejected' : 'Inactive')"
                    [variant]="member.status === 'active' ? 'success' : 'danger'"
                  ></app-badge>
                </div>
              </div>

              <!-- Host Special Action: HR Role Assignment -->
              <div *ngIf="isHost" class="p-2.5 rounded-xl bg-surface-secondary/40 border border-surface-border/70 flex items-center justify-between gap-2">
                <div class="text-[11px] font-semibold text-text-muted">HR Permission:</div>
                <button
                  type="button"
                  (click)="toggleHrRole(member)"
                  class="text-[10px] font-bold font-mono px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                  [ngClass]="isHrRole(member.role)
                    ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                    : 'bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 border border-violet-500/30'"
                >
                  <app-icon name="shield" [size]="12"></app-icon>
                  <span>{{ isHrRole(member.role) ? 'Demote to Employee' : 'Promote to HR Admin' }}</span>
                </button>
              </div>
            </div>

            <!-- Actions Footer: Host & HR Permissions -->
            <div *ngIf="isAdmin" class="mt-4 pt-3 border-t border-surface-border/60 flex items-center justify-between text-xs">
              <div>
                <button
                  type="button"
                  (click)="toggleStatus(member)"
                  class="text-xs transition-colors cursor-pointer"
                  [ngClass]="member.status === 'active' ? 'text-text-muted hover:text-rose-400' : 'text-emerald-400 font-bold'"
                >
                  {{ member.status === 'active' ? 'Deactivate' : 'Reactivate' }}
                </button>
              </div>

              <div class="flex items-center gap-1.5">
                <button
                  type="button"
                  (click)="openEditModal(member)"
                  class="p-2 rounded-xl bg-surface-secondary hover:bg-surface-tertiary text-text-secondary hover:text-white transition-colors cursor-pointer"
                  title="Edit Staff Member"
                >
                  <app-icon name="edit" [size]="14"></app-icon>
                </button>

                <button
                  *ngIf="isHost"
                  type="button"
                  (click)="deleteAccount(member)"
                  class="p-2 rounded-xl bg-surface-secondary hover:bg-rose-500/20 text-text-muted hover:text-rose-400 transition-colors cursor-pointer"
                  title="Delete Account (Host Only)"
                >
                  <app-icon name="trash-2" [size]="14"></app-icon>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add / Edit Staff Modal -->
      <app-modal
        [isOpen]="isModalOpen"
        [title]="editingUserId ? 'Edit Staff Account' : 'Onboard New Staff Member'"
        subtitle="Manage designation, contact number, role permissions and account status"
        (close)="isModalOpen = false"
      >
        <form (ngSubmit)="saveStaffForm()" class="space-y-4 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5 font-mono text-[10px]">
                Staff Name *
              </label>
              <input
                type="text"
                [(ngModel)]="formData.name"
                name="name"
                required
                placeholder="e.g. Adithya Kumar"
                class="input-field"
              />
            </div>

            <div>
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5 font-mono text-[10px]">
                Phone Number *
              </label>
              <input
                type="tel"
                [(ngModel)]="formData.phone"
                name="phone"
                required
                placeholder="e.g. 9847921883"
                class="input-field font-mono"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5 font-mono text-[10px]">
                Designation *
              </label>
              <input
                type="text"
                [(ngModel)]="formData.designation"
                name="designation"
                required
                placeholder="e.g. Video Editor / Graphics Designer"
                class="input-field"
              />
            </div>

            <div>
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5 font-mono text-[10px]">
                Company Email Address
              </label>
              <input
                type="email"
                [(ngModel)]="formData.email"
                name="email"
                placeholder="name@7clouds.studio"
                class="input-field font-mono"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5 font-mono text-[10px]">
                System Role & Access
              </label>
              <select [(ngModel)]="formData.role" name="role" class="input-field bg-surface-secondary text-white">
                <option value="EMPLOYEE">Employee (Personal Dashboard & Tasks)</option>
                <option *ngIf="isHost" value="HR ADMIN">HR Admin (Attendance & Staff Management)</option>
              </select>
            </div>

            <div>
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5 font-mono text-[10px]">
                Account Status
              </label>
              <select [(ngModel)]="formData.status" name="status" class="input-field bg-surface-secondary text-white">
                <option value="active">Active</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="inactive">Inactive / Deactivated</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5 font-mono text-[10px]">
              Avatar Image URL
            </label>
            <input
              type="url"
              [(ngModel)]="formData.avatar"
              name="avatar"
              placeholder="https://images.unsplash.com/..."
              class="input-field font-mono"
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
              {{ editingUserId ? 'Save Account' : 'Create Account' }}
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
  isHost = false;

  pendingRegistrations: User[] = [];
  approvedStaff: User[] = [];

  isModalOpen = false;
  editingUserId: string | null = null;

  formData = {
    name: '',
    phone: '',
    designation: '',
    email: '',
    role: 'EMPLOYEE' as UserRole,
    status: 'active' as AccountStatus,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
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
        this.isAdmin = this.authService.isAdmin();
        this.isHost = this.authService.isHost();
      }),
      this.dataService.getUsers().subscribe(users => {
        // Exclude Host permanently from both lists
        const nonHost = users.filter(u => u.role !== 'HOST' && (u.role as string) !== 'super_admin');
        this.pendingRegistrations = nonHost.filter(u => u.status === 'pending_approval');
        this.approvedStaff = nonHost.filter(u => u.status !== 'pending_approval');
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  isHrRole(role: string): boolean {
    return role === 'HR ADMIN' || role === 'hr_admin';
  }

  approve(applicant: User): void {
    this.dataService.approveRegistration(applicant.id);
    this.toastService.success(`Approved ${applicant.name}! Account is now active.`);
  }

  reject(applicant: User): void {
    this.dataService.rejectRegistration(applicant.id, 'Host rejected registration');
    this.toastService.warning(`Registration for ${applicant.name} rejected.`);
  }

  toggleHrRole(member: User): void {
    if (!this.isHost) {
      this.toastService.error('Only the Host can assign HR roles.');
      return;
    }

    if (this.isHrRole(member.role)) {
      this.dataService.demoteToEmployee(member.id);
      this.toastService.info(`${member.name} demoted to Employee.`);
    } else {
      this.dataService.promoteToHr(member.id);
      this.toastService.success(`${member.name} promoted to HR Admin!`);
    }
  }

  toggleStatus(member: User): void {
    const newStatus = member.status === 'active' ? 'inactive' : 'active';
    this.dataService.updateUser({ ...member, status: newStatus });
    this.toastService.info(
      newStatus === 'active'
        ? `${member.name} has been reactivated.`
        : `${member.name} has been deactivated.`
    );
  }

  openAddModal(): void {
    this.editingUserId = null;
    this.formData = {
      name: '',
      phone: '',
      designation: '',
      email: '',
      role: 'EMPLOYEE',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };
    this.isModalOpen = true;
  }

  openEditModal(user: User): void {
    this.editingUserId = user.id;
    this.formData = {
      name: user.name,
      phone: user.phone,
      designation: user.designation,
      email: user.email,
      role: user.role,
      status: user.status,
      avatar: user.avatar
    };
    this.isModalOpen = true;
  }

  saveStaffForm(): void {
    if (!this.formData.name.trim() || !this.formData.phone.trim() || !this.formData.designation.trim()) {
      this.toastService.error('Please enter name, phone number and designation.');
      return;
    }

    let email = this.formData.email.trim();
    if (!email) {
      const cleanName = this.formData.name.trim().toLowerCase().split(' ')[0].replace(/[^a-z0-9]/g, '');
      email = `${cleanName}@7clouds.studio`;
    }

    if (this.editingUserId) {
      const existing = [...this.pendingRegistrations, ...this.approvedStaff].find(u => u.id === this.editingUserId);
      if (existing) {
        const updated: User = {
          ...existing,
          name: this.formData.name.trim(),
          phone: this.formData.phone.trim(),
          designation: this.formData.designation.trim(),
          email,
          role: this.isHost ? this.formData.role : existing.role,
          status: this.formData.status,
          avatar: this.formData.avatar || existing.avatar
        };
        this.dataService.updateUser(updated);
        this.toastService.success(`Updated ${updated.name}'s profile.`);
      }
    } else {
      const nextId = this.dataService.generateNextEmployeeId();
      const newStaff: User = {
        id: 'user-' + Date.now(),
        employeeId: nextId,
        name: this.formData.name.trim(),
        phone: this.formData.phone.trim(),
        designation: this.formData.designation.trim(),
        email,
        role: this.formData.role,
        status: this.formData.status,
        department: 'Creative Studio',
        joiningDate: new Date().toISOString().split('T')[0],
        avatar: this.formData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        leaveBalances: { casual: 12, sick: 10, emergency: 5, total: 27 },
        skills: ['Workspace Operations'],
        bio: 'Studio team member at 7 Clouds.'
      };
      this.dataService.addUser(newStaff);
      this.toastService.success(`Added ${newStaff.name} (ID: ${newStaff.employeeId})!`);
    }

    this.isModalOpen = false;
  }

  deleteAccount(member: User): void {
    if (!this.isHost) {
      this.toastService.error('Only the Host can delete accounts.');
      return;
    }
    if (confirm(`Permanently remove ${member.name} (${member.employeeId}) from 7 Clouds?`)) {
      this.dataService.deleteUser(member.id);
      this.toastService.info(`Staff account for ${member.name} deleted.`);
    }
  }
}
