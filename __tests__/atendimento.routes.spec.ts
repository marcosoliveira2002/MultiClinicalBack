import express from 'express';
import request from 'supertest';

// ---- Mock do Service ----
jest.mock('../src/services/atendimento.service', () => {
  const mockService = {
    create: jest.fn(),
    list: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
  return {
    AtendimentoService: jest.fn().mockImplementation(() => mockService),
    __mockAtendimentoService: mockService,
  };
});

// ---- Mock do auth (por padrão AUTENTICA) ----
jest.mock('../src/middlewares/auth', () => {
  return (req: any, _res: any, next: any) => {
    // simulando user de token
    req.user = { sub: '9d3b6a3e-2c2b-4f5a-9b1f-1234567890ab' };
    next();
  };
});

const { __mockAtendimentoService: mockService } = require('../src/services/atendimento.service');
import { AtendimentoController } from '../src/controllers/atendimento.controller';

const ID_OK = '2f1d4d2e-7e1f-4a01-b3a2-0f9a1c1d2e3f'; // UUID fixo p/ entidade
const ID_USUARIO = '9d3b6a3e-2c2b-4f5a-9b1f-1234567890ab'; // mesmo do mock acima

const ID_CONVENIO = '11111111-1111-4111-8111-111111111111';
const ID_PROCED = '22222222-2222-4222-8222-222222222222';
const ID_CLINICA = '33333333-3333-4333-8333-333333333333';
const ID_TIPOAT = '44444444-4444-4444-8444-444444444444';

function makeApp(authOverride?: express.RequestHandler) {
  const app = express();
  app.use(express.json());

  const router = express.Router();
  const auth = authOverride ?? require('../src/middlewares/auth');

  router.post('/', auth, AtendimentoController.create);
  router.get('/', auth, AtendimentoController.list);
  router.get('/:id', auth, AtendimentoController.getById);
  router.put('/:id', auth, AtendimentoController.update);
  router.delete('/:id', auth, AtendimentoController.remove);

  app.use('/atendimentos', router);
  return app;
}

describe('Rotas de Atendimentos', () => {
  let app: express.Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = makeApp(); // com auth padrão (autenticado)
  });

  // ---------- CREATE ----------
  it('POST /atendimentos -> cria (201)', async () => {
    const payload = {
      cpf_cliente: '529.982.247-25', // será transformado para '52998224725' e verificado length 11
      nome_cliente: 'Paciente Teste',
      id_convenio: ID_CONVENIO,
      id_procedimento: ID_PROCED,
      id_clinica: ID_CLINICA,
      id_tipo_atendimento: ID_TIPOAT,
      valor_bruto: 100,
      desconto: 5,
      observacao: 'obs',
      data_atendimento: '2025-01-15',
    };

    const criado = {
      id_atendimento: ID_OK,
      ...payload,
      cpf_cliente: '52998224725',
      data_atendimento: new Date('2025-01-15').toISOString(),
      id_usuario: ID_USUARIO,
    };

    mockService.create.mockResolvedValueOnce(criado);

    const res = await request(app).post('/atendimentos').send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id_atendimento: ID_OK });

    // Service recebe cpf sem máscara e data como Date + userId do req.user
    expect(mockService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        cpf_cliente: '52998224725',
        nome_cliente: 'Paciente Teste',
        id_convenio: ID_CONVENIO,
        id_procedimento: ID_PROCED,
        id_clinica: ID_CLINICA,
        id_tipo_atendimento: ID_TIPOAT,
        valor_bruto: 100,
        desconto: 5,
        observacao: 'obs',
        data_atendimento: new Date('2025-01-15'),
      }),
      ID_USUARIO
    );
  });

  it('POST /atendimentos -> 401 quando sem usuário no req', async () => {
    // monta um app com um "auth" que NÃO injeta req.user
    const appNoAuthUser = makeApp((_req, _res, next) => next());

    const res = await request(appNoAuthUser).post('/atendimentos').send({
      cpf_cliente: '52998224725',
      id_convenio: ID_CONVENIO,
      id_procedimento: ID_PROCED,
      id_clinica: ID_CLINICA,
      id_tipo_atendimento: ID_TIPOAT,
      valor_bruto: 100,
      data_atendimento: '2025-01-15',
    });

    expect(res.status).toBe(401);
    expect((res.body.error || res.body.message)).toMatch(/não autenticad/i);
    expect(mockService.create).not.toHaveBeenCalled();
  });

  it('POST /atendimentos -> validação (400)', async () => {
    const res = await request(app).post('/atendimentos').send({
      cpf_cliente: '123', // inválido
      id_convenio: 'nao-uuid',
      id_procedimento: ID_PROCED,
      id_clinica: ID_CLINICA,
      id_tipo_atendimento: ID_TIPOAT,
      valor_bruto: 100,
      desconto: 200, // > valor_bruto
      data_atendimento: 'data-ruim',
    });

    expect(res.status).toBe(400);
    expect(typeof (res.body.error || res.body.message)).toBe('string');
  });

  // ---------- LIST ----------
  it('GET /atendimentos -> lista (200)', async () => {
    mockService.list.mockResolvedValueOnce({
      items: [
        { id_atendimento: 'a1', valor_bruto: 100, desconto: 0, data_atendimento: new Date().toISOString() },
        { id_atendimento: 'a2', valor_bruto: 200, desconto: 10, data_atendimento: new Date().toISOString() },
      ],
      page: 1,
      limit: 10,
      total: 2,
    });

    const res = await request(app).get('/atendimentos').query({ page: 1, limit: 10 });

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(2);
    expect(mockService.list).toHaveBeenCalled();
  });

  // ---------- GET BY ID ----------
  it('GET /atendimentos/:id -> encontrado (200)', async () => {
    mockService.getById.mockResolvedValueOnce({
      id_atendimento: ID_OK,
      valor_bruto: 100,
      desconto: 0,
      data_atendimento: new Date('2025-01-15').toISOString(),
    });

    const res = await request(app).get(`/atendimentos/${ID_OK}`);

    expect(res.status).toBe(200);
    expect(res.body.id_atendimento).toBe(ID_OK);
    expect(mockService.getById).toHaveBeenCalledWith(ID_OK);
  });

  it('GET /atendimentos/:id -> não encontrado (404)', async () => {
    mockService.getById.mockRejectedValueOnce({ status: 404, message: 'Atendimento não encontrado' });

    const res = await request(app).get(`/atendimentos/${ID_OK}`);

    expect(res.status).toBe(404);
    expect((res.body.error || res.body.message)).toMatch(/não encontrad/i);
  });

  it('GET /atendimentos/:id -> id inválido (404 pelo controller)', async () => {
    const res = await request(app).get('/atendimentos/id-invalido');

    expect(res.status).toBe(404);
    expect((res.body.error || res.body.message)).toMatch(/inválid/i);
  });

  // ---------- UPDATE ----------
  it('PUT /atendimentos/:id -> atualiza (200)', async () => {
    mockService.update.mockResolvedValueOnce({
      id_atendimento: ID_OK,
      valor_bruto: 150,
      desconto: 10,
      data_atendimento: new Date('2025-02-01').toISOString(),
    });

    const res = await request(app)
      .put(`/atendimentos/${ID_OK}`)
      .send({ valor_bruto: 150, desconto: 10, data_atendimento: '2025-02-01' });

    expect(res.status).toBe(200);
    expect(res.body.valor_bruto).toBe(150);
    expect(mockService.update).toHaveBeenCalledWith(
      ID_OK,
      expect.objectContaining({
        valor_bruto: 150,
        desconto: 10,
        data_atendimento: new Date('2025-02-01'),
      })
    );
  });

  it('PUT /atendimentos/:id -> validação (400)', async () => {
    const res = await request(app)
      .put(`/atendimentos/${ID_OK}`)
      .send({ valor_bruto: 100, desconto: 200 }); // desconto > valor

    expect(res.status).toBe(400);
    expect(typeof (res.body.error || res.body.message)).toBe('string');
  });

  it('PUT /atendimentos/:id -> id inválido (400)', async () => {
    const res = await request(app)
      .put('/atendimentos/id-invalido')
      .send({ valor_bruto: 100 });

    expect(res.status).toBe(400);
    expect((res.body.error || res.body.message)).toMatch(/inválid/i);
  });

  // ---------- DELETE ----------
  it('DELETE /atendimentos/:id -> remove (204)', async () => {
    mockService.remove.mockResolvedValueOnce(undefined);

    const res = await request(app).delete(`/atendimentos/${ID_OK}`);

    expect(res.status).toBe(204);
    expect(res.text).toBe('');
    expect(mockService.remove).toHaveBeenCalledWith(ID_OK);
  });

  it('DELETE /atendimentos/:id -> id inválido (400)', async () => {
    const res = await request(app).delete('/atendimentos/id-invalido');

    expect(res.status).toBe(400);
    expect((res.body.error || res.body.message)).toMatch(/inválid/i);
  });
});
