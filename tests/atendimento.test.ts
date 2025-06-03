import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/prismaClient';

describe('Cadastro de Atendimento', () => {
  const rota = '/atendimentos';
  let ids: Record<string, string> = {};

  beforeAll(async () => {

    const cliente = await prisma.cliente.create({ data: { nome_cliente: 'Teste', cpf: '12345678901', data_nascimento: new Date(), telefone: '67999999999' } });
    const usuario = await prisma.usuario.create({ data: { nome_usuario: 'Usuário', login: 'user1', senha: '123', tipo_usuario: 'A', ativo: true } });
    const clinica = await prisma.clinica.create({ data: { nome_clinica: 'Clínica', taxa_repasse_clinica: 20, telefone_clinica: '67999999999', nome_responsavel: 'Resp', email_clinica: 'clinica@email.com' } });
    const convenio = await prisma.convenio.create({ data: { nome_convenio: 'Convenio X', valor_coparticipacao: 25, telefone_convenio: '67999999999', nome_contato_convenio: 'Contato', email_contato_convenio: 'convenio@email.com' } });
    const tipo = await prisma.tipoAtendimento.create({ data: { nome_tipo_atendimento: 'Consulta' } });
    const proc = await prisma.procedimento.create({ data: { nome_procedimento: 'Exame' } });

    ids = {
      id_cliente: cliente.id_cliente,
      id_usuario: usuario.id_usuario,
      id_clinica: clinica.id_clinica,
      id_convenio: convenio.id_convenio,
      id_tipo_atendimento: tipo.id_tipo_atendimento,
      id_procedimento: proc.id_procedimento
    };
  });

  afterAll(async () => {
    await prisma.atendimento.deleteMany();
    await prisma.$disconnect();
  });

  it('Deve cadastrar um atendimento com sucesso', async () => {
    const response = await request(app).post(rota).send({
      ...ids,
      valor_bruto: 150,
      observacao: 'Teste de atendimento',
      data_atendimento: new Date().toISOString()
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id_atendimento');
  });

  it('Deve retornar erro com dados faltando', async () => {
    const response = await request(app).post(rota).send({
      valor_bruto: 100
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Dados inválidos');
  });
});
