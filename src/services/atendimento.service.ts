import { AtendimentoRepository } from '../repositories/atendimento.repository';
import { z } from 'zod';

const atendimentoSchema = z.object({
  id_cliente: z.string().uuid(),
  id_convenio: z.string().uuid(),
  id_procedimento: z.string().uuid(),
  id_clinica: z.string().uuid(),
  id_tipo_atendimento: z.string().uuid(),
  id_usuario: z.string().uuid(),
  valor_bruto: z.coerce.number().nonnegative(),
  observacao: z.string().optional(),
  data_atendimento: z.coerce.date()
});

export class AtendimentoService {
  private repo = new AtendimentoRepository();

  async criar(data: any) {
    const parsed = atendimentoSchema.safeParse(data);
    if (!parsed.success) {
      throw { status: 400, message: 'Dados inválidos', issues: parsed.error.format() };
    }

    return this.repo.criar(parsed.data);
  }
}
