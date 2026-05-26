import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentsService } from '../../../core/services/appointments.service';
import { AuthService } from '../../../core/services/auth.service';
import { ModalService } from '../../services/modal.service';
import { Agendamento } from '../../../shared/models';

@Component({
    selector: 'app-appointment-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './appointment-modal.component.html',
    styleUrl: './appointment-modal.component.css'
})
export class AppointmentModalComponent {
    private appointmentsService = inject(AppointmentsService);
    private authService = inject(AuthService);
    private modalService = inject(ModalService);

    modalState = this.modalService.modalState;

    clientName = signal('');
    profId = signal('');
    tipoServico = signal<'Cabelo' | 'Unhas' | 'Estética' | 'Auxiliar' | 'Outros'>('Cabelo');
    status = signal<'pendente' | 'confirmado' | 'finalizado' | 'cancelado'>('pendente');
    date = signal('');
    time = signal('');
    valor = signal(120);
    observations = signal('');

    profissionaisList = this.authService.getProfissionaisList();
    currentUser = this.authService.currentUser;

    private ALL_SERVICES: string[] = ['Cabelo', 'Unhas', 'Estética', 'Auxiliar', 'Outros'];

    ngOnInit(): void {
        this.updateFormFromModal();
    }

    ngOnChanges(): void {
        this.updateFormFromModal();
    }

    private updateFormFromModal(): void {
        const state = this.modalState();

        if (state.agendamento) {
            // Editing mode
            this.clientName.set(state.agendamento.clienteNome);
            this.profId.set(state.agendamento.profId);
            this.tipoServico.set(state.agendamento.tipoServico);
            this.status.set(state.agendamento.status);
            this.date.set(state.agendamento.data);
            this.time.set(state.agendamento.hora);
            this.valor.set(state.agendamento.valor);
            this.observations.set(state.agendamento.obs);
        } else {
            // New appointment mode
            const today = new Date().toISOString().split('T')[0];
            this.clientName.set('');
            // Determine default professional: prefilled -> currentUser if professional -> first profissional
            const prefilledProf = state.preFilledData?.profId;
            let defaultProf = '';
            if (prefilledProf) {
                defaultProf = prefilledProf;
            } else if (this.currentUser() && this.currentUser()!.cargo === 'Profissional') {
                defaultProf = this.currentUser()!.id || '';
            } else {
                defaultProf = this.profissionaisList[0]?.id || '';
            }
            this.profId.set(defaultProf);
            this.tipoServico.set('Cabelo');
            this.status.set('pendente');
            this.date.set(state.preFilledData?.data || today);
            this.time.set(state.preFilledData?.hora || '09:00');
            this.valor.set(state.preFilledData?.valor ?? 120);
            this.observations.set('');
        }
    }

    onModalStateChange(): void {
        if (this.modalState().isOpen) {
            this.updateFormFromModal();
        }
    }

    getCurrentCommissionRate(): number {
        return this.profissionaisList.find(p => p.id === this.profId())?.comissaoPercentual ?? 0;
    }

    getServiceOptions(): string[] {
        const user = this.currentUser();
        if (user && user.cargo === 'Administradora') return this.ALL_SERVICES;

        const prof = this.profissionaisList.find(p => p.id === this.profId());
        if (prof && prof.servicos && prof.servicos.length) return prof.servicos;

        return this.ALL_SERVICES;
    }

    isAdminUser(): boolean {
        const u = this.currentUser();
        return !!u && u.cargo === 'Administradora';
    }

    getProfNameById(id: string): string {
        return this.profissionaisList.find(p => p.id === id)?.nome || '';
    }

    getEstimatedCommission(): number {
        return +(this.valor() * (this.getCurrentCommissionRate() / 100)).toFixed(2);
    }

    save(): void {
        if (!this.clientName().trim()) {
            this.showToast('⚠️ Informe o nome do cliente');
            return;
        }

        if (this.tipoServico().trim().length === 0) {
            this.showToast('⚠️ Selecione o tipo de serviço');
            return;
        }

        if (this.valor() <= 0) {
            this.showToast('⚠️ Informe um valor válido para o serviço');
            return;
        }

        const agendamento: Omit<Agendamento, 'id'> = {
            clienteNome: this.clientName().trim(),
            profId: this.profId(),
            tipoServico: this.tipoServico(),
            status: this.status(),
            data: this.date(),
            hora: this.time(),
            valor: this.valor(),
            obs: this.observations()
        };

        if (this.modalState().agendamento) {
            // Update
            this.appointmentsService.updateAgendamento(
                this.modalState().agendamento!.id,
                agendamento
            );
            this.showToast('✅ Agendamento atualizado!');
        } else {
            // Create
            this.appointmentsService.addAgendamento(agendamento);
            this.showToast('✅ Agendamento criado!');
        }

        this.closeModal();
    }

    delete(): void {
        if (!this.modalState().agendamento) return;

        const confirmed = confirm('Tem certeza que deseja excluir este agendamento?');
        if (confirmed) {
            this.appointmentsService.deleteAgendamento(this.modalState().agendamento!.id);
            this.showToast('🗑️ Agendamento excluído');
            this.closeModal();
        }
    }

    closeModal(): void {
        this.modalService.closeModal();
    }

    private showToast(message: string): void {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = message;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }
    }

    isEditing(): boolean {
        return !!this.modalState().agendamento;
    }
}
