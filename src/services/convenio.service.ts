import { ConvenioRepository } from '../repositories/convenio.repository';
import { z } from 'zod';

const convenioSchema = z.object({
  nome_convenio: z.string().min(1),
  valor_coparticipacao: z.coerce.number().nonnegative(),
  telefone_convenio: z.string().min(8),
  nome_contato_convenio: z.string().min(1),
  email_contato_convenio: z.string().email()
});

export class ConvenioService {
  private repo = new ConvenioRepository();

  async criar(data: any) {
    const parsed = convenioSchema.safeParse(data);
    if (!parsed.success) {
      throw { status: 400, message: 'Dados inválidos', issues: parsed.error.format() };
    }

    const existente = await this.repo.buscarPorEmail(parsed.data.email_contato_convenio);
    if (existente) {
      throw { status: 400, message: 'Email já cadastrado' };
    }

    return this.repo.criar(parsed.data);
  }
}
