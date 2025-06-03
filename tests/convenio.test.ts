import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/prismaClient';

describe('Cadastro de Convênio', () => {
  const rota = '/convenios';

  beforeAll(async () => {
    await prisma.convenio.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('Deve cadastrar um convênio com sucesso', async () => {
    const response = await request(app).post(rota).send({
      nome_convenio: 'Plano Saúde X',
      valor_coparticipacao: 25.0,
      telefone_convenio: '67988887777',
      nome_contato_convenio: 'Ana Costa',
      email_contato_convenio: 'ana@planosaudex.com'
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id_convenio');
  });

  it('Não deve permitir email de contato duplicado', async () => {
    const response = await request(app).post(rota).send({
      nome_convenio: 'Outro Plano',
      valor_coparticipacao: 30,
      telefone_convenio: '67988776655',
      nome_contato_convenio: 'Carlos Lima',
      email_contato_convenio: 'ana@planosaudex.com'
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Email já cadastrado');
  });

  it('Deve retornar erro com dados inválidos', async () => {
    const response = await request(app).post(rota).send({
      nome_convenio: '',
      valor_coparticipacao: -1,
      telefone_convenio: '',
      nome_contato_convenio: '',
      email_contato_convenio: 'emailinvalido'
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Dados inválidos');
  });
});
