export interface Profissional {
    id: string;
    nome: string;
    login: string;
    senha: string;
    cargo: 'Profissional' | 'Administradora';
    cor: string;
    comissaoPercentual: number;
    servicos: string[];
}

export interface Agendamento {
    id: number;
    clienteNome: string;
    profId: string;
    tipoServico: 'Cabelo' | 'Unhas' | 'Estética' | 'Auxiliar' | 'Outros';
    data: string;
    hora: string;
    valor: number;
    obs: string;
    status: 'pendente' | 'confirmado' | 'finalizado' | 'cancelado';
}

export interface User {
    id: string;
    nome: string;
    login: string;
    cargo: 'Profissional' | 'Administradora';
    cor: string;
}
