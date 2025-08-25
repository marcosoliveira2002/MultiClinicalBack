import { Router } from "express";
import { ProcedimentoController } from "../controllers/procedimento.controller";
import { auth } from "../middlewares/auth";


const router = Router();


router.post("/", auth, ProcedimentoController.create);
router.get("/", auth, ProcedimentoController.list);
router.get("/:id", auth, ProcedimentoController.getById);
router.put("/:id", auth, ProcedimentoController.update);
router.patch("/:id/inativar", auth, ProcedimentoController.inativar);
router.patch("/:id/ativar", auth, ProcedimentoController.ativar);


export default router;