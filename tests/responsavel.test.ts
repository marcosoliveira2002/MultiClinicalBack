import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/prismaClient';

describe('Cadastro de Responsável', () => {
  const rota = '/responsaveis';

  beforeAll(async () => {
    await prisma.responsavel.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('Deve cadastrar um responsável com sucesso', async () => {
    const response = await request(app).post(rota).send({
      nome_responsavel: 'Carlos Souza',
      telefone: '67999999999'
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id_responsavel');
  });

  it('Deve retornar erro ao cadastrar com dados incompletos', async () => {
    const response = await request(app).post(rota).send({
      nome_responsavel: ''
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Dados inválidos');
  });
});
