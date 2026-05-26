import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { User, Profissional } from '../../shared/models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private readonly API_URL = 'https://brotasbeauty-backend.onrender.com/api';

    authToken = signal<string | null>(null);
    currentUser = signal<User | null>(null);
    isAuthenticated = signal(false);
    profissionais = signal<Profissional[]>([]);

    constructor() {
        this.loadFromStorage();
    }

    private getAuthHeaders(): { headers: HttpHeaders } {
        const token = this.authToken();
        return token
            ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
            : { headers: new HttpHeaders() };
    }

    private loadFromStorage(): void {
        const token = localStorage.getItem('bb_token');
        const userJson = localStorage.getItem('bb_user');
        if (token && userJson) {
            try {
                const user: User = JSON.parse(userJson);
                this.authToken.set(token);
                this.currentUser.set(user);
                this.isAuthenticated.set(true);
                void this.loadProfissionais();
            } catch {
                this.clearSession();
            }
        }
    }

    async login(username: string, password: string): Promise<{ success: boolean; message?: string }> {
        try {
            const response = await firstValueFrom(
                this.http.post<{ token: string; user: User }>(
                    `${this.API_URL}/auth/login`,
                    { username, password }
                )
            );

            this.authToken.set(response.token);
            this.currentUser.set(response.user);
            this.isAuthenticated.set(true);
            localStorage.setItem('bb_token', response.token);
            localStorage.setItem('bb_user', JSON.stringify(response.user));

            await this.loadProfissionais();
            return { success: true };
        } catch (error: any) {
            const message =
                error?.error?.message ||
                error?.message ||
                'Erro ao fazer login. Verifique atendimento de backend.';
            return { success: false, message };
        }
    }

    logout(): void {
        this.clearSession();
    }

    private clearSession(): void {
        this.authToken.set(null);
        this.currentUser.set(null);
        this.isAuthenticated.set(false);
        this.profissionais.set([]);
        localStorage.removeItem('bb_token');
        localStorage.removeItem('bb_user');
    }

    async loadProfissionais(): Promise<void> {
        if (!this.authToken()) {
            this.profissionais.set([]);
            return;
        }

        try {
            const profs = await firstValueFrom(
                this.http.get<Profissional[]>(`${this.API_URL}/profissionais`, this.getAuthHeaders())
            );
            this.profissionais.set(profs);
        } catch (error) {
            console.error('Erro carregando profissionais', error);
            this.profissionais.set([]);
        }
    }

    getProfissionaisList(): Profissional[] {
        return this.profissionais().filter(p => p.cargo === 'Profissional');
    }

    getProfissionalById(id: string): Profissional | undefined {
        return this.profissionais().find(p => p.id === id);
    }

    getToken(): string | null {
        return this.authToken();
    }
}
