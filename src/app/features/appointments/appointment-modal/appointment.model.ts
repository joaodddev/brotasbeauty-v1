export interface Appointment {

    id: number;
    clienteNome: string;
    profId: number;
    data: string;
    hora: string;
    status: string;
    valor?: number;
    observacoes?: string;
}