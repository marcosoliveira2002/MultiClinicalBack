import { ClienteRepository } from '../repositories/cliente.repository';
import { z } from 'zod';

const clienteSchema = z.object({
  nome_cliente: z.string().min(1),
  cpf: z.string().min(11).max(14),
  data_nascimento: z.coerce.date(),
  telefone: z.string().min(8)
});

export class ClienteService {
  private repo = new ClienteRepository();

  async criar(data: any) {
    const parsed = clienteSchema.safeParse(data);
    if (!parsed.success) {
      throw { status: 400, message: 'Dados inválidos', issues: parsed.error.format() };
    }

    const { cpf } = parsed.data;
    const existente = await this.repo.buscarPorCpf(cpf);

    if (existente) {
      throw { status: 400, message: 'CPF já cadastrado' };
    }

    return this.repo.criar(parsed.data);
  }
}
