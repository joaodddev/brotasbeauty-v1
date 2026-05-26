import path from 'path';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'brotas-beauty-secret';
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'brotasbeauty.sqlite');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

async function startServer() {
    const db = await open({ filename: DB_FILE, driver: sqlite3.Database });

    await db.exec(`CREATE TABLE IF NOT EXISTS profissionais (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  login TEXT NOT NULL UNIQUE,
  senha TEXT NOT NULL,
  cargo TEXT NOT NULL,
  cor TEXT NOT NULL,
  comissaoPercentual INTEGER NOT NULL,
  servicos TEXT NOT NULL
)`);

    await db.exec(`CREATE TABLE IF NOT EXISTS agendamentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clienteNome TEXT NOT NULL,
  profId TEXT NOT NULL,
  tipoServico TEXT NOT NULL,
  data TEXT NOT NULL,
  hora TEXT NOT NULL,
  valor REAL NOT NULL,
  obs TEXT,
  status TEXT NOT NULL,
  FOREIGN KEY(profId) REFERENCES profissionais(id)
)`);

    const profissionais = [
        {
            id: 'simone',
            nome: 'Simone',
            login: 'simone',
            senha: '123',
            cargo: 'Profissional',
            cor: '#c9a18b',
            comissaoPercentual: 40,
            servicos: ['Unhas']
        },
        {
            id: 'elizeth',
            nome: 'Elizeth',
            login: 'elizeth',
            senha: '123',
            cargo: 'Profissional',
            cor: '#e8aebf',
            comissaoPercentual: 70,
            servicos: ['Cabelo']
        },
        {
            id: 'clau',
            nome: 'Clau',
            login: 'clau',
            senha: '123',
            cargo: 'Profissional',
            cor: '#8c4a4a',
            comissaoPercentual: 50,
            servicos: ['Estética']
        },
        {
            id: 'kaylaine',
            nome: 'Kaylaine',
            login: 'kaylaine',
            senha: '123',
            cargo: 'Profissional',
            cor: '#b07a9a',
            comissaoPercentual: 5,
            servicos: ['Auxiliar']
        },
        {
            id: 'admin',
            nome: 'Administradora',
            login: 'admin',
            senha: 'admin',
            cargo: 'Administradora',
            cor: '#5a7a8c',
            comissaoPercentual: 0,
            servicos: []
        }
    ];

    const initialAppointments = [
        {
            clienteNome: 'Maria Silva',
            profId: 'simone',
            tipoServico: 'Unhas',
            data: '2026-05-25',
            hora: '09:00',
            valor: 180,
            obs: 'Manicure + pedicure',
            status: 'confirmado'
        },
        {
            clienteNome: 'Ana Ferreira',
            profId: 'elizeth',
            tipoServico: 'Cabelo',
            data: '2026-05-25',
            hora: '10:00',
            valor: 120,
            obs: 'Design de sobrancelha',
            status: 'pendente'
        },
        {
            clienteNome: 'Carol Santos',
            profId: 'clau',
            tipoServico: 'Estética',
            data: '2026-05-25',
            hora: '11:30',
            valor: 250,
            obs: 'Coloração completa',
            status: 'confirmado'
        },
        {
            clienteNome: 'Fernanda Lima',
            profId: 'kaylaine',
            tipoServico: 'Auxiliar',
            data: '2026-05-25',
            hora: '14:00',
            valor: 160,
            obs: 'Extensão de cílios',
            status: 'pendente'
        }
    ];

    const existingProfessionals = await db.get('SELECT COUNT(*) AS count FROM profissionais');
    if (existingProfessionals.count === 0) {
        const insertProf = await db.prepare(`INSERT INTO profissionais
    (id, nome, login, senha, cargo, cor, comissaoPercentual, servicos)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
        const insertAppointment = await db.prepare(`INSERT INTO agendamentos
    (clienteNome, profId, tipoServico, data, hora, valor, obs, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);

        for (const prof of profissionais) {
            await insertProf.run(
                prof.id,
                prof.nome,
                prof.login,
                prof.senha,
                prof.cargo,
                prof.cor,
                prof.comissaoPercentual,
                JSON.stringify(prof.servicos)
            );
        }

        for (const appt of initialAppointments) {
            await insertAppointment.run(
                appt.clienteNome,
                appt.profId,
                appt.tipoServico,
                appt.data,
                appt.hora,
                appt.valor,
                appt.obs,
                appt.status
            );
        }
    }

    app.use(cors());
    app.use(express.json());

    function sanitizeProfessional(prof) {
        return {
            id: prof.id,
            nome: prof.nome,
            cargo: prof.cargo,
            cor: prof.cor,
            comissaoPercentual: prof.comissaoPercentual,
            servicos: JSON.parse(prof.servicos)
        };
    }

    function authenticateToken(req, res, next) {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ message: 'Token não fornecido' });

        const token = authHeader.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Token inválido' });

        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) return res.status(403).json({ message: 'Token expirado ou inválido' });
            req.user = user;
            next();
        });
    }

    app.post('/api/auth/login', (req, res) => {
        const { username, password } = req.body;
        const prof = profissionais.find(p => p.login === username && p.senha === password);

        if (!prof) {
            return res.status(401).json({ message: 'Usuário ou senha incorretos' });
        }

        const user = {
            id: prof.id,
            nome: prof.nome,
            cargo: prof.cargo,
            cor: prof.cor
        };

        const token = jwt.sign(user, JWT_SECRET, { expiresIn: '8h' });
        res.json({ token, user });
    });

    app.get('/api/profissionais', authenticateToken, async (req, res) => {
        const rows = await db.all('SELECT * FROM profissionais WHERE cargo = ?', 'Profissional');
        res.json(rows.map(sanitizeProfessional));
    });

    app.get('/api/agendamentos', authenticateToken, async (req, res) => {
        const { profId, data } = req.query;
        let query = 'SELECT * FROM agendamentos';
        const params = [];

        if (profId || data) {
            const parts = [];
            if (profId) {
                parts.push('profId = ?');
                params.push(profId);
            }
            if (data) {
                parts.push('data = ?');
                params.push(data);
            }
            query += ` WHERE ${parts.join(' AND ')}`;
        }

        const appointments = await db.all(query, ...params);
        res.json(appointments);
    });

    app.post('/api/agendamentos', authenticateToken, async (req, res) => {
        const payload = req.body;
        const user = req.user;

        if (!payload.clienteNome || !payload.profId || !payload.tipoServico || !payload.data || !payload.hora || payload.valor == null) {
            return res.status(400).json({ message: 'Dados incompletos do agendamento' });
        }

        if (user.cargo === 'Profissional' && user.id !== payload.profId) {
            return res.status(403).json({ message: 'Profissional só pode criar agendamentos para si' });
        }

        const result = await db.run(`INSERT INTO agendamentos
    (clienteNome, profId, tipoServico, data, hora, valor, obs, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            payload.clienteNome,
            payload.profId,
            payload.tipoServico,
            payload.data,
            payload.hora,
            payload.valor,
            payload.obs || '',
            payload.status || 'pendente'
        );

        const inserted = await db.get('SELECT * FROM agendamentos WHERE id = ?', result.lastID);
        res.status(201).json(inserted);
    });

    app.put('/api/agendamentos/:id', authenticateToken, async (req, res) => {
        const id = Number(req.params.id);
        const payload = req.body;
        const appointment = await db.get('SELECT * FROM agendamentos WHERE id = ?', id);

        if (!appointment) return res.status(404).json({ message: 'Agendamento não encontrado' });
        if (req.user.cargo === 'Profissional' && req.user.id !== appointment.profId) {
            return res.status(403).json({ message: 'Profissional só pode editar seus próprios agendamentos' });
        }

        await db.run(`UPDATE agendamentos SET
    clienteNome = ?,
    profId = ?,
    tipoServico = ?,
    data = ?,
    hora = ?,
    valor = ?,
    obs = ?,
    status = ?
    WHERE id = ?`,
            payload.clienteNome || appointment.clienteNome,
            payload.profId || appointment.profId,
            payload.tipoServico || appointment.tipoServico,
            payload.data || appointment.data,
            payload.hora || appointment.hora,
            payload.valor != null ? payload.valor : appointment.valor,
            payload.obs != null ? payload.obs : appointment.obs,
            payload.status || appointment.status,
            id
        );

        const updated = await db.get('SELECT * FROM agendamentos WHERE id = ?', id);
        res.json(updated);
    });

    app.delete('/api/agendamentos/:id', authenticateToken, async (req, res) => {
        const id = Number(req.params.id);
        const appointment = await db.get('SELECT * FROM agendamentos WHERE id = ?', id);
        if (!appointment) return res.status(404).json({ message: 'Agendamento não encontrado' });
        if (req.user.cargo === 'Profissional' && req.user.id !== appointment.profId) {
            return res.status(403).json({ message: 'Profissional só pode excluir seus próprios agendamentos' });
        }
        await db.run('DELETE FROM agendamentos WHERE id = ?', id);
        res.status(204).send();
    });

    app.get('/api/me', authenticateToken, (req, res) => {
        res.json(req.user);
    });

    app.listen(PORT, () => {
        console.log(`Backend running on http://localhost:${PORT}`);
    });
}

startServer().catch(err => {
    console.error('Erro ao iniciar backend:', err);
    process.exit(1);
});
