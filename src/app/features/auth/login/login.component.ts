import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent {
    private authService = inject(AuthService);
    private router = inject(Router);

    username = signal('');
    password = signal('');
    errorMessage = signal('');

    onLogin(): void {
        this.errorMessage.set('');
        const result = this.authService.login(this.username(), this.password());

        if (result.success) {
            this.router.navigate(['/dashboard']);
        } else {
            this.errorMessage.set(result.message || 'Erro ao fazer login');
        }
    }

    onKeyUp(event: KeyboardEvent, field: 'username' | 'password'): void {
        if (event.key === 'Enter') {
            if (field === 'username') {
                const passwordInput = document.getElementById('login-pass') as HTMLInputElement;
                passwordInput?.focus();
            } else {
                this.onLogin();
            }
        }
    }
}
