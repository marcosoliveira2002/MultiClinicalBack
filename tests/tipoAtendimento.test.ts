import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/prismaClient';

describe('Cadastro de Tipo de Atendimento', () => {
  const rota = '/tipos-atendimento';

  beforeAll(async () => {
    await prisma.tipoAtendimento.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('Deve cadastrar um tipo de atendimento com sucesso', async () => {
    const response = await request(app).post(rota).send({
      nome_tipo_atendimento: 'Consulta'
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id_tipo_atendimento');
  });

  it('Deve retornar erro ao cadastrar com nome vazio', async () => {
    const response = await request(app).post(rota).send({
      nome_tipo_atendimento: ''
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Dados inválidos');
  });
});
