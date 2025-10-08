import express from 'express';
import request from 'supertest';

// ---- Mock do Service ----
jest.mock('../src/services/clinica.service', () => {
  const mockService = {
    create: jest.fn(),
    list: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    inativar: jest.fn(),
    ativar: jest.fn(),
  };
  return {
    ClinicaService: jest.fn().mockImplementation(() => mockService),
    __mockClinicaService: mockService,
  };
});

// ---- Mock do auth ----
jest.mock('../src/middlewares/auth', () => {
  return (req: any, _res: any, next: any) => {
    req.user = { sub: '42', login: 'marcos' };
    next();
  };
});

const { __mockClinicaService: mockService } = require('../src/services/clinica.service');
import { ClinicaController } from '../src/controllers/clinica.controller';

const ID_OK = '2f1d4d2e-7e1f-4a01-b3a2-0f9a1c1d2e3f'; // UUID fixo

function makeApp() {
  const app = express();
  app.use(express.json());

  const router = express.Router();
  const auth = require('../src/middlewares/auth');

  router.post('/', auth, ClinicaController.create);
  router.get('/', auth, ClinicaController.list);
  router.get('/:id', auth, ClinicaController.getById);
  router.put('/:id', auth, ClinicaController.update);
  router.patch('/:id/inativar', auth, ClinicaController.inativar);
  router.patch('/:id/ativar', auth, ClinicaController.ativar);

  app.use('/clinicas', router);
  return app;
}

describe('Rotas de Clínica', () => {
  let app: express.Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = makeApp();
  });

  // ---------- CREATE ----------
  it('POST /clinicas -> cria clínica (201)', async () => {
    const payload = {
      nome_clinica: 'Clínica Boa Saúde',
      taxa_repasse_clinica: 20.5,
      telefone_clinica: '6733334444',
      nome_responsavel: 'Dra. Ana',
      email_clinica: 'contato@boasaude.com',
      status_atividade: true,
    };

    const criado = {
      id_clinica: ID_OK,
      ...payload,
    };

    mockService.create.mockResolvedValueOnce(criado);

    const res = await request(app).post('/clinicas').send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id_clinica: ID_OK, nome_clinica: payload.nome_clinica });
    expect(mockService.create).toHaveBeenCalledWith(payload);
  });

  it('POST /clinicas -> dados inválidos (400)', async () => {
    mockService.create.mockRejectedValueOnce({
      status: 400,
      message: 'Dados inválidos',
    });

    const res = await request(app).post('/clinicas').send({
      nome_clinica: 'AB',                 // < 3
      taxa_repasse_clinica: -1,          // negativo
      telefone_clinica: '123',           // curto
      nome_responsavel: 'X',             // < 3
      email_clinica: 'email-invalido',
    });

    expect(res.status).toBe(400);
    expect(typeof (res.body.error || res.body.message)).toBe('string');
  });

  // ---------- LIST ----------
  it('GET /clinicas -> lista (200)', async () => {
    mockService.list.mockResolvedValueOnce({
      items: [
        { id_clinica: 'c1', nome_clinica: 'A', taxa_repasse_clinica: 10, telefone_clinica: '11111111', email_clinica: 'a@a.com', nome_responsavel: 'Resp A', status_atividade: true },
        { id_clinica: 'c2', nome_clinica: 'B', taxa_repasse_clinica: 15, telefone_clinica: '22222222', email_clinica: 'b@b.com', nome_responsavel: 'Resp B', status_atividade: true },
      ],
      page: 1,
      limit: 10,
      total: 2,
    });

    const res = await request(app).get('/clinicas').query({ page: 1, limit: 10 });

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(2);
    expect(mockService.list).toHaveBeenCalled();
  });

  // ---------- GET BY ID ----------
  it('GET /clinicas/:id -> encontrado (200)', async () => {
    mockService.getById.mockResolvedValueOnce({
      id_clinica: ID_OK,
      nome_clinica: 'Clínica Boa Saúde',
      taxa_repasse_clinica: 20.5,
      telefone_clinica: '6733334444',
      nome_responsavel: 'Dra. Ana',
      email_clinica: 'contato@boasaude.com',
      status_atividade: true,
    });

    const res = await request(app).get(`/clinicas/${ID_OK}`);

    expect(res.status).toBe(200);
    expect(res.body.id_clinica).toBe(ID_OK);
    expect(mockService.getById).toHaveBeenCalledWith(ID_OK);
  });

  it('GET /clinicas/:id -> não encontrado (404)', async () => {
    mockService.getById.mockRejectedValueOnce({ status: 404, message: 'Clínica não encontrada' });

    const res = await request(app).get(`/clinicas/${ID_OK}`);

    expect(res.status).toBe(404);
    expect((res.body.error || res.body.message)).toMatch(/não encontrad/i);
  });

  it('GET /clinicas/:id -> id inválido (controller retorna 404)', async () => {
    const res = await request(app).get('/clinicas/id-invalido');

    expect(res.status).toBe(404);
    expect((res.body.error || res.body.message)).toMatch(/inválid/i);
  });

  // ---------- UPDATE ----------
  it('PUT /clinicas/:id -> atualiza (200)', async () => {
    mockService.update.mockResolvedValueOnce({
      id_clinica: ID_OK,
      nome_clinica: 'Clínica Atualizada',
      taxa_repasse_clinica: 22,
      telefone_clinica: '6799999999',
      nome_responsavel: 'Dra. Ana',
      email_clinica: 'contato@boasaude.com',
      status_atividade: true,
    });

    const res = await request(app)
      .put(`/clinicas/${ID_OK}`)
      .send({ nome_clinica: 'Clínica Atualizada', taxa_repasse_clinica: 22 });

    expect(res.status).toBe(200);
    expect(res.body.nome_clinica).toBe('Clínica Atualizada');
    expect(mockService.update).toHaveBeenCalledWith(ID_OK, { nome_clinica: 'Clínica Atualizada', taxa_repasse_clinica: 22 });
  });

  it('PUT /clinicas/:id -> validação (400)', async () => {
    mockService.update.mockRejectedValueOnce({
      status: 400,
      message: 'Dados inválidos',
    });

    const res = await request(app).put(`/clinicas/${ID_OK}`).send({ nome_clinica: 'A', taxa_repasse_clinica: -1 });

    expect(res.status).toBe(400);
    expect(typeof (res.body.error || res.body.message)).toBe('string');
  });

  // ---------- INATIVAR / ATIVAR ----------
  it('PATCH /clinicas/:id/inativar -> ok (200)', async () => {
    mockService.inativar.mockResolvedValueOnce({
      id_clinica: ID_OK,
      status_atividade: false,
    });

    const res = await request(app).patch(`/clinicas/${ID_OK}/inativar`);

    expect(res.status).toBe(200);
    expect(res.body.status_atividade).toBe(false);
    expect(mockService.inativar).toHaveBeenCalledWith(ID_OK);
  });

  it('PATCH /clinicas/:id/ativar -> ok (200)', async () => {
    mockService.ativar.mockResolvedValueOnce({
      id_clinica: ID_OK,
      status_atividade: true,
    });

    const res = await request(app).patch(`/clinicas/${ID_OK}/ativar`);

    expect(res.status).toBe(200);
    expect(res.body.status_atividade).toBe(true);
    expect(mockService.ativar).toHaveBeenCalledWith(ID_OK);
  });
});
