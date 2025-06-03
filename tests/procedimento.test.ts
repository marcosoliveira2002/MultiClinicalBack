import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/prismaClient';

describe('Cadastro de Procedimento', () => {
  const rota = '/procedimentos';

  beforeAll(async () => {
    await prisma.procedimento.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('Deve cadastrar um procedimento com sucesso', async () => {
    const response = await request(app).post(rota).send({
      nome_procedimento: 'Exame de Sangue'
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id_procedimento');
  });

  it('Deve retornar erro ao cadastrar com nome vazio', async () => {
    const response = await request(app).post(rota).send({
      nome_procedimento: ''
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Dados inválidos');
  });
});
