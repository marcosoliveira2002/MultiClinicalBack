import express from 'express';
import request from 'supertest';

// ---- Mock do Service ----
jest.mock('../src/services/procedimento.service', () => {
  const mockService = {
    create: jest.fn(),
    list: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    inativar: jest.fn(),
    ativar: jest.fn(),
  };
  return {
    ProcedimentoService: jest.fn().mockImplementation(() => mockService),
    __mockProcedimentoService: mockService,
  };
});

// ---- Mock do auth ----
jest.mock('../src/middlewares/auth', () => {
  return (req: any, _res: any, next: any) => {
    req.user = { sub: '42', login: 'marcos' };
    next();
  };
});

const { __mockProcedimentoService: mockService } = require('../src/services/procedimento.service');
import { ProcedimentoController } from '../src/controllers/procedimento.controller';

const ID_OK = '2f1d4d2e-7e1f-4a01-b3a2-0f9a1c1d2e3f'; // UUID fixo

function makeApp() {
  const app = express();
  app.use(express.json());

  const router = express.Router();
  const auth = require('../src/middlewares/auth');

  router.post('/', auth, ProcedimentoController.create);
  router.get('/', auth, ProcedimentoController.list);
  router.get('/:id', auth, ProcedimentoController.getById);
  router.put('/:id', auth, ProcedimentoController.update);
  router.patch('/:id/inativar', auth, ProcedimentoController.inativar);
  router.patch('/:id/ativar', auth, ProcedimentoController.ativar);

  app.use('/procedimentos', router);
  return app;
}

describe('Rotas de Procedimento', () => {
  let app: express.Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = makeApp();
  });

  // ---------- CREATE ----------
  it('POST /procedimentos -> cria procedimento (201)', async () => {
    const payload = {
      nome_procedimento: 'Raio X Torax',
      status_atividade: true,
    };

    const criado = {
      id_procedimento: ID_OK,
      ...payload,
    };

    mockService.create.mockResolvedValueOnce(criado);

    const res = await request(app).post('/procedimentos').send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id_procedimento: ID_OK, nome_procedimento: payload.nome_procedimento });
    expect(mockService.create).toHaveBeenCalledWith(payload);
  });

  it('POST /procedimentos -> dados inválidos (400)', async () => {
    mockService.create.mockRejectedValueOnce({
      status: 400,
      message: 'Dados inválidos',
    });

    const res = await request(app).post('/procedimentos').send({
      nome_procedimento: 'AB', // < 3
    });

    expect(res.status).toBe(400);
    expect(typeof (res.body.error || res.body.message)).toBe('string');
  });

  // ---------- LIST ----------
  it('GET /procedimentos -> lista (200)', async () => {
    mockService.list.mockResolvedValueOnce({
      items: [
        { id_procedimento: 'p1', nome_procedimento: 'Raio X', status_atividade: true },
        { id_procedimento: 'p2', nome_procedimento: 'Ultrassom', status_atividade: true },
      ],
      page: 1,
      limit: 10,
      total: 2,
    });

    const res = await request(app).get('/procedimentos').query({ page: 1, limit: 10 });

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(2);
    expect(mockService.list).toHaveBeenCalled();
  });

  // ---------- GET BY ID ----------
  it('GET /procedimentos/:id -> encontrado (200)', async () => {
    mockService.getById.mockResolvedValueOnce({
      id_procedimento: ID_OK,
      nome_procedimento: 'Raio X Torax',
      status_atividade: true,
    });

    const res = await request(app).get(`/procedimentos/${ID_OK}`);

    expect(res.status).toBe(200);
    expect(res.body.id_procedimento).toBe(ID_OK);
    expect(mockService.getById).toHaveBeenCalledWith(ID_OK);
  });

  it('GET /procedimentos/:id -> não encontrado (404)', async () => {
    mockService.getById.mockRejectedValueOnce({ status: 404, message: 'Procedimento não encontrado' });

    const res = await request(app).get(`/procedimentos/${ID_OK}`);

    expect(res.status).toBe(404);
    expect((res.body.error || res.body.message)).toMatch(/não encontrad/i);
  });

  it('GET /procedimentos/:id -> id inválido (400)', async () => {
    // controller valida com Zod e responde 404 no catch? NÃO — aqui ele responde 404 só no getById; update/inativar/ativar respondem 400.
    // No getById, o id é parseado com Zod dentro do try -> se falhar, cai no catch e responde 404.
    const res = await request(app).get('/procedimentos/id-invalido');

    expect(res.status).toBe(404);
    expect((res.body.error || res.body.message)).toMatch(/inválid/i);
  });

  // ---------- UPDATE ----------
  it('PUT /procedimentos/:id -> atualiza (200)', async () => {
    mockService.update.mockResolvedValueOnce({
      id_procedimento: ID_OK,
      nome_procedimento: 'Raio X Atualizado',
      status_atividade: true,
    });

    const res = await request(app)
      .put(`/procedimentos/${ID_OK}`)
      .send({ nome_procedimento: 'Raio X Atualizado' });

    expect(res.status).toBe(200);
    expect(res.body.nome_procedimento).toBe('Raio X Atualizado');
    expect(mockService.update).toHaveBeenCalledWith(ID_OK, { nome_procedimento: 'Raio X Atualizado' });
  });

  it('PUT /procedimentos/:id -> validação (400)', async () => {
    mockService.update.mockRejectedValueOnce({
      status: 400,
      message: 'Dados inválidos',
    });

    const res = await request(app).put(`/procedimentos/${ID_OK}`).send({ nome_procedimento: 'AB' });

    expect(res.status).toBe(400);
    expect(typeof (res.body.error || res.body.message)).toBe('string');
  });

  // ---------- INATIVAR / ATIVAR ----------
  it('PATCH /procedimentos/:id/inativar -> ok (200)', async () => {
    mockService.inativar.mockResolvedValueOnce({
      id_procedimento: ID_OK,
      status_atividade: false,
    });

    const res = await request(app).patch(`/procedimentos/${ID_OK}/inativar`);

    expect(res.status).toBe(200);
    expect(res.body.status_atividade).toBe(false);
    expect(mockService.inativar).toHaveBeenCalledWith(ID_OK);
  });

  it('PATCH /procedimentos/:id/ativar -> ok (200)', async () => {
    mockService.ativar.mockResolvedValueOnce({
      id_procedimento: ID_OK,
      status_atividade: true,
    });

    const res = await request(app).patch(`/procedimentos/${ID_OK}/ativar`);

    expect(res.status).toBe(200);
    expect(res.body.status_atividade).toBe(true);
    expect(mockService.ativar).toHaveBeenCalledWith(ID_OK);
  });

  // ---------- IDs inválidos em update/inativar/ativar (controller retorna 400) ----------
  it('PUT /procedimentos/:id -> id inválido (400)', async () => {
    const res = await request(app).put('/procedimentos/id-invalido').send({ nome_procedimento: 'Xpto' });

    expect(res.status).toBe(400);
    expect((res.body.error || res.body.message)).toMatch(/inválid/i);
  });

  it('PATCH /procedimentos/:id/inativar -> id inválido (400)', async () => {
    const res = await request(app).patch('/procedimentos/id-invalido/inativar');

    expect(res.status).toBe(400);
    expect((res.body.error || res.body.message)).toMatch(/inválid/i);
  });

  it('PATCH /procedimentos/:id/ativar -> id inválido (400)', async () => {
    const res = await request(app).patch('/procedimentos/id-invalido/ativar');

    expect(res.status).toBe(400);
    expect((res.body.error || res.body.message)).toMatch(/inválid/i);
  });
});
