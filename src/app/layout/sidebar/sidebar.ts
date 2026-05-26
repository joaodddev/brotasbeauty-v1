import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = this.authService.currentUser;

  getInitials(nome: string): string {
    return nome
      .split(' ')
      .map(word => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  navigateTo(page: string): void {
    this.router.navigate([`/${page}`]);
    this.setActiveNav(page);
  }

  setActiveNav(page: string): void {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach((item, index) => {
      item.classList.remove('active');
      const pages = ['dashboard', 'agenda', 'admin'];
      if (pages[index] === page) {
        item.classList.add('active');
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isAdmin(): boolean {
    return this.currentUser()?.cargo === 'Administradora';
  }
}
