import express from 'express';
import request from 'supertest';

// ---- Mock do Service ----
jest.mock('../src/services/tipoAtendimento.service', () => {
  const mockService = {
    create: jest.fn(),
    list: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    inativar: jest.fn(),
    ativar: jest.fn(),
  };
  return {
    TipoAtendimentoService: jest.fn().mockImplementation(() => mockService),
    __mockTipoAtService: mockService,
  };
});

// ---- Mock do auth ----
jest.mock('../src/middlewares/auth', () => {
  return (req: any, _res: any, next: any) => {
    req.user = { sub: '42', login: 'marcos' };
    next();
  };
});

const { __mockTipoAtService: mockService } = require('../src/services/tipoAtendimento.service');
import { TipoAtendimentoController } from '../src/controllers/tipoAtendimento.controller';

const ID_OK = '2f1d4d2e-7e1f-4a01-b3a2-0f9a1c1d2e3f'; // UUID fixo

function makeApp() {
  const app = express();
  app.use(express.json());

  const router = express.Router();
  const auth = require('../src/middlewares/auth');

  router.post('/', auth, TipoAtendimentoController.create);
  router.get('/', auth, TipoAtendimentoController.list);
  router.get('/:id', auth, TipoAtendimentoController.getById);
  router.put('/:id', auth, TipoAtendimentoController.update);
  router.patch('/:id/inativar', auth, TipoAtendimentoController.inativar);
  router.patch('/:id/ativar', auth, TipoAtendimentoController.ativar);

  app.use('/tipos-atendimento', router);
  return app;
}

describe('Rotas de Tipo de Atendimento', () => {
  let app: express.Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = makeApp();
  });

  // ---------- CREATE ----------
  it('POST /tipos-atendimento -> cria (201)', async () => {
    const payload = { nome_tipo_atendimento: 'Consulta', status_atividade: true };
    const criado = { id_tipo_atendimento: ID_OK, ...payload };

    mockService.create.mockResolvedValueOnce(criado);

    const res = await request(app).post('/tipos-atendimento').send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id_tipo_atendimento: ID_OK, nome_tipo_atendimento: 'Consulta' });
    expect(mockService.create).toHaveBeenCalledWith(payload);
  });

  it('POST /tipos-atendimento -> dados inválidos (400)', async () => {
    mockService.create.mockRejectedValueOnce({ status: 400, message: 'Dados inválidos' });

    const res = await request(app).post('/tipos-atendimento').send({ nome_tipo_atendimento: 'AB' });

    expect(res.status).toBe(400);
    expect(typeof (res.body.error || res.body.message)).toBe('string');
  });

  // ---------- LIST ----------
  it('GET /tipos-atendimento -> lista (200)', async () => {
    mockService.list.mockResolvedValueOnce({
      items: [
        { id_tipo_atendimento: 't1', nome_tipo_atendimento: 'Consulta', status_atividade: true },
        { id_tipo_atendimento: 't2', nome_tipo_atendimento: 'Retorno', status_atividade: true },
      ],
      page: 1,
      limit: 10,
      total: 2,
    });

    const res = await request(app).get('/tipos-atendimento').query({ page: 1, limit: 10 });

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(2);
    expect(mockService.list).toHaveBeenCalled();
  });

  // ---------- GET BY ID ----------
  it('GET /tipos-atendimento/:id -> encontrado (200)', async () => {
    mockService.getById.mockResolvedValueOnce({
      id_tipo_atendimento: ID_OK,
      nome_tipo_atendimento: 'Consulta',
      status_atividade: true,
    });

    const res = await request(app).get(`/tipos-atendimento/${ID_OK}`);

    expect(res.status).toBe(200);
    expect(res.body.id_tipo_atendimento).toBe(ID_OK);
    expect(mockService.getById).toHaveBeenCalledWith(ID_OK);
  });

  it('GET /tipos-atendimento/:id -> não encontrado (404)', async () => {
    mockService.getById.mockRejectedValueOnce({ status: 404, message: 'Tipo não encontrado' });

    const res = await request(app).get(`/tipos-atendimento/${ID_OK}`);

    expect(res.status).toBe(404);
    expect((res.body.error || res.body.message)).toMatch(/não encontrad/i);
  });

  it('GET /tipos-atendimento/:id -> id inválido (404 pelo controller)', async () => {
    const res = await request(app).get('/tipos-atendimento/id-invalido');

    expect(res.status).toBe(404);
    expect((res.body.error || res.body.message)).toMatch(/inválid/i);
  });

  // ---------- UPDATE ----------
  it('PUT /tipos-atendimento/:id -> atualiza (200)', async () => {
    mockService.update.mockResolvedValueOnce({
      id_tipo_atendimento: ID_OK,
      nome_tipo_atendimento: 'Consulta Especial',
      status_atividade: true,
    });

    const res = await request(app)
      .put(`/tipos-atendimento/${ID_OK}`)
      .send({ nome_tipo_atendimento: 'Consulta Especial' });

    expect(res.status).toBe(200);
    expect(res.body.nome_tipo_atendimento).toBe('Consulta Especial');
    expect(mockService.update).toHaveBeenCalledWith(ID_OK, { nome_tipo_atendimento: 'Consulta Especial' });
  });

  it('PUT /tipos-atendimento/:id -> validação (400)', async () => {
    mockService.update.mockRejectedValueOnce({ status: 400, message: 'Dados inválidos' });

    const res = await request(app).put(`/tipos-atendimento/${ID_OK}`).send({ nome_tipo_atendimento: 'AB' });

    expect(res.status).toBe(400);
    expect(typeof (res.body.error || res.body.message)).toBe('string');
  });

  // ---------- INATIVAR / ATIVAR ----------
  it('PATCH /tipos-atendimento/:id/inativar -> ok (200)', async () => {
    mockService.inativar.mockResolvedValueOnce({
      id_tipo_atendimento: ID_OK,
      status_atividade: false,
    });

    const res = await request(app).patch(`/tipos-atendimento/${ID_OK}/inativar`);

    expect(res.status).toBe(200);
    expect(res.body.status_atividade).toBe(false);
    expect(mockService.inativar).toHaveBeenCalledWith(ID_OK);
  });

  it('PATCH /tipos-atendimento/:id/ativar -> ok (200)', async () => {
    mockService.ativar.mockResolvedValueOnce({
      id_tipo_atendimento: ID_OK,
      status_atividade: true,
    });

    const res = await request(app).patch(`/tipos-atendimento/${ID_OK}/ativar`);

    expect(res.status).toBe(200);
    expect(res.body.status_atividade).toBe(true);
    expect(mockService.ativar).toHaveBeenCalledWith(ID_OK);
  });

  // ---------- IDs inválidos em update/inativar/ativar (controller retorna 400) ----------
  it('PUT /tipos-atendimento/:id -> id inválido (400)', async () => {
    const res = await request(app).put('/tipos-atendimento/id-invalido').send({ nome_tipo_atendimento: 'X' });

    expect(res.status).toBe(400);
    expect((res.body.error || res.body.message)).toMatch(/inválid/i);
  });

  it('PATCH /tipos-atendimento/:id/inativar -> id inválido (400)', async () => {
    const res = await request(app).patch('/tipos-atendimento/id-invalido/inativar');

    expect(res.status).toBe(400);
    expect((res.body.error || res.body.message)).toMatch(/inválid/i);
  });

  it('PATCH /tipos-atendimento/:id/ativar -> id inválido (400)', async () => {
    const res = await request(app).patch('/tipos-atendimento/id-invalido/ativar');

    expect(res.status).toBe(400);
    expect((res.body.error || res.body.message)).toMatch(/inválid/i);
  });
});
