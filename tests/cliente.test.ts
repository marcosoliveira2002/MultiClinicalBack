import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/prismaClient';

describe('Cadastro de Cliente', () => {
  const rota = '/clientes';

  beforeAll(async () => {
    await prisma.cliente.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('Deve cadastrar um cliente com sucesso', async () => {
    const response = await request(app).post(rota).send({
      nome_cliente: 'Maria Silva',
      cpf: '12345678900',
      data_nascimento: '1990-01-01',
      telefone: '67999999999'
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id_cliente');
  });

  it('Não deve permitir cadastro com CPF duplicado', async () => {
    const response = await request(app).post(rota).send({
      nome_cliente: 'Maria Silva 2',
      cpf: '12345678900',
      data_nascimento: '1990-01-01',
      telefone: '67988888888'
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('CPF já cadastrado');
  });

  it('Deve retornar erro ao cadastrar com dados faltando', async () => {
    const response = await request(app).post(rota).send({
      nome_cliente: 'Cliente Incompleto'
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Dados inválidos');
  });
});
