import { ClinicaRepository } from '../repositories/clinica.repository';
import { z } from 'zod';

const clinicaSchema = z.object({
  nome_clinica: z.string().min(1),
  taxa_repasse_clinica: z.coerce.number().nonnegative(),
  telefone_clinica: z.string().min(8),
  nome_responsavel: z.string().min(1),
  email_clinica: z.string().email()
});

export class ClinicaService {
  private repo = new ClinicaRepository();

  async criar(data: any) {
    const parsed = clinicaSchema.safeParse(data);
    if (!parsed.success) {
      throw { status: 400, message: 'Dados inválidos', issues: parsed.error.format() };
    }

    const existente = await this.repo.buscarPorEmail(parsed.data.email_clinica);
    if (existente) {
      throw { status: 400, message: 'Email já cadastrado' };
    }

    return this.repo.criar(parsed.data);
  }
}
