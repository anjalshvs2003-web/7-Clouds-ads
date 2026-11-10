import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { User, UserRole } from '../models';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly CURRENT_USER_KEY = '7clouds_current_user_id';
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
  isAuthenticated$: Observable<boolean> = this.currentUser$.pipe(map(u => !!u));
  isAdmin$: Observable<boolean> = this.currentUser$.pipe(map(u => u?.role === 'admin'));
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
    // Default to admin Elena Rostova if no active session
    const defaultAdmin = users.find(u => u.role === 'admin') || users[0];
    if (defaultAdmin) {
      this.currentUserSubject.next(defaultAdmin);
      localStorage.setItem(this.CURRENT_USER_KEY, defaultAdmin.id);
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getUserId(): string {
    return this.currentUserSubject.value?.id || '';
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'admin';
  }

  login(email: string, _password?: string): boolean {
    const users = this.dataService.getUsersSnapshot();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (user) {
      if (user.status !== 'active') {
        throw new Error('This account has been deactivated. Please contact Studio HR.');
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
}
