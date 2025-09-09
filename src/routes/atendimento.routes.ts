import { Router } from "express";
import { AtendimentoController } from "../controllers/atendimento.controller";
import { auth } from "../middlewares/auth";


const router = Router();


router.post("/", auth, AtendimentoController.create);
router.get("/", auth, AtendimentoController.list);
router.get("/:id", auth, AtendimentoController.getById);
router.put("/:id", auth, AtendimentoController.update);
router.delete("/:id", auth, AtendimentoController.remove); // delete real


export default router;