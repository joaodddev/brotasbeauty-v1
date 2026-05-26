# Brotas Beauty Backend

Backend simples para o projeto Brotas Beauty.

## O que tem
- API Express para login e CRUD de agendamentos
- Persistência SQLite em `backend/data/brotasbeauty.sqlite`
- Autenticação JWT para proteger os endpoints
- Regras básicas de permissão:
  - `Profissional` só pode criar/editar/excluir agendamentos para si
  - `Administradora` pode gerenciar tudo

## Como rodar

No diretório `backend`:

```bash
cd backend
npm install
npm start
```

A API ficará disponível em `http://localhost:4000`.

## Endpoints

- `POST /api/auth/login` - login com `username` e `password`
- `GET /api/me` - dados do usuário atual
- `GET /api/profissionais` - lista de profissionais
- `GET /api/agendamentos` - lista de agendamentos
- `POST /api/agendamentos` - cria agendamento
- `PUT /api/agendamentos/:id` - atualiza agendamento
- `DELETE /api/agendamentos/:id` - exclui agendamento

### Auth

Adicione o header:

```
Authorization: Bearer <token>
```

## Notas

- O banco é criado automaticamente ao iniciar o servidor.
- Para mudar o segredo JWT, defina `JWT_SECRET`.
