import express from 'express';
import request from 'supertest';

// 👉 1) Mock do Service SEM depender de variável externa
jest.mock('../src/services/usuario.service', () => {
  const mockService = {
    criar: jest.fn(),
    login: jest.fn(),
    me: jest.fn(),
    listar: jest.fn(),
    obterPorId: jest.fn(),
    atualizar: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  };
  return {
    // a controller chama "new UsuarioService()" -> devolvemos o mock
    UsuarioService: jest.fn().mockImplementation(() => mockService),
    // expomos o mock pra usar nos testes:
    __mockService: mockService,
  };
});

// 👉 2) Mock do auth
jest.mock('../src/middlewares/auth', () => {
  return (req: any, _res: any, next: any) => {
    req.user = { sub: '42', login: 'marcos' };
    next();
  };
});

// Pega a referência do mock exposta acima
// (precisa usar require para pegar o "extra" exportado no mock)
const { __mockService: mockService } = require('../src/services/usuario.service');

// importa controller DEPOIS dos mocks
import { UsuarioController } from '../src/controllers/usuario.controller';

function makeApp() {
  const app = express();
  app.use(express.json());

  const controller = new UsuarioController();
  const router = express.Router();
  router.post('/', controller.criar);
  router.post('/login', controller.login);
  router.post('/forgot-password', controller.forgotPassword);
  router.post('/reset-password', controller.resetPassword);

  const auth = require('../src/middlewares/auth');
  router.get('/', auth, controller.listar);
  router.get('/me', auth, controller.me.bind(controller));
  router.get('/:id', auth, controller.buscarPorId);
  router.put('/:id', auth, controller.atualizar);

  app.use('/usuarios', router);
  return app;
}

describe('Rotas de Usuário', () => {
  let app: express.Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = makeApp();
  });

  it('POST /usuarios -> criar (201)', async () => {
    mockService.criar.mockResolvedValueOnce({
      id_usuario: '1',
      nome_usuario: 'Marcos',
      email: 'marcos@test.com',
    });

    const res = await request(app).post('/usuarios').send({
      nome: 'Marcos',
      email: 'marcos@test.com',
      senha: '123456',
    });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id_usuario: '1',
      nome_usuario: 'Marcos',
      email: 'marcos@test.com',
    });
    expect(mockService.criar).toHaveBeenCalledWith({
      nome: 'Marcos',
      email: 'marcos@test.com',
      senha: '123456',
    });
  });

  it('POST /usuarios -> criar (erro de validação/status customizado)', async () => {
    mockService.criar.mockRejectedValueOnce({
      status: 400,
      message: 'Email inválido',
      issues: [{ path: 'email', message: 'formato inválido' }],
    });

    const res = await request(app).post('/usuarios').send({
      nome: 'X',
      email: 'not-an-email',
      senha: '123',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Email inválido');
    expect(res.body.details).toBeDefined();
  });

  it('POST /usuarios/login -> sucesso (200)', async () => {
    mockService.login.mockResolvedValueOnce({
      token: 'jwt-teste',
      usuario: { id_usuario: 1, nome_usuario: 'Marcos', email: 'm@test.com' },
    });

    const res = await request(app).post('/usuarios/login').send({
      email: 'm@test.com',
      senha: '123456',
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBe('jwt-teste');
    expect(mockService.login).toHaveBeenCalledWith({
      email: 'm@test.com',
      senha: '123456',
    });
  });

  it('POST /usuarios/login -> credenciais inválidas', async () => {
    mockService.login.mockRejectedValueOnce({
      status: 401,
      message: 'Credenciais inválidas',
    });

    const res = await request(app).post('/usuarios/login').send({
      email: 'm@test.com',
      senha: 'errada',
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Credenciais inválidas');
  });

  it('POST /usuarios/forgot-password -> resposta genérica mesmo com 400 interno', async () => {
    // controller deve responder 200 e mensagem genérica se service lançar 400
    mockService.forgotPassword.mockRejectedValueOnce({
      status: 400,
      message: 'E-mail inválido',
    });

    const res = await request(app).post('/usuarios/forgot-password').send({
      email: 'invalido',
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/Se existir uma conta/);
  });

  it('POST /usuarios/forgot-password -> sucesso (200)', async () => {
    mockService.forgotPassword.mockResolvedValueOnce({
      message: 'Se existir uma conta, enviaremos um e-mail.',
    });

    const res = await request(app).post('/usuarios/forgot-password').send({
      email: 'm@test.com',
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Se existir uma conta, enviaremos um e-mail.');
  });

  it('POST /usuarios/reset-password -> sucesso (200)', async () => {
    mockService.resetPassword.mockResolvedValueOnce({
      message: 'Senha redefinida com sucesso',
    });

    const res = await request(app).post('/usuarios/reset-password').send({
      token: 'abc',
      novaSenha: '12345678',
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Senha redefinida com sucesso');
    expect(mockService.resetPassword).toHaveBeenCalledWith({
      token: 'abc',
      novaSenha: '12345678',
    });
  });

  it('POST /usuarios/reset-password -> token inválido (400)', async () => {
    mockService.resetPassword.mockRejectedValueOnce({
      status: 400,
      message: 'Token inválido ou expirado',
    });

    const res = await request(app).post('/usuarios/reset-password').send({
      token: 'x',
      novaSenha: '123',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Token inválido ou expirado');
  });

  // --------- PROTEGIDAS ---------

  it('GET /usuarios -> listar (200)', async () => {
    mockService.listar.mockResolvedValueOnce([
      { id_usuario: 1, nome_usuario: 'Marcos', email: 'm@test.com' },
      { id_usuario: 2, nome_usuario: 'Leo', email: 'l@test.com' },
    ]);

    const res = await request(app).get('/usuarios');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(mockService.listar).toHaveBeenCalled();
  });

  it('GET /usuarios/me -> autenticado (200)', async () => {
    mockService.me.mockResolvedValueOnce({
      id_usuario: 42,
      nome_usuario: 'Marcos',
      email: 'm@test.com',
    });

    const res = await request(app).get('/usuarios/me');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      message: 'Usuário autenticado',
      usuario: { id: 42, nome: 'Marcos', email: 'm@test.com' },
    });
    expect(mockService.me).toHaveBeenCalledWith('42'); // veio de req.user.sub
  });

  it('GET /usuarios/me -> não encontrado (404)', async () => {
    mockService.me.mockResolvedValueOnce(null);

    const res = await request(app).get('/usuarios/me');

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Usuário não encontrado');
  });

  it('GET /usuarios/:id -> buscar por id (200)', async () => {
    mockService.obterPorId.mockResolvedValueOnce({
      id_usuario: 7,
      nome_usuario: 'Fulano',
      email: 'f@test.com',
    });

    const res = await request(app).get('/usuarios/7');

    expect(res.status).toBe(200);
    expect(res.body.id_usuario).toBe(7);
    expect(mockService.obterPorId).toHaveBeenCalledWith('7');
  });

  it('GET /usuarios/:id -> service lança erro custom (404)', async () => {
    mockService.obterPorId.mockRejectedValueOnce({
      status: 404,
      message: 'Usuário não existe',
    });

    const res = await request(app).get('/usuarios/999');

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Usuário não existe');
  });

  it('PUT /usuarios/:id -> atualizar (200)', async () => {
    mockService.atualizar.mockResolvedValueOnce({
      id_usuario: 3,
      nome_usuario: 'Atualizado',
      email: 'a@test.com',
    });

    const res = await request(app)
      .put('/usuarios/3')
      .send({ nome_usuario: 'Atualizado' });

    expect(res.status).toBe(200);
    expect(res.body.nome_usuario).toBe('Atualizado');
    expect(mockService.atualizar).toHaveBeenCalledWith('3', { nome_usuario: 'Atualizado' });
  });

  it('PUT /usuarios/:id -> erro de validação (422)', async () => {
    mockService.atualizar.mockRejectedValueOnce({
      status: 422,
      message: 'Dados inválidos',
      issues: [{ path: 'email', message: 'já utilizado' }],
    });

    const res = await request(app).put('/usuarios/3').send({ email: 'duplicado@test.com' });

    expect(res.status).toBe(422);
    expect(res.body.message).toBe('Dados inválidos');
    expect(res.body.details).toBeDefined();
  });
});
