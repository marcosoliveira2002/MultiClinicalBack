import { Request, Response } from 'express';
import { ClinicaService } from '../services/clinica.service';

const clinicaService = new ClinicaService();

export class ClinicaController {
  criar = async (req: Request, res: Response) => {
    try {
      const clinica = await clinicaService.criar(req.body);
      return res.status(201).json(clinica);
    } catch (err: any) {
      return res.status(err.status || 500).json({ message: err.message || 'Erro interno', details: err.issues });
    }
  };
}
