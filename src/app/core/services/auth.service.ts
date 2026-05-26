import { Injectable, signal } from '@angular/core';
import { User, Profissional } from '../../shared/models';

const PROFISSIONAIS: Profissional[] = [
    {
        id: 'simone',
        nome: 'Simone',
        login: 'simone',
        senha: '123',
        cargo: 'Profissional',
        cor: '#c9a18b',
        comissaoPercentual: 40,
        servicos: ['Unhas']
    },
    {
        id: 'elizeth',
        nome: 'Elizeth',
        login: 'elizeth',
        senha: '123',
        cargo: 'Profissional',
        cor: '#e8aebf',
        comissaoPercentual: 70,
        servicos: ['Cabelo']
    },
    {
        id: 'clau',
        nome: 'Clau',
        login: 'clau',
        senha: '123',
        cargo: 'Profissional',
        cor: '#8c4a4a',
        comissaoPercentual: 50,
        servicos: ['Estética']
    },
    {
        id: 'kaylaine',
        nome: 'Kaylaine',
        login: 'kaylaine',
        senha: '123',
        cargo: 'Profissional',
        cor: '#b07a9a',
        comissaoPercentual: 5,
        servicos: ['Auxiliar']
    },
    {
        id: 'admin',
        nome: 'Administradora',
        login: 'admin',
        senha: 'admin',
        cargo: 'Administradora',
        cor: '#5a7a8c',
        comissaoPercentual: 0,
        servicos: []
    }
];

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    currentUser = signal<User | null>(null);
    isAuthenticated = signal(false);

    login(username: string, password: string): { success: boolean; message?: string } {
        const prof = PROFISSIONAIS.find(p => p.login === username && p.senha === password);

        if (!prof) {
            return { success: false, message: 'Usuário ou senha incorretos' };
        }

        const user: User = {
            id: prof.id,
            nome: prof.nome,
            login: prof.login,
            cargo: prof.cargo,
            cor: prof.cor
        };

        this.currentUser.set(user);
        this.isAuthenticated.set(true);

        return { success: true };
    }

    logout(): void {
        this.currentUser.set(null);
        this.isAuthenticated.set(false);
    }

    getProfissionais(): Profissional[] {
        return PROFISSIONAIS;
    }

    getProfissionalById(id: string): Profissional | undefined {
        return PROFISSIONAIS.find(p => p.id === id);
    }

    getProfissionaisList(): Profissional[] {
        return PROFISSIONAIS.filter(p => p.cargo === 'Profissional');
    }
}
