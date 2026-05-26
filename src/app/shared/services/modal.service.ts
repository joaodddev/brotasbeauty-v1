import { Injectable, signal } from '@angular/core';
import { Agendamento } from '../models';

export interface ModalState {
    isOpen: boolean;
    agendamento: Agendamento | null;
    preFilledData?: {
        data?: string;
        hora?: string;
        profId?: string;
        valor?: number;
    };
}

@Injectable({
    providedIn: 'root'
})
export class ModalService {
    modalState = signal<ModalState>({
        isOpen: false,
        agendamento: null
    });

    openNewAppointment(preFilledData?: { data?: string; hora?: string; profId?: string; valor?: number }): void {
        this.modalState.set({
            isOpen: true,
            agendamento: null,
            preFilledData
        });
    }

    openEditAppointment(agendamento: Agendamento): void {
        this.modalState.set({
            isOpen: true,
            agendamento
        });
    }

    closeModal(): void {
        this.modalState.set({
            isOpen: false,
            agendamento: null
        });
    }
}
