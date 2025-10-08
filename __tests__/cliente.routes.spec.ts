import express from 'express';
import request from 'supertest';

// Mock do Service
jest.mock('../src/services/cliente.service', () => {
    const mockService = {
        create: jest.fn(),
        list: jest.fn(),
        getById: jest.fn(),
        update: jest.fn(),
        inativar: jest.fn(),
        ativar: jest.fn(),
    };
    return {
        ClienteService: jest.fn().mockImplementation(() => mockService),
        __mockClienteService: mockService,
    };
});

// Mock do auth
jest.mock('../src/middlewares/auth', () => {
    return (req: any, _res: any, next: any) => {
        req.user = { sub: '42', login: 'marcos' };
        next();
    };
});

const { __mockClienteService: mockService } = require('../src/services/cliente.service');
import { ClienteController } from '../src/controllers/cliente.controller';

const ID_OK = '2f1d4d2e-7e1f-4a01-b3a2-0f9a1c1d2e3f'; // UUID válido fixo

function makeApp() {
    const app = express();
    app.use(express.json());

    const router = express.Router();
    const auth = require('../src/middlewares/auth');

    router.post('/', auth, ClienteController.create);
    router.get('/', auth, ClienteController.list);
    router.get('/:id', auth, ClienteController.getById);
    router.put('/:id', auth, ClienteController.update);
    router.patch('/:id/inativar', auth, ClienteController.inativar);
    router.patch('/:id/ativar', auth, ClienteController.ativar);

    app.use('/clientes', router);
    return app;
}

describe('Rotas de Clientes', () => {
    let app: express.Express;

    beforeEach(() => {
        jest.clearAllMocks();
        app = makeApp();
    });

    it('POST /clientes -> cria cliente (201)', async () => {
        const payload = {
            nome_cliente: 'Fulano da Silva',
            cpf: '529.982.247-25',           // válido
            data_nascimento: '1995-01-01',   // será coerce p/ Date
            telefone: '67999999999',
            status_atividade: true,
        };

        const criado = {
            id_cliente: ID_OK,
            nome_cliente: payload.nome_cliente,
            cpf: payload.cpf.replace(/\D/g, ''), // se sua service normaliza
            data_nascimento: new Date('1995-01-01').toISOString(),
            telefone: payload.telefone,
            status_atividade: true,
        };

        mockService.create.mockResolvedValueOnce(criado);

        const res = await request(app).post('/clientes').send(payload);

        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({ id_cliente: ID_OK, nome_cliente: 'Fulano da Silva' });

        // o controller envia Date ao service
        expect(mockService.create).toHaveBeenCalledWith(
            expect.objectContaining({
                nome_cliente: payload.nome_cliente,
                cpf: payload.cpf,
                data_nascimento: new Date('1995-01-01'),
                telefone: payload.telefone,
                status_atividade: true,
            })
        );
    });

    it('POST /clientes -> dados inválidos (400)', async () => {
        mockService.create.mockRejectedValueOnce({
            status: 400,
            message: 'Dados inválidos',
            issues: { cpf: { _errors: ['cpf inválido'] } },
        });

        const res = await request(app).post('/clientes').send({
            nome_cliente: 'AB',
            cpf: '00000000000',
            data_nascimento: 'abc',
            telefone: '12',
        });

        expect(res.status).toBe(400);
        expect(res.body.error || res.body.message).toMatch(/inválid/i);
    });

    it('GET /clientes -> lista (200)', async () => {
        mockService.list.mockResolvedValueOnce({
            items: [
                { id_cliente: 'c1', nome_cliente: 'A', cpf: '52998224725', telefone: '11111111' },
                { id_cliente: 'c2', nome_cliente: 'B', cpf: '39053344705', telefone: '22222222' },
            ],
            page: 1,
            limit: 10,
            total: 2,
        });

        const res = await request(app).get('/clientes').query({ page: 1, limit: 10 });

        expect(res.status).toBe(200);
        expect(res.body.items.length).toBe(2);
        expect(mockService.list).toHaveBeenCalled();
    });

    it('GET /clientes/:id -> encontrado (200)', async () => {
        mockService.getById.mockResolvedValueOnce({
            id_cliente: ID_OK,
            nome_cliente: 'Fulano',
            cpf: '52998224725',
            telefone: '67999999999',
            status_atividade: true,
        });

        const res = await request(app).get(`/clientes/${ID_OK}`);

        expect(res.status).toBe(200);
        expect(res.body.id_cliente).toBe(ID_OK);
        expect(mockService.getById).toHaveBeenCalledWith(ID_OK);
    });

    it('GET /clientes/:id -> não encontrado (404)', async () => {
        // usa UUID válido pra passar da validação e cair no service
        mockService.getById.mockRejectedValueOnce({ status: 404, message: 'Cliente não encontrado' });

        const res = await request(app).get(`/clientes/${ID_OK}`);

        expect(res.status).toBe(404);
        expect((res.body.error || res.body.message)).toMatch(/não encontrado/i);
    });

    it('GET /clientes/:id -> id inválido (controller retorna 404)', async () => {
        // id inválido falha no Zod e o controller devolve 404 no catch
        const res = await request(app).get('/clientes/id-invalido');

        expect(res.status).toBe(404);
        expect((res.body.error || res.body.message)).toMatch(/inválid/i);
    });

    it('PUT /clientes/:id -> atualiza (200)', async () => {
        mockService.update.mockResolvedValueOnce({
            id_cliente: ID_OK,
            nome_cliente: 'Fulano Atualizado',
            cpf: '52998224725',
            telefone: '67999999999',
            status_atividade: true,
        });

        const res = await request(app)
            .put(`/clientes/${ID_OK}`)
            .send({ nome_cliente: 'Fulano Atualizado' });

        expect(res.status).toBe(200);
        expect(res.body.nome_cliente).toBe('Fulano Atualizado');
        expect(mockService.update).toHaveBeenCalledWith(ID_OK, { nome_cliente: 'Fulano Atualizado' });
    });

    it('PUT /clientes/:id -> validação (400)', async () => {
        mockService.update.mockRejectedValueOnce({
            status: 400,
            message: 'Dados inválidos',
            issues: { nome_cliente: { _errors: ['mínimo 3 caracteres'] } },
        });

        const res = await request(app).put(`/clientes/${ID_OK}`).send({ nome_cliente: 'A' });

        expect(res.status).toBe(400);
        // O controller retorna { error: err.message } vindo do Zod, ex: "String must contain at least 3 character(s)"
        expect(typeof (res.body.error || res.body.message)).toBe('string');
        expect((res.body.error || res.body.message)).toMatch(/at least 3|mínimo 3|character/i)
    });

    it('PATCH /clientes/:id/inativar -> ok (200)', async () => {
        mockService.inativar.mockResolvedValueOnce({
            id_cliente: ID_OK,
            status_atividade: false,
        });

        const res = await request(app).patch(`/clientes/${ID_OK}/inativar`);

        expect(res.status).toBe(200);
        expect(res.body.status_atividade).toBe(false);
        expect(mockService.inativar).toHaveBeenCalledWith(ID_OK);
    });

    it('PATCH /clientes/:id/ativar -> ok (200)', async () => {
        mockService.ativar.mockResolvedValueOnce({
            id_cliente: ID_OK,
            status_atividade: true,
        });

        const res = await request(app).patch(`/clientes/${ID_OK}/ativar`);

        expect(res.status).toBe(200);
        expect(res.body.status_atividade).toBe(true);
        expect(mockService.ativar).toHaveBeenCalledWith(ID_OK);
    });
});
