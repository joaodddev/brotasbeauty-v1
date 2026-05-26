import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../layout/header/header.component';
import { AppointmentsService } from '../../../core/services/appointments.service';
import { AuthService } from '../../../core/services/auth.service';
import { ModalService } from '../../../shared/services/modal.service';
import { Agendamento } from '../../../shared/models';

@Component({
    selector: 'app-agenda',
    standalone: true,
    imports: [CommonModule, HeaderComponent],
    templateUrl: './agenda.component.html',
    styleUrl: './agenda.component.css'
})
export class AgendaComponent {
    private appointmentsService = inject(AppointmentsService);
    private authService = inject(AuthService);
    private modalService = inject(ModalService);

    currentUser = this.authService.currentUser;
    currentMonth = signal(new Date());
    currentView = signal<'cal' | 'day'>('cal');
    filterProf = signal('all');

    today = new Date().toISOString().split('T')[0];

    months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    monthLabel = computed(() => {
        const month = this.currentMonth();
        return `${this.months[month.getMonth()]} ${month.getFullYear()}`;
    });

    profissionaisList = computed(() => {
        return this.currentUser()?.cargo === 'Administradora'
            ? this.authService.getProfissionaisList()
            : [];
    });

    calendarDays = computed(() => this.generateCalendarDays());
    filterChips = computed(() => this.generateFilterChips());

    ngOnInit(): void {
        this.renderAgenda();
    }

    changeMonth(direction: number): void {
        const month = this.currentMonth();
        this.currentMonth.set(
            new Date(month.getFullYear(), month.getMonth() + direction, 1)
        );
    }

    setView(view: 'cal' | 'day'): void {
        this.currentView.set(view);
    }

    setFilter(profId: string): void {
        this.filterProf.set(profId);
    }

    private renderAgenda(): void {
        // Trigger computed values
    }

    private generateCalendarDays() {
        const year = this.currentMonth().getFullYear();
        const month = this.currentMonth().getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days = [];
        let currentDate = new Date(startDate);

        while (currentDate <= lastDay || currentDate.getDay() !== 0) {
            days.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
            if (days.length >= 42) break;
        }

        return days.map(d => ({
            date: d,
            dateStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
            isCurrentMonth: d.getMonth() === month,
            isToday: d.toISOString().split('T')[0] === this.today,
            appointments: this.getAppointmentsForDate(d)
        }));
    }

    private getAppointmentsForDate(date: Date): Agendamento[] {
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        let appointments = this.appointmentsService.getAgendamentos();

        if (this.filterProf() !== 'all') {
            appointments = appointments.filter(a => a.profId === this.filterProf());
        }

        if (this.currentUser()?.cargo !== 'Administradora') {
            appointments = appointments.filter(a => a.profId === this.currentUser()?.id);
        }

        return appointments.filter(a => a.data === dateStr).sort((a, b) => a.hora.localeCompare(b.hora));
    }

    private generateFilterChips() {
        const chips = [{ id: 'all', nome: 'Todas' }];
        if (this.currentUser()?.cargo === 'Administradora') {
            chips.push(...this.authService.getProfissionaisList());
        }
        return chips;
    }

    onCellClick(dateStr: string): void {
        this.modalService.openNewAppointment({ data: dateStr });
    }

    onAppointmentClick(id: number, event: Event): void {
        event.stopPropagation();
        const appt = this.appointmentsService.getAgendamentoById(id);
        if (appt) {
            this.modalService.openEditAppointment(appt);
        }
    }

    onNewAppointment(): void {
        this.modalService.openNewAppointment();
    }

    getProfissionalById(id: string) {
        return this.authService.getProfissionalById(id);
    }

    formatDate(dateStr: string): string {
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    }

    getMoreCount(appointments: Agendamento[]): number {
        return Math.max(0, appointments.length - 3);
    }
}
