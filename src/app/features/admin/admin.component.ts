import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../layout/header/header.component';
import { AppointmentsService } from '../../core/services/appointments.service';
import { AuthService } from '../../core/services/auth.service';
import { ModalService } from '../../shared/services/modal.service';
import { Agendamento, Profissional } from '../../shared/models';

@Component({
    selector: 'app-admin',
    standalone: true,
    imports: [CommonModule, HeaderComponent, FormsModule],
    templateUrl: './admin.component.html',
    styleUrl: './admin.component.css'
})
export class AdminComponent {
    private appointmentsService = inject(AppointmentsService);
    private authService = inject(AuthService);
    private modalService = inject(ModalService);

    currentUser = this.authService.currentUser;
    profissionaisList = this.authService.getProfissionaisList();
    filterProfId = signal('');
    agendamentos = signal<Agendamento[]>([]);

    ngOnInit(): void {
        this.updateAppointmentsList();
    }

    private updateAppointmentsList(): void {
        let appointments = this.appointmentsService.getAgendamentos();

        if (this.filterProfId()) {
            appointments = appointments.filter(a => a.profId === this.filterProfId());
        }

        appointments.sort((a, b) =>
            b.data.localeCompare(a.data) || a.hora.localeCompare(b.hora)
        );

        this.agendamentos.set(appointments);
    }

    onFilterChange(): void {
        this.updateAppointmentsList();
    }

    getProfissionalById(id: string): Profissional | undefined {
        return this.authService.getProfissionalById(id);
    }

    getInitials(nome: string): string {
        return nome.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    }

    formatDate(dateStr: string): string {
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    }

    getStatusBadgeClass(status: string): string {
        return `status-${status}`;
    }

    getTodayCount(profId: string): number {
        const today = new Date().toISOString().split('T')[0];
        return this.appointmentsService
            .getAgendamentos()
            .filter(a => a.profId === profId && a.data === today).length;
    }

    getTotalCount(profId: string): number {
        return this.appointmentsService
            .getAgendamentos()
            .filter(a => a.profId === profId).length;
    }

    getTotalRevenue(profId: string): number {
        return this.appointmentsService.getTotalRevenueByProfissional(profId);
    }

    getTotalCommission(profId: string): number {
        return this.appointmentsService.getTotalCommissionByProfissional(profId);
    }

    getAppointmentCommission(agendamento: Agendamento): number {
        return this.appointmentsService.getCommissionForAppointment(agendamento);
    }

    onEditAppointment(id: number): void {
        const appt = this.appointmentsService.getAgendamentoById(id);
        if (appt) {
            this.modalService.openEditAppointment(appt);
        }
    }

    onNewAppointment(): void {
        this.modalService.openNewAppointment();
    }
}
