import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { User, UserRole } from '../models';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly CURRENT_USER_KEY = '7clouds_v2_current_user_id';
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
  isAuthenticated$: Observable<boolean> = this.currentUser$.pipe(map(u => !!u));

  // Role streams
  isAdmin$: Observable<boolean> = this.currentUser$.pipe(
    map(u => u?.role === 'super_admin' || u?.role === 'hr_admin' || u?.role === 'admin')
  );
  isHost$: Observable<boolean> = this.currentUser$.pipe(map(u => u?.role === 'super_admin'));
  isHr$: Observable<boolean> = this.currentUser$.pipe(map(u => u?.role === 'hr_admin'));
  userRole$: Observable<UserRole | null> = this.currentUser$.pipe(map(u => u?.role ?? null));

  constructor(
    private dataService: DataService,
    private router: Router
  ) {
    this.restoreSession();
  }

  private restoreSession(): void {
    const savedUserId = localStorage.getItem(this.CURRENT_USER_KEY);
    const users = this.dataService.getUsersSnapshot();
    if (savedUserId) {
      const found = users.find(u => u.id === savedUserId && u.status === 'active');
      if (found) {
        this.currentUserSubject.next(found);
        return;
      }
    }
    // Default to Host / Super Admin: Anjalsh V.S
    const defaultHost = users.find(u => u.role === 'super_admin') || users[0];
    if (defaultHost) {
      this.currentUserSubject.next(defaultHost);
      localStorage.setItem(this.CURRENT_USER_KEY, defaultHost.id);
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getUserId(): string {
    return this.currentUserSubject.value?.id || '';
  }

  isHost(): boolean {
    return this.currentUserSubject.value?.role === 'super_admin';
  }

  isHr(): boolean {
    return this.currentUserSubject.value?.role === 'hr_admin';
  }

  isAdmin(): boolean {
    const role = this.currentUserSubject.value?.role;
    return role === 'super_admin' || role === 'hr_admin' || role === 'admin';
  }

  isEmployee(): boolean {
    return this.currentUserSubject.value?.role === 'employee';
  }

  /**
   * Permission Check:
   * Host has complete control over every account.
   * HR can manage employees, but must NOT be able to delete, deactivate, or modify the Host account!
   */
  canManageUser(targetUser: User): boolean {
    if (this.isHost()) return true;
    if (this.isHr()) {
      return targetUser.role !== 'super_admin';
    }
    return false;
  }

  login(identifier: string, _password?: string): boolean {
    const users = this.dataService.getUsersSnapshot();
    const clean = identifier.trim().toLowerCase();
    // Allow login by email or phone number
    const user = users.find(
      u => u.email.toLowerCase() === clean || u.phone === clean
    );

    if (user) {
      if (user.status === 'inactive') {
        throw new Error('This account has been deactivated. Please contact the Host or Studio HR.');
      }
      this.currentUserSubject.next(user);
      localStorage.setItem(this.CURRENT_USER_KEY, user.id);
      return true;
    }
    return false;
  }

  switchUser(userId: string): void {
    const users = this.dataService.getUsersSnapshot();
    const user = users.find(u => u.id === userId);
    if (user) {
      this.currentUserSubject.next(user);
      localStorage.setItem(this.CURRENT_USER_KEY, user.id);
    }
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
    this.dataService.updateUser(updated);
  }

  changePassword(newPassword: string): void {
    const current = this.getCurrentUser();
    if (!current) return;
    const updated: User = {
      ...current,
      passwordHash: 'hash_' + btoa(newPassword).substring(0, 12),
      firstLoginRequired: false
    };
    this.currentUserSubject.next(updated);
    this.dataService.updateUser(updated);
  }
}
