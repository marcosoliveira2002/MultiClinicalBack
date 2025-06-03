import { TipoAtendimentoRepository } from '../repositories/tipoAtendimento.repository'; 
import { z } from 'zod';

const tipoAtendimentoSchema = z.object({
  nome_tipo_atendimento: z.string().min(1)
});

export class TipoAtendimentoService {
  private repo = new TipoAtendimentoRepository();

  async criar(data: any) {
    const parsed = tipoAtendimentoSchema.safeParse(data);
    if (!parsed.success) {
      throw { status: 400, message: 'Dados inválidos', issues: parsed.error.format() };
    }

    return this.repo.criar(parsed.data);
  }
}
