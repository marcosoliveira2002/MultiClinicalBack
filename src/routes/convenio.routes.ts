import { Router } from "express";
import { ConvenioController } from "../controllers/convenio.controller";
import { auth } from "../middlewares/auth";


const router = Router();


router.post("/", auth, ConvenioController.create);
router.get("/", auth, ConvenioController.list);
router.get("/:id", auth, ConvenioController.getById);
router.put("/:id", auth, ConvenioController.update);
router.patch("/:id/inativar", auth, ConvenioController.inativar);
router.patch("/:id/ativar", auth, ConvenioController.ativar);


export default router;