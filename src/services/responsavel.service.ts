import { ResponsavelRepository } from '../repositories/responsavel.repository';
import { z } from 'zod';

const responsavelSchema = z.object({
  nome_responsavel: z.string().min(1),
  telefone: z.string().min(8)
});

export class ResponsavelService {
  private repo = new ResponsavelRepository();

  async criar(data: any) {
    const parsed = responsavelSchema.safeParse(data);
    if (!parsed.success) {
      throw { status: 400, message: 'Dados inválidos', issues: parsed.error.format() };
    }

    return this.repo.criar(parsed.data);
  }
}
