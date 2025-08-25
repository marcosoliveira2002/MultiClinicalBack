import { Router } from "express";
import { TipoAtendimentoController } from "../controllers/tipoAtendimento.controller";
import { auth } from "../middlewares/auth";


const router = Router();


router.post("/", auth, TipoAtendimentoController.create);
router.get("/", auth, TipoAtendimentoController.list);
router.get("/:id", auth, TipoAtendimentoController.getById);
router.put("/:id", auth, TipoAtendimentoController.update);
router.patch("/:id/inativar", auth, TipoAtendimentoController.inativar);
router.patch("/:id/ativar", auth, TipoAtendimentoController.ativar);


export default router;