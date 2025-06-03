import { ProcedimentoRepository } from '../repositories/procedimento.repository';
import { z } from 'zod';

const procedimentoSchema = z.object({
  nome_procedimento: z.string().min(1)
});

export class ProcedimentoService {
  private repo = new ProcedimentoRepository();

  async criar(data: any) {
    const parsed = procedimentoSchema.safeParse(data);
    if (!parsed.success) {
      throw { status: 400, message: 'Dados inválidos', issues: parsed.error.format() };
    }

    return this.repo.criar(parsed.data);
  }
}
