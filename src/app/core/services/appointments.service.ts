import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Agendamento } from '../../shared/models';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class AppointmentsService {
    private appointmentsAuthService = inject(AuthService);
    private http = inject(HttpClient);
    private agendamentos = signal<Agendamento[]>([]);
    private idCounter = 0;
    private readonly API_URL = 'https://brotasbeauty-backend.onrender.com/api';

    constructor() {
        void this.loadData();
    }

    private getAuthHeaders(): { headers: HttpHeaders } {
        const token = this.appointmentsAuthService.getToken();
        return token
            ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
            : { headers: new HttpHeaders() };
    }

    async loadData(): Promise<void> {
        if (!this.appointmentsAuthService.getToken()) {
            this.agendamentos.set([]);
            this.idCounter = 0;
            return;
        }

        try {
            const appts = await firstValueFrom(
                this.http.get<Agendamento[]>(`${this.API_URL}/agendamentos`, this.getAuthHeaders())
            );
            this.agendamentos.set(appts);
            this.idCounter = Math.max(0, ...appts.map(a => a.id)) + 1;
        } catch (error) {
            console.error('Erro carregando agendamentos', error);
            this.agendamentos.set([]);
            this.idCounter = 0;
        }
    }

    async refresh(): Promise<void> {
        await this.loadData();
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

    async addAgendamento(agendamento: Omit<Agendamento, 'id'>): Promise<Agendamento> {
        const newAppt = await firstValueFrom(
            this.http.post<Agendamento>(`${this.API_URL}/agendamentos`, agendamento, this.getAuthHeaders())
        );
        this.agendamentos.set([...this.agendamentos(), newAppt]);
        this.idCounter = Math.max(this.idCounter, newAppt.id + 1);
        return newAppt;
    }

    async updateAgendamento(id: number, agendamento: Partial<Agendamento>): Promise<Agendamento | null> {
        try {
            const updated = await firstValueFrom(
                this.http.put<Agendamento>(`${this.API_URL}/agendamentos/${id}`, agendamento, this.getAuthHeaders())
            );
            const list = [...this.agendamentos()];
            const index = list.findIndex(a => a.id === id);
            if (index !== -1) {
                list[index] = updated;
                this.agendamentos.set(list);
            }
            return updated;
        } catch (error) {
            console.error('Erro atualizando agendamento', error);
            return null;
        }
    }

    async deleteAgendamento(id: number): Promise<boolean> {
        try {
            await firstValueFrom(this.http.delete<void>(`${this.API_URL}/agendamentos/${id}`, this.getAuthHeaders()));
            this.agendamentos.set(this.agendamentos().filter(a => a.id !== id));
            return true;
        } catch (error) {
            console.error('Erro excluindo agendamento', error);
            return false;
        }
    }

    clearAll(): void {
        this.agendamentos.set([]);
    }
}
