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
    <div class="space-y-6 max-w-6xl mx-auto">
      <!-- Title & Onboard Button -->
      <div class="glass-panel p-6 sm:p-8 relative overflow-hidden">
        <div class="absolute -right-20 -top-20 w-80 h-80 bg-violet/15 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                Staff Directory & Permissions
              </span>
              <span class="text-text-muted">•</span>
              <span class="text-xs font-mono text-text-muted">{{ users.length }} Registered Staff</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Staff Account Management
            </h1>
            <p class="text-xs sm:text-sm text-text-secondary mt-1">
              Official 7 Clouds staff directory, contact numbers, designations and role-based permissions.
            </p>
          </div>

          <button
            *ngIf="isAdmin"
            (click)="openAddModal()"
            class="btn-primary py-2.5 px-4 text-xs font-semibold self-start sm:self-auto cursor-pointer"
          >
            <app-icon name="plus" [size]="16"></app-icon>
            <span>Onboard New Staff</span>
          </button>
        </div>
      </div>

      <!-- Staff Directory Table / Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          *ngFor="let member of users"
          class="glass-panel p-5 sm:p-6 flex flex-col justify-between hover:border-surface-border-bright transition-all relative overflow-hidden group"
          [ngClass]="{
            'ring-1 ring-violet-500/30': member.role === 'super_admin',
            'opacity-70': member.status === 'inactive'
          }"
        >
          <!-- Host Badge Ribbon -->
          <div *ngIf="member.role === 'super_admin'" class="absolute top-0 right-0 py-1 px-3 bg-gradient-to-l from-violet-600 to-electric text-white text-[9px] font-mono font-bold uppercase tracking-wider rounded-bl-xl">
            HOST / OWNER
          </div>

          <div *ngIf="member.status === 'inactive'" class="absolute top-0 left-0 right-0 py-0.5 bg-rose-500 text-white text-[10px] font-mono font-bold text-center">
            DEACTIVATED
          </div>

          <div class="space-y-4">
            <!-- Avatar & Header -->
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

            <!-- Details List: Phone, Email, Role, Status (No Passwords Displayed!) -->
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
                  [ngClass]="getRoleClass(member.role)"
                >
                  {{ getRoleName(member.role) }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-text-muted">Account Status</span>
                <app-badge
                  [label]="member.status === 'active' ? 'Active' : (member.status === 'pending_invite' ? 'Invite Pending' : 'Inactive')"
                  [variant]="member.status === 'active' ? 'success' : (member.status === 'pending_invite' ? 'warning' : 'danger')"
                ></app-badge>
              </div>
            </div>
          </div>

          <!-- Actions Footer: Host vs HR Permissions -->
          <div *ngIf="isAdmin" class="mt-4 pt-3 border-t border-surface-border/60 flex items-center justify-between text-xs">
            <!-- Deactivate / Reactivate (Forbidden on Host!) -->
            <div *ngIf="canModify(member)">
              <button
                type="button"
                (click)="toggleStatus(member)"
                class="text-xs transition-colors cursor-pointer"
                [ngClass]="member.status === 'active' ? 'text-text-muted hover:text-rose-400' : 'text-emerald-400 font-bold'"
              >
                {{ member.status === 'active' ? 'Deactivate' : 'Reactivate' }}
              </button>
            </div>
            <div *ngIf="!canModify(member)">
              <span class="text-[10px] font-mono text-violet-400 italic">Protected Host Account</span>
            </div>

            <!-- Edit Button (Disabled for HR on Host account) -->
            <div *ngIf="canModify(member)" class="flex items-center gap-1.5">
              <button
                type="button"
                (click)="openEditModal(member)"
                class="p-2 rounded-xl bg-surface-secondary hover:bg-surface-tertiary text-text-secondary hover:text-white transition-colors cursor-pointer"
                title="Edit Staff Member"
              >
                <app-icon name="edit" [size]="14"></app-icon>
              </button>

              <button
                *ngIf="isHost && member.role !== 'super_admin'"
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
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
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
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
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
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
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
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
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
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
                System Role & Access
              </label>
              <select [(ngModel)]="formData.role" name="role" class="input-field">
                <option value="employee">Employee (Personal Dashboard & Tasks)</option>
                <option value="hr_admin">HR Admin (Attendance & Staff Management)</option>
                <option *ngIf="isHost" value="super_admin">Host / Super Admin (Full Control)</option>
              </select>
            </div>

            <div>
              <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
                Account Status
              </label>
              <select [(ngModel)]="formData.status" name="status" class="input-field">
                <option value="active">Active</option>
                <option value="pending_invite">Invitation Pending</option>
                <option value="inactive">Inactive / Deactivated</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
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
  users: User[] = [];

  isModalOpen = false;
  editingUserId: string | null = null;

  formData = {
    name: '',
    phone: '',
    designation: '',
    email: '',
    role: 'employee' as UserRole,
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
        this.users = users;
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  canModify(member: User): boolean {
    return this.authService.canManageUser(member);
  }

  getRoleName(role: string): string {
    if (role === 'super_admin') return 'HOST / SUPER ADMIN';
    if (role === 'hr_admin' || role === 'admin') return 'HR ADMIN';
    return 'EMPLOYEE';
  }

  getRoleClass(role: string): string {
    if (role === 'super_admin') return 'bg-violet-600 text-white';
    if (role === 'hr_admin' || role === 'admin') return 'bg-violet-500/20 text-violet-300';
    return 'bg-blue-500/20 text-blue-300';
  }

  openAddModal(): void {
    this.editingUserId = null;
    this.formData = {
      name: '',
      phone: '',
      designation: '',
      email: '',
      role: 'employee',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };
    this.isModalOpen = true;
  }

  openEditModal(user: User): void {
    if (!this.canModify(user)) {
      this.toastService.error('Permission denied: HR cannot modify the Host account.');
      return;
    }
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

    // Auto-generate professional company email suggestion if empty
    let email = this.formData.email.trim();
    if (!email) {
      const cleanName = this.formData.name.trim().toLowerCase().split(' ')[0].replace(/[^a-z0-9]/g, '');
      email = `${cleanName}@7clouds.studio`;
    }

    if (this.editingUserId) {
      const existing = this.users.find(u => u.id === this.editingUserId);
      if (existing) {
        if (!this.canModify(existing)) {
          this.toastService.error('Permission denied.');
          return;
        }

        const updated: User = {
          ...existing,
          name: this.formData.name,
          phone: this.formData.phone,
          designation: this.formData.designation,
          email: email,
          role: existing.role === 'super_admin' ? 'super_admin' : this.formData.role, // Host preserves role
          status: this.formData.status,
          avatar: this.formData.avatar
        };
        this.dataService.updateUser(updated);
        this.toastService.success(`Updated account for ${updated.name}.`);
      }
    } else {
      const newId = `user-${Date.now()}`;
      const nextNum = String(this.users.length + 1).padStart(3, '0');
      const newUser: User = {
        id: newId,
        employeeId: `7C-EMP${nextNum}`,
        name: this.formData.name,
        phone: this.formData.phone,
        designation: this.formData.designation,
        email: email,
        department: this.formData.designation.toLowerCase().includes('hr') ? 'Management / HR' : 'Creative Post-Production',
        joiningDate: new Date().toISOString().split('T')[0],
        status: this.formData.status,
        role: this.formData.role,
        leaveBalances: { casual: 12, sick: 10, emergency: 5, total: 27 },
        avatar: this.formData.avatar
      };
      this.dataService.addUser(newUser);
      this.toastService.success(`Account created for ${newUser.name}. Suggested email: ${email}`);
    }

    this.isModalOpen = false;
  }

  toggleStatus(member: User): void {
    if (!this.canModify(member)) {
      this.toastService.error('The Host account cannot be deactivated.');
      return;
    }

    const nextStatus: AccountStatus = member.status === 'active' ? 'inactive' : 'active';
    const action = nextStatus === 'active' ? 'Reactivate' : 'Deactivate';

    if (confirm(`${action} account for ${member.name}?`)) {
      this.dataService.updateUser({ ...member, status: nextStatus });
      this.toastService.info(`Account status for ${member.name} changed to ${nextStatus}.`);
    }
  }

  deleteAccount(member: User): void {
    if (member.role === 'super_admin') {
      this.toastService.error('The Host account can never be deleted.');
      return;
    }

    if (confirm(`Permanently remove ${member.name}'s account?`)) {
      try {
        this.dataService.deleteUser(member.id);
        this.toastService.info(`Account for ${member.name} removed.`);
      } catch (err: any) {
        this.toastService.error(err.message || 'Cannot delete account');
      }
    }
  }
}
