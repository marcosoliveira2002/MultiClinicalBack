import { Request, Response } from "express";

import { dashboardQuerySchema } from "@/validators/dashboard.validators";
import { DashboardService } from "@/services/dashboard.service";


const service = new DashboardService();

export class DashboardController {
  static async getDashboard(req: Request, res: Response) {
    try {
      const { inicio, fim } = dashboardQuerySchema.parse(req.query);
      const result = await service.getDashboard(new Date(`${inicio} 00:00:00`), new Date(`${fim} 23:59:59`));
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}
