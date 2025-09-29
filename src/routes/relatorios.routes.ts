import { Router } from "express";

import { auth } from "@/middlewares/auth";
import { RelatorioAtendimentosController } from "@/controllers/relatorios.controller";

const router = Router();

router.get("/relatorios/atendimentos", auth, RelatorioAtendimentosController.list);

export default router;
