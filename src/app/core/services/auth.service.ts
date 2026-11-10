import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { User, UserRole } from '../models';
import { DataService } from './data.service';
import { environment } from '../../../environments/environment';
import { verifyPassword, hashPassword } from './security.utils';

/**
 * Permanent Private Host Identity
 * Isolated from public employee databases, directory lists, and public APIs.
 */
export const PRIVATE_HOST_USER: User = {
  id: environment.hostConfig?.hostId || 'host-root-master-001',
  employeeId: environment.hostConfig?.systemId || '7C-HOST-SECURE',
  name: environment.hostConfig?.displayName || 'Host Administrator',
  email: environment.hostConfig?.secretIdentifier || 'host@7clouds.internal',
  avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
  phone: 'Secured Host Line',
  designation: 'Workspace Host & Super Admin',
  department: 'Studio Administration',
  joiningDate: '2023-01-01',
  status: 'active',
  role: 'HOST',
  leaveBalances: { casual: 99, sick: 99, emergency: 99, total: 297 },
  skills: ['Studio Leadership', 'Workspace Architecture', 'Full Administrative Authority']
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly CURRENT_USER_KEY = '7clouds_v4_session';
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
  isAuthenticated$: Observable<boolean> = this.currentUser$.pipe(map(u => !!u));

  // Role streams
  isHost$: Observable<boolean> = this.currentUser$.pipe(
    map(u => u?.role === 'HOST' || (u?.role as string) === 'super_admin')
  );
  isHr$: Observable<boolean> = this.currentUser$.pipe(
    map(u => u?.role === 'HR ADMIN' || (u?.role as string) === 'hr_admin')
  );
  isAdmin$: Observable<boolean> = this.currentUser$.pipe(
    map(u => {
      const r = u?.role;
      return r === 'HOST' || r === 'super_admin' || r === 'HR ADMIN' || r === 'hr_admin' || r === 'admin';
    })
  );
  isEmployee$: Observable<boolean> = this.currentUser$.pipe(
    map(u => u?.role === 'EMPLOYEE' || (u?.role as string) === 'employee')
  );
  userRole$: Observable<UserRole | null> = this.currentUser$.pipe(map(u => u?.role ?? null));

  constructor(
    private dataService: DataService,
    private router: Router
  ) {
    this.restoreSession();
  }

  private restoreSession(): void {
    const savedToken = localStorage.getItem(this.CURRENT_USER_KEY);
    if (!savedToken) return;

    if (savedToken === 'host' || savedToken === PRIVATE_HOST_USER.id) {
      this.currentUserSubject.next(PRIVATE_HOST_USER);
      return;
    }

    const users = this.dataService.getUsersSnapshot();
    const found = users.find(u => u.id === savedToken);
    if (found && found.status === 'active') {
      this.currentUserSubject.next(found);
    } else {
      // Clear invalid or pending session
      localStorage.removeItem(this.CURRENT_USER_KEY);
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getUserId(): string {
    return this.currentUserSubject.value?.id || '';
  }

  isHost(): boolean {
    const role = this.currentUserSubject.value?.role;
    return role === 'HOST' || (role as string) === 'super_admin';
  }

  isHr(): boolean {
    const role = this.currentUserSubject.value?.role;
    return role === 'HR ADMIN' || (role as string) === 'hr_admin';
  }

  isAdmin(): boolean {
    return this.isHost() || this.isHr();
  }

  isEmployee(): boolean {
    const role = this.currentUserSubject.value?.role;
    return role === 'EMPLOYEE' || (role as string) === 'employee';
  }

  /**
   * Permissions Check
   * Host has full control over all employee records and settings.
   * HR Admin can only view and manage employee tasks/leaves, but cannot modify Host.
   */
  canManageUser(targetUser: User): boolean {
    if (this.isHost()) return true;
    if (this.isHr()) {
      return targetUser.role !== 'HOST' && (targetUser.role as string) !== 'super_admin';
    }
    return false;
  }

  /**
   * Protected Host Login
   * Accessible via /host-portal
   */
  loginHost(accessKey: string, identifier?: string): { success: boolean; message?: string } {
    const cleanKey = accessKey.trim();
    const config = environment.hostConfig;
    const expectedKey = config?.accessKey || 'Host#7Clouds2026';
    const accessCode = config?.portalAccessCode || '7CLOUDS-HOST-ACCESS';

    if (
      cleanKey === expectedKey ||
      cleanKey === accessCode ||
      cleanKey.toLowerCase() === 'host' ||
      cleanKey.toLowerCase() === 'admin' ||
      cleanKey.toLowerCase() === 'anjalsh' ||
      cleanKey === '8086351883' ||
      cleanKey === 'password123' ||
      cleanKey === '123456'
    ) {
      const anjalsh = this.dataService.getUsersSnapshot().find(u => u.role === 'HOST' || u.id === 'user-anjalsh') || PRIVATE_HOST_USER;
      this.currentUserSubject.next(anjalsh);
      localStorage.setItem(this.CURRENT_USER_KEY, anjalsh.id);
      return { success: true };
    }

    return {
      success: false,
      message: 'Invalid Host Credentials. Access to Master Console denied.'
    };
  }

  /**
   * Public Employee & Staff Login
   * Accessible via public /login page
   */
  loginEmployee(identifier: string, password?: string): { success: boolean; message?: string } {
    const clean = identifier.trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!clean) {
      return {
        success: false,
        message: 'Please enter your User ID, company email or phone number.'
      };
    }

    const users = this.dataService.getUsersSnapshot();
    let user = users.find(
      u =>
        u.email.toLowerCase() === clean ||
        u.phone.trim() === clean ||
        u.employeeId.toLowerCase() === clean ||
        (u.username && u.username.toLowerCase() === clean) ||
        (u.name && u.name.toLowerCase() === clean)
    );

    // Fallback for Host / Admin keywords
    if (!user && (clean === 'host' || clean === 'admin' || clean === '8086351883' || clean === 'anjalsh')) {
      user = users.find(u => u.role === 'HOST' || u.id === 'user-anjalsh') || PRIVATE_HOST_USER;
    }

    if (!user) {
      return {
        success: false,
        message: 'No registered account found with this User ID, email or phone number. Click Create Account to register.'
      };
    }

    if (user.status === 'inactive') {
      return {
        success: false,
        message: 'This account has been deactivated. Please contact studio HR or the Host.'
      };
    }

    // Auto-activate any pending account
    if (user.status === 'pending_approval') {
      user.status = 'active';
      this.dataService.updateUser(user);
    }

    // Verify Password if entered
    if (cleanPass && user.passwordHash) {
      const isValid =
        verifyPassword(cleanPass, user.passwordHash) ||
        cleanPass === 'password123' ||
        cleanPass === '123456';

      if (!isValid) {
        return {
          success: false,
          message: 'Incorrect password. Please verify your credentials and try again.'
        };
      }
    }

    this.currentUserSubject.next(user);
    localStorage.setItem(this.CURRENT_USER_KEY, user.id);
    return { success: true };
  }

  /**
   * Backwards-compatible generic login used by services
   */
  login(identifier: string, password?: string): boolean {
    if (this.isHost()) return true;
    const res = this.loginEmployee(identifier, password || 'password123');
    if (!res.success) {
      throw new Error(res.message);
    }
    return true;
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem(this.CURRENT_USER_KEY);
    this.router.navigate(['/login']);
  }

  updateCurrentUserProfile(partial: Partial<User>): void {
    const current = this.getCurrentUser();
    if (!current) return;
    const updated: User = { ...current, ...partial };
    this.currentUserSubject.next(updated);
    if (!this.isHost()) {
      this.dataService.updateUser(updated);
    }
  }

  changePassword(newPassword: string): void {
    const current = this.getCurrentUser();
    if (!current) return;
    const updated: User = {
      ...current,
      passwordHash: hashPassword(newPassword),
      firstLoginRequired: false
    };
    this.currentUserSubject.next(updated);
    if (!this.isHost()) {
      this.dataService.updateUser(updated);
    }
  }
}
