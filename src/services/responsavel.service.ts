import { ResponsavelRepository } from '../repositories/responsavel.repository';
import { z } from 'zod';
const repo = new ResponsavelRepository();
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

  async delete(id: string) {
    
    const responsavel = await repo.findById(id);
    if (!responsavel) {
      throw new Error("Responsável não encontrado.");
    }

    // se você usou onDelete: SetNull no Prisma, isso aqui já é o suficiente:
    await repo.delete(id);

    return { message: "Responsável removido com sucesso." };
  }
}
