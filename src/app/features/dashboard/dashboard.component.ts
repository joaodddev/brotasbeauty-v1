import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../layout/header/header.component';
import { AppointmentsService } from '../../core/services/appointments.service';
import { AuthService } from '../../core/services/auth.service';
import { ModalService } from '../../shared/services/modal.service';
import { Agendamento, Profissional } from '../../shared/models';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, HeaderComponent],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
    private appointmentsService = inject(AppointmentsService);
    private authService = inject(AuthService);
    private modalService = inject(ModalService);

    currentUser = this.authService.currentUser;
    agendamentos = signal<Agendamento[]>([]);

    today = new Date().toISOString().split('T')[0];

    statToday = computed(() => this.getAppointmentsByDate(this.today).length);
    statConfirmados = computed(() =>
        this.getAppointmentsByDate(this.today).filter(a => a.status === 'confirmado').length
    );
    statPendentes = computed(() =>
        this.appointmentsService.getAgendamentos().filter(a => a.status === 'pendente').length
    );
    statSemana = computed(() => this.getWeeklyAppointments().length);

    upcomingAppointments = computed(() => this.getUpcomingAppointments());
    professionalsToday = computed(() => this.getProfessionalsToday());

    ngOnInit(): void {
        this.agendamentos.set(this.appointmentsService.getAgendamentos());
    }

    get userFirstName(): string {
        return this.currentUser()?.nome.split(' ')[0] ?? '';
    }

    private getAppointmentsByDate(date: string): Agendamento[] {
        const appointments = this.appointmentsService.getAgendamentos();
        if (this.currentUser()?.cargo === 'Administradora') {
            return appointments.filter(a => a.data === date);
        }
        return appointments.filter(a => a.data === date && a.profId === this.currentUser()?.id);
    }

    private getWeeklyAppointments(): Agendamento[] {
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        const appointments = this.appointmentsService.getAgendamentos();
        const filtered = this.currentUser()?.cargo === 'Administradora'
            ? appointments
            : appointments.filter(a => a.profId === this.currentUser()?.id);

        return filtered.filter(a => {
            const apptDate = new Date(a.data + 'T00:00:00');
            return apptDate >= weekStart && apptDate <= weekEnd;
        });
    }

    private getUpcomingAppointments(): Agendamento[] {
        const appointments = this.appointmentsService.getAgendamentos();
        const filtered = this.currentUser()?.cargo === 'Administradora'
            ? appointments
            : appointments.filter(a => a.profId === this.currentUser()?.id);

        return filtered
            .filter(a => a.data >= this.today)
            .sort((a, b) => a.data.localeCompare(b.data) || a.hora.localeCompare(b.hora))
            .slice(0, 6);
    }

    private getProfessionalsToday(): Array<Profissional & { appointmentCount: number }> {
        const authService = this.authService;
        const profs = this.currentUser()?.cargo === 'Administradora'
            ? authService.getProfissionaisList()
            : [this.currentUser() as Profissional];

        return profs.map(p => ({
            ...p,
            appointmentCount: this.appointmentsService
                .getAgendamentos()
                .filter(a => a.profId === p.id && a.data === this.today).length
        }));
    }

    formatDate(date: string): string {
        if (!date) return '';
        const [year, month, day] = date.split('-');
        return `${day}/${month}/${year}`;
    }

    getProfissionalById(id: string) {
        return this.authService.getProfissionalById(id);
    }

    getInitials(nome: string): string {
        return nome.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    }

    isToday(date: string): boolean {
        return date === this.today;
    }

    onNewAppointment(): void {
        this.modalService.openNewAppointment();
    }

    onEditAppointment(id: number): void {
        const appt = this.appointmentsService.getAgendamentoById(id);
        if (appt) {
            this.modalService.openEditAppointment(appt);
        }
    }
}