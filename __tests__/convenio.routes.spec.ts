import express from 'express';
import request from 'supertest';

// ---- Mock do Service ----
jest.mock('../src/services/convenio.service', () => {
  const mockService = {
    create: jest.fn(),
    list: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    inativar: jest.fn(),
    ativar: jest.fn(),
  };
  return {
    ConvenioService: jest.fn().mockImplementation(() => mockService),
    __mockConvenioService: mockService,
  };
});

// ---- Mock do auth ----
jest.mock('../src/middlewares/auth', () => {
  return (req: any, _res: any, next: any) => {
    req.user = { sub: '42', login: 'marcos' };
    next();
  };
});

const { __mockConvenioService: mockService } = require('../src/services/convenio.service');
import { ConvenioController } from '../src/controllers/convenio.controller';

const ID_OK = '2f1d4d2e-7e1f-4a01-b3a2-0f9a1c1d2e3f'; // UUID fixo para testes

function makeApp() {
  const app = express();
  app.use(express.json());

  const router = express.Router();
  const auth = require('../src/middlewares/auth');

  router.post('/', auth, ConvenioController.create);
  router.get('/', auth, ConvenioController.list);
  router.get('/:id', auth, ConvenioController.getById);
  router.put('/:id', auth, ConvenioController.update);
  router.patch('/:id/inativar', auth, ConvenioController.inativar);
  router.patch('/:id/ativar', auth, ConvenioController.ativar);

  app.use('/convenios', router);
  return app;
}

describe('Rotas de Convênio', () => {
  let app: express.Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = makeApp();
  });

  // ---------- CREATE ----------
  it('POST /convenios -> cria convênio (201)', async () => {
    const payload = {
      nome_convenio: 'Saúde Total',
      valor_coparticipacao: 35.5,
      telefone_convenio: '6733334444',
      nome_contato_convenio: 'João Silva',
      email_contato_convenio: 'contato@saudetotal.com',
      status_atividade: true,
    };

    const criado = {
      id_convenio: ID_OK,
      ...payload,
    };

    mockService.create.mockResolvedValueOnce(criado);

    const res = await request(app).post('/convenios').send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id_convenio: ID_OK, nome_convenio: payload.nome_convenio });
    expect(mockService.create).toHaveBeenCalledWith(payload);
  });

  it('POST /convenios -> dados inválidos (400)', async () => {
    mockService.create.mockRejectedValueOnce({
      status: 400,
      message: 'Dados inválidos',
    });

    const res = await request(app).post('/convenios').send({
      nome_convenio: 'AB',                // < 3
      valor_coparticipacao: -1,          // negativo
      telefone_convenio: '123',          // curto
      nome_contato_convenio: 'X',        // < 3
      email_contato_convenio: 'invalido' // email inválido
    });

    expect(res.status).toBe(400);
    expect(typeof (res.body.error || res.body.message)).toBe('string');
  });

  // ---------- LIST ----------
  it('GET /convenios -> lista (200)', async () => {
    mockService.list.mockResolvedValueOnce({
      items: [
        { id_convenio: 'v1', nome_convenio: 'A', valor_coparticipacao: 10, telefone_convenio: '11111111', nome_contato_convenio: 'Resp A', email_contato_convenio: 'a@a.com', status_atividade: true },
        { id_convenio: 'v2', nome_convenio: 'B', valor_coparticipacao: 15, telefone_convenio: '22222222', nome_contato_convenio: 'Resp B', email_contato_convenio: 'b@b.com', status_atividade: true },
      ],
      page: 1,
      limit: 10,
      total: 2,
    });

    const res = await request(app).get('/convenios').query({ page: 1, limit: 10 });

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(2);
    expect(mockService.list).toHaveBeenCalled();
  });

  // ---------- GET BY ID ----------
  it('GET /convenios/:id -> encontrado (200)', async () => {
    mockService.getById.mockResolvedValueOnce({
      id_convenio: ID_OK,
      nome_convenio: 'Saúde Total',
      valor_coparticipacao: 35.5,
      telefone_convenio: '6733334444',
      nome_contato_convenio: 'João Silva',
      email_contato_convenio: 'contato@saudetotal.com',
      status_atividade: true,
    });

    const res = await request(app).get(`/convenios/${ID_OK}`);

    expect(res.status).toBe(200);
    expect(res.body.id_convenio).toBe(ID_OK);
    expect(mockService.getById).toHaveBeenCalledWith(ID_OK);
  });

  it('GET /convenios/:id -> não encontrado (404)', async () => {
    // Controller SEMPRE responde 404 no catch do getById
    mockService.getById.mockRejectedValueOnce({ status: 404, message: 'Convênio não encontrado' });

    const res = await request(app).get(`/convenios/${ID_OK}`);

    expect(res.status).toBe(404);
    expect((res.body.error || res.body.message)).toMatch(/não encontrad/i);
  });

  // (Se quiser testar "id inválido", também cairá no catch => 404)
  it('GET /convenios/:id -> id inválido (404)', async () => {
    mockService.getById.mockRejectedValueOnce({ status: 400, message: 'id inválido' });

    const res = await request(app).get('/convenios/id-invalido');

    expect(res.status).toBe(404); // por causa do catch do controller
    expect((res.body.error || res.body.message)).toMatch(/inválid/i);
  });

  // ---------- UPDATE ----------
  it('PUT /convenios/:id -> atualiza (200)', async () => {
    mockService.update.mockResolvedValueOnce({
      id_convenio: ID_OK,
      nome_convenio: 'Saúde Total Plus',
      valor_coparticipacao: 40,
      telefone_convenio: '6799999999',
      nome_contato_convenio: 'João Silva',
      email_contato_convenio: 'contato@saudetotal.com',
      status_atividade: true,
    });

    const res = await request(app)
      .put(`/convenios/${ID_OK}`)
      .send({ nome_convenio: 'Saúde Total Plus', valor_coparticipacao: 40 });

    expect(res.status).toBe(200);
    expect(res.body.nome_convenio).toBe('Saúde Total Plus');
    expect(mockService.update).toHaveBeenCalledWith(ID_OK, { nome_convenio: 'Saúde Total Plus', valor_coparticipacao: 40 });
  });

  it('PUT /convenios/:id -> validação (400)', async () => {
    mockService.update.mockRejectedValueOnce({
      status: 400,
      message: 'Dados inválidos',
    });

    const res = await request(app).put(`/convenios/${ID_OK}`).send({ nome_convenio: 'A', valor_coparticipacao: -1 });

    expect(res.status).toBe(400);
    expect(typeof (res.body.error || res.body.message)).toBe('string');
  });

  // ---------- INATIVAR / ATIVAR ----------
  it('PATCH /convenios/:id/inativar -> ok (200)', async () => {
    mockService.inativar.mockResolvedValueOnce({
      id_convenio: ID_OK,
      status_atividade: false,
    });

    const res = await request(app).patch(`/convenios/${ID_OK}/inativar`);

    expect(res.status).toBe(200);
    expect(res.body.status_atividade).toBe(false);
    expect(mockService.inativar).toHaveBeenCalledWith(ID_OK);
  });

  it('PATCH /convenios/:id/ativar -> ok (200)', async () => {
    mockService.ativar.mockResolvedValueOnce({
      id_convenio: ID_OK,
      status_atividade: true,
    });

    const res = await request(app).patch(`/convenios/${ID_OK}/ativar`);

    expect(res.status).toBe(200);
    expect(res.body.status_atividade).toBe(true);
    expect(mockService.ativar).toHaveBeenCalledWith(ID_OK);
  });
});
