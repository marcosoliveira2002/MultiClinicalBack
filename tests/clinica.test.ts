import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/prismaClient';

describe('Cadastro de Clínica', () => {
  const rota = '/clinicas';

  beforeAll(async () => {
    await prisma.clinica.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('Deve cadastrar uma clínica com sucesso', async () => {
    const response = await request(app).post(rota).send({
      nome_clinica: 'Clínica Bem Estar',
      taxa_repasse_clinica: 20.5,
      telefone_clinica: '67999999999',
      nome_responsavel: 'Dra. Maria',
      email_clinica: 'bemestar@clinica.com'
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id_clinica');
  });

  it('Não deve permitir email duplicado', async () => {
    const response = await request(app).post(rota).send({
      nome_clinica: 'Outra Clínica',
      taxa_repasse_clinica: 15,
      telefone_clinica: '67988888888',
      nome_responsavel: 'Dr. João',
      email_clinica: 'bemestar@clinica.com'
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Email já cadastrado');
  });

  it('Deve retornar erro com dados incompletos', async () => {
    const response = await request(app).post(rota).send({
      nome_clinica: ''
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Dados inválidos');
  });
});
