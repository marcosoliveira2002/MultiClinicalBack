import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/prismaClient';

describe('Cadastro de Usuário', () => {
  const rota = '/usuarios';

  beforeAll(async () => {
    await prisma.usuario.deleteMany(); // Limpa antes dos testes
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('Deve cadastrar um usuário com sucesso', async () => {
    const response = await request(app).post(rota).send({
      nome_usuario: "João Silva",
      login: "joao",
      senha: "123456",
      tipo_usuario: "A",
      ativo: true
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id_usuario');
  });

  it('Não deve permitir login duplicado', async () => {
    const response = await request(app).post(rota).send({
      nome_usuario: "João Silva 2",
      login: "joao", 
      senha: "123456",
      tipo_usuario: "A",
      ativo: true
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Login já está em uso');
  });

  it('Deve falhar ao cadastrar com campos faltando', async () => {
    const response = await request(app).post(rota).send({
      login: "novoLogin"

    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Dados inválidos');
    expect(response.body.details).toBeDefined();
  });
});
