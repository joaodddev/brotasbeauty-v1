import { Component, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Sidebar } from './layout/sidebar/sidebar';
import { AppointmentModalComponent } from './shared/components/appointment-modal/appointment-modal.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, HttpClientModule, Sidebar, AppointmentModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private authService = inject(AuthService);
  private router = inject(Router);

  isAuthenticated = this.authService.isAuthenticated;

  ngOnInit(): void {
    // Check if user is trying to access a route other than login
    if (!this.isAuthenticated() && this.router.url !== '/login') {
      this.router.navigate(['/login']);
    }
  }
}
