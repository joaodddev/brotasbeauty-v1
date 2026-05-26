import { Injectable, inject, signal } from '@angular/core';
import { Agendamento } from '../../shared/models';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class AppointmentsService {
    private appointmentsAuthService = inject(AuthService);
    private agendamentos = signal<Agendamento[]>([]);
    private idCounter = 0;
    private readonly STORAGE_KEY = 'bb_agendamentos';

    constructor() {
        this.loadData();
    }

    private loadData(): void {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                this.agendamentos.set(data);
                this.idCounter = Math.max(0, ...data.map((a: Agendamento) => a.id)) + 1;
                return;
            }
        } catch (e) {
            console.error('Error loading data from localStorage', e);
        }

        this.agendamentos.set(this.getDefaultAgendamentos());
        this.idCounter = Math.max(0, ...this.agendamentos().map(a => a.id)) + 1;
    }

    private saveData(): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.agendamentos()));
        } catch (e) {
            console.error('Error saving data to localStorage', e);
        }
    }

    private getDefaultAgendamentos(): Agendamento[] {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const formatDate = (d: Date): string => {
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        };

        const todayStr = formatDate(today);
        const tomorrowStr = formatDate(tomorrow);

        return [
            {
                id: 1,
                clienteNome: 'Maria Silva',
                profId: 'simone',
                tipoServico: 'Unhas',
                data: todayStr,
                hora: '09:00',
                valor: 180,
                obs: 'Manicure + pedicure',
                status: 'confirmado'
            },
            {
                id: 2,
                clienteNome: 'Ana Ferreira',
                profId: 'elizeth',
                tipoServico: 'Cabelo',
                data: todayStr,
                hora: '10:00',
                valor: 120,
                obs: 'Design de sobrancelha',
                status: 'pendente'
            },
            {
                id: 3,
                clienteNome: 'Carol Santos',
                profId: 'clau',
                tipoServico: 'Estética',
                data: todayStr,
                hora: '11:30',
                valor: 250,
                obs: 'Coloração completa',
                status: 'confirmado'
            },
            {
                id: 4,
                clienteNome: 'Fernanda Lima',
                profId: 'kaylaine',
                tipoServico: 'Auxiliar',
                data: todayStr,
                hora: '14:00',
                valor: 160,
                obs: 'Extensão de cílios',
                status: 'pendente'
            },
            {
                id: 5,
                clienteNome: 'Patrícia Costa',
                profId: 'simone',
                tipoServico: 'Unhas',
                data: tomorrowStr,
                hora: '09:30',
                valor: 110,
                obs: 'Hidratação capilar',
                status: 'confirmado'
            }
        ];
    }

    private getCommissionRate(profId: string): number {
        return this.appointmentsAuthService.getProfissionalById(profId)?.comissaoPercentual ?? 0;
    }

    getCommissionForAppointment(agendamento: Agendamento): number {
        return +(
            agendamento.valor * (this.getCommissionRate(agendamento.profId) / 100)
        ).toFixed(2);
    }

    getTotalCommissionByProfissional(profId: string): number {
        return this.agendamentos()
            .filter(a => a.profId === profId)
            .reduce((sum, appointment) => sum + this.getCommissionForAppointment(appointment), 0);
    }

    getTotalRevenueByProfissional(profId: string): number {
        return this.agendamentos()
            .filter(a => a.profId === profId)
            .reduce((sum, appointment) => sum + appointment.valor, 0);
    }

    getAgendamentos(): Agendamento[] {
        return this.agendamentos();
    }

    getAgendamentosByProfissional(profId: string): Agendamento[] {
        return this.agendamentos().filter(a => a.profId === profId);
    }

    getAgendamentosByData(data: string): Agendamento[] {
        return this.agendamentos().filter(a => a.data === data);
    }

    getAgendamentoById(id: number): Agendamento | undefined {
        return this.agendamentos().find(a => a.id === id);
    }

    addAgendamento(agendamento: Omit<Agendamento, 'id'>): Agendamento {
        const newAppt: Agendamento = {
            ...agendamento,
            id: this.idCounter++
        };
        this.agendamentos.set([...this.agendamentos(), newAppt]);
        this.saveData();
        return newAppt;
    }

    updateAgendamento(id: number, agendamento: Partial<Agendamento>): Agendamento | null {
        const index = this.agendamentos().findIndex(a => a.id === id);
        if (index === -1) return null;

        const updated: Agendamento = { ...this.agendamentos()[index], ...agendamento };
        const updated_list = [...this.agendamentos()];
        updated_list[index] = updated;
        this.agendamentos.set(updated_list);
        this.saveData();
        return updated;
    }

    deleteAgendamento(id: number): boolean {
        const filtered = this.agendamentos().filter(a => a.id !== id);
        if (filtered.length === this.agendamentos().length) return false;

        this.agendamentos.set(filtered);
        this.saveData();
        return true;
    }

    clearAll(): void {
        this.agendamentos.set([]);
        localStorage.removeItem(this.STORAGE_KEY);
    }
}
