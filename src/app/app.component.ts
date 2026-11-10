import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { AuthService } from './core/services/auth.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent, ToastComponent],
  template: `
    <!-- If on login screen, render full-bleed -->
    <div *ngIf="isLoginPage" class="min-h-screen bg-background text-text-primary">
      <router-outlet></router-outlet>
      <app-toast></app-toast>
    </div>

    <!-- Main Workspace Shell for authenticated users -->
    <div *ngIf="!isLoginPage" class="min-h-screen bg-background text-text-primary flex">
      <!-- Sidebar -->
      <app-sidebar
        [isOpen]="isSidebarOpen"
        (closeSidebar)="isSidebarOpen = false"
      ></app-sidebar>

      <!-- Main Column -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- Top App Bar -->
        <app-header
          (toggleSidebar)="isSidebarOpen = !isSidebarOpen"
        ></app-header>

        <!-- Dynamic Routed Content -->
        <main class="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Global Toasts -->
      <app-toast></app-toast>
    </div>
  `
})
export class AppComponent implements OnInit {
  isSidebarOpen = false;
  isLoginPage = false;

  constructor(
    private router: Router,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.checkRoute(this.router.url);

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.checkRoute(event.urlAfterRedirects || event.url);
        this.isSidebarOpen = false; // Close mobile drawer on route change
      });
  }

  private checkRoute(url: string): void {
    this.isLoginPage = url.includes('/login') || url.includes('/host-portal');
  }
}
